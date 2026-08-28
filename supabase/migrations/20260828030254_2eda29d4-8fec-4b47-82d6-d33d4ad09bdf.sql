-- Make role helpers usable by RLS policies evaluated as the signed-in user
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;

-- Admin action authorization helper
CREATE OR REPLACE FUNCTION public.can_admin_act(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin','admin','finance','compliance')
  );
$$;
GRANT EXECUTE ON FUNCTION public.can_admin_act(uuid) TO authenticated;

-- KYC review metadata on existing profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS kyc_note text,
  ADD COLUMN IF NOT EXISTS kyc_reviewed_by uuid,
  ADD COLUMN IF NOT EXISTS kyc_reviewed_at timestamptz;

-- Loans
DO $$ BEGIN
  CREATE TYPE public.loan_status AS ENUM ('pending','under_review','approved','rejected','disbursed','repaying','closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  amount_cents bigint NOT NULL CHECK (amount_cents > 0),
  purpose text NOT NULL,
  term_months smallint NOT NULL DEFAULT 12,
  interest_rate numeric NOT NULL DEFAULT 9.5,
  status public.loan_status NOT NULL DEFAULT 'pending',
  reference text NOT NULL DEFAULT concat('LN-', upper(substr(md5(random()::text), 1, 10))),
  decision_reason text,
  decided_by uuid,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.loans TO authenticated;
GRANT ALL ON public.loans TO service_role;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own loans" ON public.loans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users apply for loans" ON public.loans FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Staff read loans" ON public.loans FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE TRIGGER loans_updated_at BEFORE UPDATE ON public.loans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Internal audit writer
CREATE OR REPLACE FUNCTION public.write_audit(
  _action text, _target_user uuid, _entity text, _entity_id uuid,
  _prev jsonb, _new jsonb, _reason text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _email text;
BEGIN
  SELECT email INTO _email FROM auth.users WHERE id = auth.uid();
  INSERT INTO public.audit_logs (actor_id, actor_email, action, target_user_id, entity, entity_id, previous_state, new_state, reason)
  VALUES (auth.uid(), _email, _action, _target_user, _entity, _entity_id, _prev, _new, _reason);
END; $$;
REVOKE ALL ON FUNCTION public.write_audit(text, uuid, text, uuid, jsonb, jsonb, text) FROM PUBLIC;

-- KYC decision
CREATE OR REPLACE FUNCTION public.admin_review_kyc(_user_id uuid, _decision public.kyc_status, _reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _prev public.kyc_status;
BEGIN
  IF NOT public.can_admin_act(auth.uid()) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  SELECT kyc_status INTO _prev FROM public.profiles WHERE id = _user_id;
  IF _prev IS NULL THEN RAISE EXCEPTION 'Customer not found'; END IF;
  UPDATE public.profiles
     SET kyc_status = _decision, kyc_note = _reason, kyc_reviewed_by = auth.uid(), kyc_reviewed_at = now()
   WHERE id = _user_id;
  PERFORM public.write_audit('kyc.review', _user_id, 'profiles', _user_id,
    jsonb_build_object('kyc_status', _prev), jsonb_build_object('kyc_status', _decision), _reason);
END; $$;
GRANT EXECUTE ON FUNCTION public.admin_review_kyc(uuid, public.kyc_status, text) TO authenticated;

-- Customer status
CREATE OR REPLACE FUNCTION public.admin_set_profile_status(_user_id uuid, _status public.account_status, _reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _prev public.account_status;
BEGIN
  IF NOT public.can_admin_act(auth.uid()) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  SELECT status INTO _prev FROM public.profiles WHERE id = _user_id;
  IF _prev IS NULL THEN RAISE EXCEPTION 'Customer not found'; END IF;
  UPDATE public.profiles SET status = _status WHERE id = _user_id;
  PERFORM public.write_audit('customer.status', _user_id, 'profiles', _user_id,
    jsonb_build_object('status', _prev), jsonb_build_object('status', _status), _reason);
END; $$;
GRANT EXECUTE ON FUNCTION public.admin_set_profile_status(uuid, public.account_status, text) TO authenticated;

-- Account status
CREATE OR REPLACE FUNCTION public.admin_set_account_status(_account_id uuid, _status public.account_status, _reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _prev public.account_status; _owner uuid;
BEGIN
  IF NOT public.can_admin_act(auth.uid()) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  SELECT status, user_id INTO _prev, _owner FROM public.accounts WHERE id = _account_id;
  IF _owner IS NULL THEN RAISE EXCEPTION 'Account not found'; END IF;
  UPDATE public.accounts SET status = _status WHERE id = _account_id;
  PERFORM public.write_audit('account.status', _owner, 'accounts', _account_id,
    jsonb_build_object('status', _prev), jsonb_build_object('status', _status), _reason);
END; $$;
GRANT EXECUTE ON FUNCTION public.admin_set_account_status(uuid, public.account_status, text) TO authenticated;

-- Deposit / withdrawal decision (transactions ledger)
CREATE OR REPLACE FUNCTION public.admin_review_transaction(_txn_id uuid, _approve boolean, _reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t public.transactions%ROWTYPE; _bal bigint; _new public.txn_status;
BEGIN
  IF NOT public.can_admin_act(auth.uid()) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  SELECT * INTO t FROM public.transactions WHERE id = _txn_id FOR UPDATE;
  IF t.id IS NULL THEN RAISE EXCEPTION 'Transaction not found'; END IF;
  IF t.status NOT IN ('pending','processing') THEN RAISE EXCEPTION 'Transaction is not awaiting review'; END IF;

  _new := CASE WHEN _approve THEN 'completed'::public.txn_status ELSE 'failed'::public.txn_status END;

  IF _approve THEN
    SELECT current_cents INTO _bal FROM public.accounts WHERE id = t.account_id FOR UPDATE;
    IF t.direction = 'credit' THEN _bal := _bal + t.amount_cents;
    ELSE
      IF _bal < t.amount_cents THEN RAISE EXCEPTION 'Insufficient balance to approve'; END IF;
      _bal := _bal - t.amount_cents;
    END IF;
    UPDATE public.accounts SET current_cents = _bal, available_cents = _bal WHERE id = t.account_id;
    UPDATE public.transactions SET status = _new, running_balance_cents = _bal WHERE id = t.id;
  ELSE
    UPDATE public.transactions SET status = _new WHERE id = t.id;
  END IF;

  PERFORM public.write_audit(
    CASE WHEN t.direction = 'credit' THEN 'deposit.review' ELSE 'withdrawal.review' END,
    t.user_id, 'transactions', t.id,
    jsonb_build_object('status', t.status), jsonb_build_object('status', _new), _reason);
END; $$;
GRANT EXECUTE ON FUNCTION public.admin_review_transaction(uuid, boolean, text) TO authenticated;

-- Transfer decision
CREATE OR REPLACE FUNCTION public.admin_review_transfer(_transfer_id uuid, _approve boolean, _reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE tr public.transfers%ROWTYPE; _from bigint; _to bigint; _new public.txn_status;
BEGIN
  IF NOT public.can_admin_act(auth.uid()) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  SELECT * INTO tr FROM public.transfers WHERE id = _transfer_id FOR UPDATE;
  IF tr.id IS NULL THEN RAISE EXCEPTION 'Transfer not found'; END IF;
  IF tr.status NOT IN ('pending','processing') THEN RAISE EXCEPTION 'Transfer is not awaiting review'; END IF;

  _new := CASE WHEN _approve THEN 'completed'::public.txn_status ELSE 'failed'::public.txn_status END;

  IF _approve THEN
    IF tr.from_account_id IS NOT NULL THEN
      SELECT current_cents INTO _from FROM public.accounts WHERE id = tr.from_account_id FOR UPDATE;
      IF _from < tr.amount_cents THEN RAISE EXCEPTION 'Insufficient balance to approve'; END IF;
      _from := _from - tr.amount_cents;
      UPDATE public.accounts SET current_cents = _from, available_cents = _from WHERE id = tr.from_account_id;
      INSERT INTO public.transactions (user_id, account_id, description, type, category, direction, amount_cents, running_balance_cents, status, source)
      VALUES (tr.user_id, tr.from_account_id, 'Approved transfer', 'transfer', 'transfer', 'debit', tr.amount_cents, _from, 'completed', tr.source);
    END IF;
    IF tr.to_account_id IS NOT NULL THEN
      SELECT current_cents INTO _to FROM public.accounts WHERE id = tr.to_account_id FOR UPDATE;
      _to := _to + tr.amount_cents;
      UPDATE public.accounts SET current_cents = _to, available_cents = _to WHERE id = tr.to_account_id;
      INSERT INTO public.transactions (user_id, account_id, description, type, category, direction, amount_cents, running_balance_cents, status, source)
      VALUES (tr.user_id, tr.to_account_id, 'Approved transfer', 'transfer', 'transfer', 'credit', tr.amount_cents, _to, 'completed', tr.source);
    END IF;
    UPDATE public.transfers SET status = _new WHERE id = tr.id;
  ELSE
    UPDATE public.transfers SET status = _new, failure_reason = _reason WHERE id = tr.id;
  END IF;

  PERFORM public.write_audit('transfer.review', tr.user_id, 'transfers', tr.id,
    jsonb_build_object('status', tr.status), jsonb_build_object('status', _new), _reason);
END; $$;
GRANT EXECUTE ON FUNCTION public.admin_review_transfer(uuid, boolean, text) TO authenticated;

-- Loan decision
CREATE OR REPLACE FUNCTION public.admin_review_loan(_loan_id uuid, _status public.loan_status, _reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE l public.loans%ROWTYPE;
BEGIN
  IF NOT public.can_admin_act(auth.uid()) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  SELECT * INTO l FROM public.loans WHERE id = _loan_id FOR UPDATE;
  IF l.id IS NULL THEN RAISE EXCEPTION 'Loan not found'; END IF;
  UPDATE public.loans SET status = _status, decision_reason = _reason, decided_by = auth.uid(), decided_at = now()
   WHERE id = _loan_id;
  PERFORM public.write_audit('loan.review', l.user_id, 'loans', l.id,
    jsonb_build_object('status', l.status), jsonb_build_object('status', _status), _reason);
END; $$;
GRANT EXECUTE ON FUNCTION public.admin_review_loan(uuid, public.loan_status, text) TO authenticated;