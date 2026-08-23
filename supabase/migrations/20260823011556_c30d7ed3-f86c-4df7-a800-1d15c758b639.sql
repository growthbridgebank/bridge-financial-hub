-- ENUMS
CREATE TYPE public.app_role AS ENUM ('super_admin','admin','support','finance','compliance','read_only');
CREATE TYPE public.kyc_status AS ENUM ('unverified','pending','in_review','verified','rejected');
CREATE TYPE public.account_status AS ENUM ('pending','active','restricted','suspended','closed');
CREATE TYPE public.account_type AS ENUM ('checking','savings','investment','rewards');
CREATE TYPE public.data_source AS ENUM ('provider','test');
CREATE TYPE public.txn_status AS ENUM ('pending','processing','completed','failed','reversed','cancelled');
CREATE TYPE public.txn_direction AS ENUM ('credit','debit');
CREATE TYPE public.txn_type AS ENUM ('deposit','withdrawal','transfer','payment','reward','fee','adjustment','trade');
CREATE TYPE public.txn_category AS ENUM ('groceries','restaurants','shopping','transportation','entertainment','housing','utilities','bills','travel','healthcare','education','subscriptions','income','transfer','other');
CREATE TYPE public.reward_status AS ENUM ('pending','available','redeemed','reversed');
CREATE TYPE public.reward_type AS ENUM ('cashback','partner_offer','promotional','redemption','adjustment');
CREATE TYPE public.card_status AS ENUM ('not_issued','pending','active','frozen','reported','replaced','cancelled');
CREATE TYPE public.connection_status AS ENUM ('connected','reconnect_required','syncing','error','disconnected');
CREATE TYPE public.ticket_status AS ENUM ('open','in_progress','waiting','resolved','closed');
CREATE TYPE public.notification_category AS ENUM ('login','security','transfer','deposit','withdrawal','payment','reward','card','investment','account');
CREATE TYPE public.provider_kind AS ENUM ('banking','payment','kyc','card','brokerage','email','sms','aggregation');
CREATE TYPE public.provider_state AS ENUM ('connected','disconnected','error','configuration_required');
CREATE TYPE public.risk_profile AS ENUM ('conservative','moderate','balanced','growth','aggressive');

-- UPDATED_AT HELPER
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT,
  date_of_birth DATE,
  address_line1 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  username TEXT UNIQUE,
  kyc_status public.kyc_status NOT NULL DEFAULT 'unverified',
  status public.account_status NOT NULL DEFAULT 'pending',
  risk_profile public.risk_profile,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id);
$$;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Staff read profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ACCOUNTS
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.account_type NOT NULL,
  display_name TEXT NOT NULL,
  account_last4 TEXT,
  routing_last4 TEXT,
  status public.account_status NOT NULL DEFAULT 'pending',
  currency TEXT NOT NULL DEFAULT 'USD',
  source public.data_source NOT NULL DEFAULT 'test',
  available_cents BIGINT NOT NULL DEFAULT 0,
  current_cents BIGINT NOT NULL DEFAULT 0,
  apy NUMERIC(5,3),
  provider_reference TEXT,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX accounts_user_idx ON public.accounts(user_id);
GRANT SELECT ON public.accounts TO authenticated;
GRANT ALL ON public.accounts TO service_role;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER accounts_updated_at BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "Users read own accounts" ON public.accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Staff read accounts" ON public.accounts FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- TRANSACTIONS
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  description TEXT NOT NULL,
  merchant TEXT,
  type public.txn_type NOT NULL,
  category public.txn_category NOT NULL DEFAULT 'other',
  direction public.txn_direction NOT NULL,
  amount_cents BIGINT NOT NULL CHECK (amount_cents >= 0),
  running_balance_cents BIGINT,
  status public.txn_status NOT NULL DEFAULT 'pending',
  source public.data_source NOT NULL DEFAULT 'test',
  provider_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX transactions_user_posted_idx ON public.transactions(user_id, posted_at DESC);
CREATE INDEX transactions_account_idx ON public.transactions(account_id);
GRANT SELECT ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own transactions" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Staff read transactions" ON public.transactions FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- TRANSFERS
CREATE TABLE public.transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  to_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  external_account_id UUID,
  amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
  scheduled_for DATE NOT NULL DEFAULT CURRENT_DATE,
  memo TEXT,
  status public.txn_status NOT NULL DEFAULT 'pending',
  failure_reason TEXT,
  provider_reference TEXT,
  source public.data_source NOT NULL DEFAULT 'test',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX transfers_user_idx ON public.transfers(user_id, created_at DESC);
GRANT SELECT, INSERT ON public.transfers TO authenticated;
GRANT ALL ON public.transfers TO service_role;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER transfers_updated_at BEFORE UPDATE ON public.transfers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "Users read own transfers" ON public.transfers FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Staff read transfers" ON public.transfers FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- GOALS
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'custom',
  target_cents BIGINT NOT NULL CHECK (target_cents > 0),
  current_cents BIGINT NOT NULL DEFAULT 0 CHECK (current_cents >= 0),
  target_date DATE,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX goals_user_idx ON public.goals(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goals TO authenticated;
GRANT ALL ON public.goals TO service_role;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "Users manage own goals" ON public.goals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff read goals" ON public.goals FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- REWARDS
CREATE TABLE public.reward_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.reward_type NOT NULL,
  status public.reward_status NOT NULL DEFAULT 'pending',
  amount_cents BIGINT NOT NULL,
  description TEXT NOT NULL,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
  source public.data_source NOT NULL DEFAULT 'test',
  reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX reward_txn_user_idx ON public.reward_transactions(user_id, created_at DESC);
GRANT SELECT ON public.reward_transactions TO authenticated;
GRANT ALL ON public.reward_transactions TO service_role;
ALTER TABLE public.reward_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own rewards" ON public.reward_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Staff read rewards" ON public.reward_transactions FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- CARDS
CREATE TABLE public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  cardholder_name TEXT NOT NULL,
  last4 TEXT,
  exp_month SMALLINT,
  exp_year SMALLINT,
  status public.card_status NOT NULL DEFAULT 'not_issued',
  design TEXT NOT NULL DEFAULT 'navy_gold',
  provider_reference TEXT,
  source public.data_source NOT NULL DEFAULT 'test',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX cards_user_idx ON public.cards(user_id);
GRANT SELECT, UPDATE ON public.cards TO authenticated;
GRANT ALL ON public.cards TO service_role;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER cards_updated_at BEFORE UPDATE ON public.cards FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "Users read own cards" ON public.cards FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own cards" ON public.cards FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff read cards" ON public.cards FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- BILLERS AND PAYMENTS
CREATE TABLE public.billers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  nickname TEXT,
  account_last4 TEXT,
  autopay BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX billers_user_idx ON public.billers(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.billers TO authenticated;
GRANT ALL ON public.billers TO service_role;
ALTER TABLE public.billers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own billers" ON public.billers FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff read billers" ON public.billers FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE TABLE public.bill_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  biller_id UUID NOT NULL REFERENCES public.billers(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
  due_date DATE NOT NULL,
  status public.txn_status NOT NULL DEFAULT 'pending',
  provider_reference TEXT,
  source public.data_source NOT NULL DEFAULT 'test',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX bill_payments_user_idx ON public.bill_payments(user_id, due_date);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bill_payments TO authenticated;
GRANT ALL ON public.bill_payments TO service_role;
ALTER TABLE public.bill_payments ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER bill_payments_updated_at BEFORE UPDATE ON public.bill_payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "Users manage own payments" ON public.bill_payments FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff read payments" ON public.bill_payments FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- CONNECTED ACCOUNTS
CREATE TABLE public.connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  account_type TEXT NOT NULL,
  last4 TEXT,
  status public.connection_status NOT NULL DEFAULT 'connected',
  last_synced_at TIMESTAMPTZ,
  aggregator_item_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX connected_accounts_user_idx ON public.connected_accounts(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.connected_accounts TO authenticated;
GRANT ALL ON public.connected_accounts TO service_role;
ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own connections" ON public.connected_accounts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff read connections" ON public.connected_accounts FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- INVESTMENTS
CREATE TABLE public.investment_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  custodian TEXT,
  portfolio_value_cents BIGINT NOT NULL DEFAULT 0,
  cash_cents BIGINT NOT NULL DEFAULT 0,
  day_change_cents BIGINT NOT NULL DEFAULT 0,
  total_return_cents BIGINT NOT NULL DEFAULT 0,
  source public.data_source NOT NULL DEFAULT 'test',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.investment_accounts TO authenticated;
GRANT ALL ON public.investment_accounts TO service_role;
ALTER TABLE public.investment_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own investment accounts" ON public.investment_accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Staff read investment accounts" ON public.investment_accounts FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE TABLE public.investment_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investment_account_id UUID NOT NULL REFERENCES public.investment_accounts(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  asset_class TEXT NOT NULL DEFAULT 'stock',
  quantity NUMERIC(18,6) NOT NULL DEFAULT 0,
  cost_basis_cents BIGINT NOT NULL DEFAULT 0,
  market_value_cents BIGINT NOT NULL DEFAULT 0,
  source public.data_source NOT NULL DEFAULT 'test',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX holdings_user_idx ON public.investment_holdings(user_id);
GRANT SELECT ON public.investment_holdings TO authenticated;
GRANT ALL ON public.investment_holdings TO service_role;
ALTER TABLE public.investment_holdings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own holdings" ON public.investment_holdings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Staff read holdings" ON public.investment_holdings FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE TABLE public.investment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investment_account_id UUID NOT NULL REFERENCES public.investment_accounts(id) ON DELETE CASCADE,
  symbol TEXT,
  action TEXT NOT NULL,
  quantity NUMERIC(18,6),
  amount_cents BIGINT NOT NULL DEFAULT 0,
  status public.txn_status NOT NULL DEFAULT 'pending',
  source public.data_source NOT NULL DEFAULT 'test',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX investment_txn_user_idx ON public.investment_transactions(user_id, occurred_at DESC);
GRANT SELECT ON public.investment_transactions TO authenticated;
GRANT ALL ON public.investment_transactions TO service_role;
ALTER TABLE public.investment_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own investment activity" ON public.investment_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Staff read investment activity" ON public.investment_transactions FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- STATEMENTS
CREATE TABLE public.statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  opening_balance_cents BIGINT NOT NULL DEFAULT 0,
  deposits_cents BIGINT NOT NULL DEFAULT 0,
  withdrawals_cents BIGINT NOT NULL DEFAULT 0,
  fees_cents BIGINT NOT NULL DEFAULT 0,
  closing_balance_cents BIGINT NOT NULL DEFAULT 0,
  source public.data_source NOT NULL DEFAULT 'test',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX statements_user_idx ON public.statements(user_id, period_end DESC);
GRANT SELECT ON public.statements TO authenticated;
GRANT ALL ON public.statements TO service_role;
ALTER TABLE public.statements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own statements" ON public.statements FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Staff read statements" ON public.statements FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category public.notification_category NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_idx ON public.notifications(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- SECURITY
CREATE TABLE public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  detail TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX security_events_user_idx ON public.security_events(user_id, created_at DESC);
GRANT SELECT, INSERT ON public.security_events TO authenticated;
GRANT ALL ON public.security_events TO service_role;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own security events" ON public.security_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own security events" ON public.security_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff read security events" ON public.security_events FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE TABLE public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  user_agent TEXT,
  trusted BOOLEAN NOT NULL DEFAULT false,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX devices_user_idx ON public.devices(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.devices TO authenticated;
GRANT ALL ON public.devices TO service_role;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own devices" ON public.devices FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.login_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
  ip_address TEXT,
  location TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);
CREATE INDEX login_sessions_user_idx ON public.login_sessions(user_id, started_at DESC);
GRANT SELECT, INSERT, UPDATE ON public.login_sessions TO authenticated;
GRANT ALL ON public.login_sessions TO service_role;
ALTER TABLE public.login_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sessions" ON public.login_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own sessions" ON public.login_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users end own sessions" ON public.login_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff read sessions" ON public.login_sessions FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- SUPPORT
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  status public.ticket_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX support_tickets_user_idx ON public.support_tickets(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "Users read own tickets" ON public.support_tickets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own tickets" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff read tickets" ON public.support_tickets FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE TABLE public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  from_staff BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ticket_messages_ticket_idx ON public.ticket_messages(ticket_id, created_at);
GRANT SELECT, INSERT ON public.ticket_messages TO authenticated;
GRANT ALL ON public.ticket_messages TO service_role;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own ticket messages" ON public.ticket_messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid())
);
CREATE POLICY "Users write own ticket messages" ON public.ticket_messages FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid())
);
CREATE POLICY "Staff read ticket messages" ON public.ticket_messages FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- PROVIDER INTEGRATIONS (staff only)
CREATE TABLE public.provider_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind public.provider_kind NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  vendor TEXT,
  state public.provider_state NOT NULL DEFAULT 'configuration_required',
  env_var_name TEXT,
  last_checked_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.provider_integrations TO authenticated;
GRANT ALL ON public.provider_integrations TO service_role;
ALTER TABLE public.provider_integrations ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER provider_integrations_updated_at BEFORE UPDATE ON public.provider_integrations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "Staff read providers" ON public.provider_integrations FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

INSERT INTO public.provider_integrations (kind, display_name, env_var_name) VALUES
  ('banking','Banking / Deposit Provider','BANKING_PROVIDER_KEY'),
  ('payment','Payment & Bill Pay Provider','PAYMENT_PROVIDER_KEY'),
  ('kyc','Identity Verification (KYC)','KYC_PROVIDER_KEY'),
  ('card','Card Issuing Provider','CARD_PROVIDER_KEY'),
  ('brokerage','Brokerage / Custody Provider','BROKERAGE_PROVIDER_KEY'),
  ('aggregation','Account Aggregation Provider','AGGREGATION_PROVIDER_KEY'),
  ('email','Email Provider','EMAIL_API_KEY'),
  ('sms','SMS Provider','SMS_API_KEY');

-- AUDIT LOGS (staff read only, append via service role)
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email TEXT,
  action TEXT NOT NULL,
  target_user_id UUID,
  entity TEXT,
  entity_id UUID,
  previous_state JSONB,
  new_state JSONB,
  reason TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX audit_logs_created_idx ON public.audit_logs(created_at DESC);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'compliance')
);