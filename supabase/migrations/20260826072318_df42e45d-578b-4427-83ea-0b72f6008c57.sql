-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.email, ''),
    NULLIF(LOWER(REGEXP_REPLACE(COALESCE(NEW.raw_user_meta_data->>'username', ''), '[^a-z0-9_]', '', 'g')), '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Test-data write policies (customers may only ever write rows marked as test data)
CREATE POLICY "Users insert own test accounts" ON public.accounts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND source = 'test');
CREATE POLICY "Users update own test accounts" ON public.accounts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND source = 'test') WITH CHECK (auth.uid() = user_id AND source = 'test');
CREATE POLICY "Users delete own test accounts" ON public.accounts FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND source = 'test');

CREATE POLICY "Users insert own test transactions" ON public.transactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND source = 'test');
CREATE POLICY "Users delete own test transactions" ON public.transactions FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND source = 'test');

CREATE POLICY "Users insert own test transfers" ON public.transfers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND source = 'test');
CREATE POLICY "Users update own test transfers" ON public.transfers FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND source = 'test') WITH CHECK (auth.uid() = user_id AND source = 'test');

CREATE POLICY "Users insert own test rewards" ON public.reward_transactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND source = 'test');