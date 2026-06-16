
-- 1. Profiles: restrict SELECT to self + admins
DROP POLICY IF EXISTS "Profiles viewable by authenticated" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- 2. Realtime: restrict channel subscriptions
-- Topic convention: "user:<uuid>" for per-user channels; admins can subscribe to anything.
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can subscribe to own user topics" ON realtime.messages;
CREATE POLICY "Users can subscribe to own user topics"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() = 'user:' || auth.uid()::text
  OR public.is_admin(auth.uid())
);

-- 3. Revoke EXECUTE on privileged SECURITY DEFINER functions from authenticated/anon.
REVOKE EXECUTE ON FUNCTION public.reserve_cohort_seat(uuid, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.promote_application(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_cohort_seat_cache(text) FROM PUBLIC, anon, authenticated;
