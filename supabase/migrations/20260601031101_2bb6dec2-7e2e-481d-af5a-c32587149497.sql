CREATE TABLE public.attendee_brief_alignment (
  user_id uuid NOT NULL PRIMARY KEY,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  model text,
  generated_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendee_brief_alignment TO authenticated;
GRANT ALL ON public.attendee_brief_alignment TO service_role;

ALTER TABLE public.attendee_brief_alignment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own alignment" ON public.attendee_brief_alignment
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own alignment" ON public.attendee_brief_alignment
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own alignment" ON public.attendee_brief_alignment
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own alignment" ON public.attendee_brief_alignment
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER trg_alignment_touch
  BEFORE UPDATE ON public.attendee_brief_alignment
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();