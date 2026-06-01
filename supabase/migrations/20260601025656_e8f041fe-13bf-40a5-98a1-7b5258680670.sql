
CREATE TABLE public.attendee_brief_facts (
  user_id UUID NOT NULL,
  section TEXT NOT NULL,
  value TEXT NOT NULL,
  confidence SMALLINT NOT NULL DEFAULT 3 CHECK (confidence BETWEEN 1 AND 5),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, section)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendee_brief_facts TO authenticated;
GRANT ALL ON public.attendee_brief_facts TO service_role;

ALTER TABLE public.attendee_brief_facts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own brief facts" ON public.attendee_brief_facts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own brief facts" ON public.attendee_brief_facts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own brief facts" ON public.attendee_brief_facts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own brief facts" ON public.attendee_brief_facts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);


CREATE TABLE public.attendee_brief_summary (
  user_id UUID PRIMARY KEY,
  markdown TEXT NOT NULL DEFAULT '',
  spine_coverage JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendee_brief_summary TO authenticated;
GRANT ALL ON public.attendee_brief_summary TO service_role;

ALTER TABLE public.attendee_brief_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own brief summary" ON public.attendee_brief_summary
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own brief summary" ON public.attendee_brief_summary
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own brief summary" ON public.attendee_brief_summary
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own brief summary" ON public.attendee_brief_summary
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER attendee_brief_facts_touch
  BEFORE UPDATE ON public.attendee_brief_facts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER attendee_brief_summary_touch
  BEFORE UPDATE ON public.attendee_brief_summary
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
