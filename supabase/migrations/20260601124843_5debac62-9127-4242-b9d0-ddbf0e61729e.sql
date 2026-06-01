
-- 1. profiles: restrict SELECT to authenticated users (was public)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- 2. deliverable_types: restrict SELECT to admins only (server uses service role)
DROP POLICY IF EXISTS "Anyone authenticated reads deliverable types" ON public.deliverable_types;
CREATE POLICY "Admins read deliverable types"
  ON public.deliverable_types
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- 3. workshop_registrations: allow user to read their own submission
CREATE POLICY "Users read own registrations"
  ON public.workshop_registrations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Lock down email-queue helper functions (server-only via service role)
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;

-- 5. Pin search_path on trigger functions missing it
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public;
ALTER FUNCTION public.touch_updated_at() SET search_path = public;
ALTER FUNCTION public.tg_founder_applications_touch() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
