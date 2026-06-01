
GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.attendee_brief_summary,
  public.attendee_business_brief,
  public.attendee_brief_facts,
  public.attendee_brief_alignment,
  public.attendee_founder_memory,
  public.attendee_founder_profile
TO authenticated;

GRANT ALL ON
  public.attendee_brief_summary,
  public.attendee_business_brief,
  public.attendee_brief_facts,
  public.attendee_brief_alignment,
  public.attendee_founder_memory,
  public.attendee_founder_profile
TO service_role;
