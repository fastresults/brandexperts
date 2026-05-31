-- Display floors (cohort thresholds)
ALTER TABLE public.cohorts
  ADD COLUMN IF NOT EXISTS founders_warming_boost integer NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS founders_honest_threshold_pct integer NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS cohort_warming_boost integer NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS cohort_honest_threshold_pct integer NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS founders_display_floor_pct integer NOT NULL DEFAULT 25,
  ADD COLUMN IF NOT EXISTS cohort_display_floor_pct integer NOT NULL DEFAULT 25;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='cohorts_founders_threshold_range') THEN
    ALTER TABLE public.cohorts ADD CONSTRAINT cohorts_founders_threshold_range CHECK (founders_honest_threshold_pct BETWEEN 1 AND 100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='cohorts_cohort_threshold_range') THEN
    ALTER TABLE public.cohorts ADD CONSTRAINT cohorts_cohort_threshold_range CHECK (cohort_honest_threshold_pct BETWEEN 1 AND 100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='cohorts_founders_boost_nonneg') THEN
    ALTER TABLE public.cohorts ADD CONSTRAINT cohorts_founders_boost_nonneg CHECK (founders_warming_boost >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='cohorts_cohort_boost_nonneg') THEN
    ALTER TABLE public.cohorts ADD CONSTRAINT cohorts_cohort_boost_nonneg CHECK (cohort_warming_boost >= 0);
  END IF;
END $$;

-- Agentic workflow types
ALTER TABLE public.deliverable_types
  ADD COLUMN IF NOT EXISTS requires_context_keys text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS produces_context_key text,
  ADD COLUMN IF NOT EXISTS output_kind text NOT NULL DEFAULT 'document',
  ADD COLUMN IF NOT EXISTS user_can_trigger boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS auto_runnable boolean NOT NULL DEFAULT true;

UPDATE public.deliverable_types SET produces_context_key = key WHERE produces_context_key IS NULL;
UPDATE public.deliverable_types
  SET requires_context_keys = depends_on_keys
WHERE COALESCE(array_length(requires_context_keys,1),0) = 0
  AND COALESCE(array_length(depends_on_keys,1),0) > 0;

INSERT INTO public.deliverable_types
  (key, label, description, stage_label, stage_n, sort_order, depends_on_keys, requires_context_keys, produces_context_key, output_kind, user_can_trigger, auto_runnable, default_model, active)
VALUES
  ('funding_runway','Funding model & 12-month runway','Costs, margin, break-even, monthly cash plan.','Form',1,45,ARRAY['llc_filing_packet'],ARRAY['business_brief'],'funding_runway','document',true,true,'google/gemini-3-flash-preview',true),
  ('business_plan','Business plan with pro formas','Narrative plan + 12-month P&L, cash flow, and break-even.','Form',1,46,ARRAY['funding_runway'],ARRAY['business_brief','funding_runway'],'business_plan','document',true,true,'google/gemini-3-flash-preview',true),
  ('pitch_deck','Investor-ready pitch deck','10 slides in your brand.','Form',1,47,ARRAY['business_plan'],ARRAY['business_brief','business_plan'],'pitch_deck','document',true,true,'google/gemini-3-flash-preview',true),
  ('fundraising_kit','Fundraising kit','1-page raise summary, outreach plan + email template, grants/microloans/SBA path.','Form',1,48,ARRAY['pitch_deck'],ARRAY['business_brief','pitch_deck'],'fundraising_kit','document',true,true,'google/gemini-3-flash-preview',true),
  ('competitor_research','Competitive research pack','3 competitors on offer/price/positioning, customer quotes, and a differentiation one-pager.','Customer',2,55,ARRAY['icp_prospect_list'],ARRAY['icp_prospect_list'],'competitor_research','document',true,true,'google/gemini-3-flash-preview',true),
  ('competitive_advantage','Competitive advantage brief','Your secret sauce distilled into a positioning line you can defend.','Customer',2,57,ARRAY['competitor_research'],ARRAY['competitor_research'],'competitive_advantage','document',true,true,'google/gemini-3-flash-preview',true),
  ('operations_sops','Operations & workflow SOPs','3 SOPs (intake, fulfillment, onboarding) + 1-page weekly operating rhythm.','Build',4,85,ARRAY['workflow_tooling'],ARRAY['workflow_tooling'],'operations_sops','document',true,true,'google/gemini-3-flash-preview',true),
  ('sourcing_staffing','Sourcing & staffing plan','Suppliers, contractors, hires with named candidates and a first-call list.','Build',4,95,ARRAY['operations_sops'],ARRAY['business_brief','operations_sops'],'sourcing_staffing','document',true,true,'google/gemini-3-flash-preview',true)
ON CONFLICT (key) DO NOTHING;

-- Business brief
CREATE TABLE IF NOT EXISTS public.attendee_business_brief (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  one_line_pitch text, origin_story text, problem_statement text, target_customer text,
  unique_insight text, offer_description text, pricing_idea text, business_model text,
  inspiration_brands text, twelve_month_vision text,
  voice_transcripts jsonb NOT NULL DEFAULT '{}'::jsonb,
  completeness_score integer NOT NULL DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendee_business_brief TO authenticated;
GRANT ALL ON public.attendee_business_brief TO service_role;
ALTER TABLE public.attendee_business_brief ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own business brief" ON public.attendee_business_brief FOR SELECT TO authenticated USING ((auth.uid()=user_id) OR is_admin(auth.uid()));
CREATE POLICY "Users insert own business brief" ON public.attendee_business_brief FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id);
CREATE POLICY "Users update own business brief" ON public.attendee_business_brief FOR UPDATE TO authenticated USING ((auth.uid()=user_id) OR is_admin(auth.uid()));
CREATE TRIGGER trg_brief_updated_at BEFORE UPDATE ON public.attendee_business_brief FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Filing info
CREATE TABLE IF NOT EXISTS public.attendee_filing_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  legal_first_name text, legal_last_name text, dob date, ssn_last4 text, ssn_full text,
  address_line1 text, address_line2 text, city text, state text, postal_code text, country text DEFAULT 'US',
  llc_name text, registered_agent_name text, registered_agent_address text, business_purpose text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendee_filing_info TO authenticated;
GRANT ALL ON public.attendee_filing_info TO service_role;
ALTER TABLE public.attendee_filing_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own filing info" ON public.attendee_filing_info FOR SELECT TO authenticated USING ((auth.uid()=user_id) OR is_admin(auth.uid()));
CREATE POLICY "Users insert own filing info" ON public.attendee_filing_info FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id);
CREATE POLICY "Users update own filing info" ON public.attendee_filing_info FOR UPDATE TO authenticated USING ((auth.uid()=user_id) OR is_admin(auth.uid()));
CREATE TRIGGER trg_filing_updated_at BEFORE UPDATE ON public.attendee_filing_info FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Stage intake
CREATE TABLE IF NOT EXISTS public.attendee_stage_intake (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  deliverable_key text NOT NULL,
  intake jsonb NOT NULL DEFAULT '{}'::jsonb,
  voice_transcripts jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, deliverable_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendee_stage_intake TO authenticated;
GRANT ALL ON public.attendee_stage_intake TO service_role;
ALTER TABLE public.attendee_stage_intake ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own stage intake" ON public.attendee_stage_intake FOR SELECT TO authenticated USING ((auth.uid()=user_id) OR is_admin(auth.uid()));
CREATE POLICY "Users insert own stage intake" ON public.attendee_stage_intake FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id);
CREATE POLICY "Users update own stage intake" ON public.attendee_stage_intake FOR UPDATE TO authenticated USING ((auth.uid()=user_id) OR is_admin(auth.uid()));
CREATE TRIGGER trg_stage_intake_updated_at BEFORE UPDATE ON public.attendee_stage_intake FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Deliverable + pipeline read policy adjustments
DROP POLICY IF EXISTS "Users read own published deliverables" ON public.attendee_deliverables;
DROP POLICY IF EXISTS "Users read own deliverables" ON public.attendee_deliverables;
CREATE POLICY "Users read own deliverables" ON public.attendee_deliverables FOR SELECT TO authenticated USING ((auth.uid()=user_id) OR is_admin(auth.uid()));
DROP POLICY IF EXISTS "Users read own pipeline runs" ON public.ai_pipeline_runs;
CREATE POLICY "Users read own pipeline runs" ON public.ai_pipeline_runs FOR SELECT TO authenticated USING (auth.uid()=user_id);
DROP POLICY IF EXISTS "Users read own pipeline steps" ON public.ai_pipeline_steps;
CREATE POLICY "Users read own pipeline steps" ON public.ai_pipeline_steps FOR SELECT TO authenticated USING (auth.uid()=user_id);

GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon, service_role;

-- Founder memory
CREATE TABLE IF NOT EXISTS public.attendee_founder_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source text NOT NULL, source_key text NOT NULL, block_n integer,
  field_keys text[] NOT NULL DEFAULT '{}',
  qa jsonb NOT NULL DEFAULT '[]'::jsonb,
  summary text, bullets text[] NOT NULL DEFAULT '{}',
  model text, content_hash text NOT NULL,
  superseded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_founder_memory_current ON public.attendee_founder_memory (user_id, source, source_key) WHERE superseded_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_founder_memory_recent ON public.attendee_founder_memory (user_id, source, created_at DESC);
GRANT SELECT, INSERT, UPDATE ON public.attendee_founder_memory TO authenticated;
GRANT ALL ON public.attendee_founder_memory TO service_role;
ALTER TABLE public.attendee_founder_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own founder memory" ON public.attendee_founder_memory FOR SELECT TO authenticated USING ((auth.uid()=user_id) OR is_admin(auth.uid()));
CREATE POLICY "Users insert own founder memory" ON public.attendee_founder_memory FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id);
CREATE POLICY "Users update own founder memory" ON public.attendee_founder_memory FOR UPDATE TO authenticated USING ((auth.uid()=user_id) OR is_admin(auth.uid()));
CREATE TRIGGER update_attendee_founder_memory_updated_at BEFORE UPDATE ON public.attendee_founder_memory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Founder profile
CREATE TABLE IF NOT EXISTS public.attendee_founder_profile (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  source text, source_file_path text, linkedin_url text, raw_text text,
  extracted jsonb NOT NULL DEFAULT '{}'::jsonb,
  right_person_reason text, unfair_advantage text,
  extracted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendee_founder_profile TO authenticated;
GRANT ALL ON public.attendee_founder_profile TO service_role;
ALTER TABLE public.attendee_founder_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own founder profile" ON public.attendee_founder_profile FOR SELECT TO authenticated USING ((auth.uid()=user_id) OR is_admin(auth.uid()));
CREATE POLICY "Users insert own founder profile" ON public.attendee_founder_profile FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id);
CREATE POLICY "Users update own founder profile" ON public.attendee_founder_profile FOR UPDATE TO authenticated USING ((auth.uid()=user_id) OR is_admin(auth.uid()));
CREATE TRIGGER update_attendee_founder_profile_updated_at BEFORE UPDATE ON public.attendee_founder_profile FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Market profile
CREATE TABLE IF NOT EXISTS public.attendee_market_profile (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  archetype text[] NOT NULL DEFAULT '{}'::text[],
  geography text, industry text,
  channels text[] NOT NULL DEFAULT '{}'::text[],
  customer_type text, market_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendee_market_profile TO authenticated;
GRANT ALL ON public.attendee_market_profile TO service_role;
ALTER TABLE public.attendee_market_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own market profile" ON public.attendee_market_profile FOR SELECT TO authenticated USING ((auth.uid()=user_id) OR is_admin(auth.uid()));
CREATE POLICY "Users insert own market profile" ON public.attendee_market_profile FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id);
CREATE POLICY "Users update own market profile" ON public.attendee_market_profile FOR UPDATE TO authenticated USING ((auth.uid()=user_id) OR is_admin(auth.uid()));
CREATE TRIGGER update_attendee_market_profile_updated_at BEFORE UPDATE ON public.attendee_market_profile FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Site settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Site settings are publicly readable" ON public.site_settings FOR SELECT USING (true);
INSERT INTO public.site_settings (key, value) VALUES
  ('home_variant','"original"'::jsonb),
  ('register_variant','"original"'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Expand status constraint to include application lifecycle
ALTER TABLE public.workshop_registrations DROP CONSTRAINT IF EXISTS workshop_registrations_status_check;
ALTER TABLE public.workshop_registrations ADD CONSTRAINT workshop_registrations_status_check CHECK (status = ANY (ARRAY['applied','selected','waitlisted','declined','pending','paid','confirmed','refunded','cancelled']));

-- Founder applications
CREATE TABLE IF NOT EXISTS public.founder_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, email text NOT NULL, phone text, linkedin_url text,
  about_you text NOT NULL, about_startup text NOT NULL, why_now text NOT NULL,
  industry text NOT NULL,
  stage text NOT NULL CHECK (stage IN ('idea','early','existing')),
  referral_source text, can_attend boolean NOT NULL DEFAULT true,
  cohort_id text,
  status text NOT NULL DEFAULT 'applied'
    CHECK (status IN ('applied','reviewing','shortlisted','selected','waitlisted','rejected','withdrawn')),
  reviewed_by uuid, reviewed_at timestamptz,
  status_changed_at timestamptz NOT NULL DEFAULT now(),
  converted_registration_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_founder_applications_status ON public.founder_applications(status);
CREATE INDEX IF NOT EXISTS idx_founder_applications_created_at ON public.founder_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_founder_applications_cohort ON public.founder_applications(cohort_id);
GRANT INSERT ON public.founder_applications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.founder_applications TO authenticated;
GRANT ALL ON public.founder_applications TO service_role;
ALTER TABLE public.founder_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit an application" ON public.founder_applications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read applications" ON public.founder_applications FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins update applications" ON public.founder_applications FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins delete applications" ON public.founder_applications FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.tg_founder_applications_touch()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.status_changed_at := now();
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_founder_applications_touch ON public.founder_applications;
CREATE TRIGGER trg_founder_applications_touch BEFORE UPDATE ON public.founder_applications FOR EACH ROW EXECUTE FUNCTION public.tg_founder_applications_touch();

-- Application notes
CREATE TABLE IF NOT EXISTS public.application_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.founder_applications(id) ON DELETE CASCADE,
  author_id uuid, author_name text, body text NOT NULL,
  kind text NOT NULL DEFAULT 'note' CHECK (kind IN ('note','system')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_application_notes_application_id ON public.application_notes(application_id, created_at DESC);
GRANT SELECT, INSERT, DELETE ON public.application_notes TO authenticated;
GRANT ALL ON public.application_notes TO service_role;
ALTER TABLE public.application_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read notes" ON public.application_notes FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins insert notes" ON public.application_notes FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins delete notes" ON public.application_notes FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.promote_application(_app_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE a RECORD; new_reg_id uuid;
BEGIN
  SELECT * INTO a FROM public.founder_applications WHERE id = _app_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Application % not found', _app_id; END IF;
  IF a.converted_registration_id IS NOT NULL THEN RETURN a.converted_registration_id; END IF;
  IF a.status <> 'selected' THEN
    RAISE EXCEPTION 'Application must be in selected status to promote (current: %)', a.status;
  END IF;
  INSERT INTO public.workshop_registrations (
    name, email, phone, business_idea, industry, stage,
    referral_source, tier_interest, cohort_id, status, assigned_tier
  ) VALUES (
    a.name, a.email, a.phone,
    'ABOUT THE FOUNDER:'||E'\n'||a.about_you||E'\n\n'||
    'ABOUT THE STARTUP:'||E'\n'||a.about_startup||E'\n\n'||
    'WHY THIS, WHY NOW:'||E'\n'||a.why_now||
    CASE WHEN a.linkedin_url IS NOT NULL AND a.linkedin_url <> '' THEN E'\n\nLINKEDIN: '||a.linkedin_url ELSE '' END,
    a.industry, a.stage, a.referral_source,
    'selection', a.cohort_id, 'confirmed', 'selection'
  ) RETURNING id INTO new_reg_id;
  UPDATE public.founder_applications SET converted_registration_id = new_reg_id, updated_at = now() WHERE id = _app_id;
  RETURN new_reg_id;
END;
$$;
REVOKE ALL ON FUNCTION public.promote_application(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.promote_application(uuid) TO authenticated, service_role;

-- Inquiries
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT,
  subject TEXT NOT NULL, message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  assigned_to UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT inquiries_status_check CHECK (status IN ('new','in_progress','replied','closed'))
);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_last_activity ON public.inquiries(last_activity_at DESC);
GRANT INSERT ON public.inquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inquiries TO authenticated;
GRANT ALL ON public.inquiries TO service_role;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit an inquiry" ON public.inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read inquiries" ON public.inquiries FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins update inquiries" ON public.inquiries FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins delete inquiries" ON public.inquiries FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
DROP TRIGGER IF EXISTS update_inquiries_updated_at ON public.inquiries;
CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON public.inquiries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.inquiry_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_id UUID NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
  direction TEXT NOT NULL,
  author_id UUID, author_name TEXT, body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT inquiry_messages_direction_check CHECK (direction IN ('inbound','outbound'))
);
CREATE INDEX IF NOT EXISTS idx_inquiry_messages_inquiry ON public.inquiry_messages(inquiry_id, created_at);
GRANT SELECT, INSERT ON public.inquiry_messages TO authenticated;
GRANT ALL ON public.inquiry_messages TO service_role;
ALTER TABLE public.inquiry_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read inquiry messages" ON public.inquiry_messages FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins insert inquiry messages" ON public.inquiry_messages FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

-- Member status + intakes + auto-approval
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS member_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS approved_via text,
  ADD COLUMN IF NOT EXISTS rejected_reason text;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='profiles_approved_via_chk') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_approved_via_chk CHECK (approved_via IS NULL OR approved_via IN ('admin','payment'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='profiles_member_status_chk') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_member_status_chk CHECK (member_status IN ('pending','approved','rejected','paused'));
  END IF;
END $$;

ALTER TABLE public.workshop_registrations ADD COLUMN IF NOT EXISTS user_id uuid;
CREATE INDEX IF NOT EXISTS workshop_registrations_user_id_idx ON public.workshop_registrations(user_id);
CREATE INDEX IF NOT EXISTS workshop_registrations_email_lower_idx ON public.workshop_registrations(lower(email));

CREATE TABLE IF NOT EXISTS public.member_intakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  startup_type text NOT NULL, startup_name text,
  one_line_idea text NOT NULL, supporting_info text,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','contacted','converted','closed')),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz, reviewer_id uuid, admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.member_intakes TO authenticated;
GRANT ALL ON public.member_intakes TO service_role;
ALTER TABLE public.member_intakes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own intake" ON public.member_intakes FOR SELECT TO authenticated USING (auth.uid() = user_id OR is_admin(auth.uid()));
CREATE POLICY "Users insert own intake" ON public.member_intakes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own intake" ON public.member_intakes FOR UPDATE TO authenticated USING (auth.uid() = user_id OR is_admin(auth.uid()));
CREATE POLICY "Admins delete intake" ON public.member_intakes FOR DELETE TO authenticated USING (is_admin(auth.uid()));
DROP TRIGGER IF EXISTS trg_member_intakes_updated_at ON public.member_intakes;
CREATE TRIGGER trg_member_intakes_updated_at BEFORE UPDATE ON public.member_intakes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.auto_approve_member_on_payment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_user_id uuid;
BEGIN
  IF NEW.status NOT IN ('paid','confirmed') THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND OLD.status = NEW.status THEN RETURN NEW; END IF;
  target_user_id := NEW.user_id;
  IF target_user_id IS NULL AND NEW.email IS NOT NULL THEN
    SELECT user_id INTO target_user_id FROM public.profiles WHERE lower(email) = lower(NEW.email) LIMIT 1;
  END IF;
  IF target_user_id IS NULL THEN RETURN NEW; END IF;
  UPDATE public.profiles
     SET member_status='approved', approved_at=COALESCE(approved_at, now()), approved_via=COALESCE(approved_via,'payment')
   WHERE user_id = target_user_id AND member_status <> 'approved';
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_auto_approve_member ON public.workshop_registrations;
CREATE TRIGGER trg_auto_approve_member AFTER INSERT OR UPDATE ON public.workshop_registrations
  FOR EACH ROW EXECUTE FUNCTION public.auto_approve_member_on_payment();

UPDATE public.profiles p SET member_status='approved', approved_at=COALESCE(p.approved_at, now()), approved_via=COALESCE(p.approved_via,'admin')
  FROM public.user_roles ur WHERE ur.user_id = p.user_id AND ur.role IN ('admin','super_admin') AND p.member_status <> 'approved';

UPDATE public.profiles p SET member_status='approved', approved_at=COALESCE(p.approved_at, now()), approved_via=COALESCE(p.approved_via,'payment')
  FROM public.workshop_registrations wr WHERE wr.status IN ('paid','confirmed') AND lower(wr.email) = lower(p.email) AND p.member_status <> 'approved';