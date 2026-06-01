// Client-safe shared types & constants for the AI-driven brand brief.

export type BriefSectionId =
  | "identity_credibility"
  | "domain"
  | "expertise"
  | "signature_pov"
  | "origin_arc"
  | "audience"
  | "audience_pain"
  | "transformation"
  | "voice"
  | "signature_themes"
  | "channels"
  | "outcome_goal"
  | "non_negotiables"
  | "workshop_alignment";

export type BriefSection = {
  id: BriefSectionId;
  label: string;
  hint: string;
};

export const BRIEF_SPINE: BriefSection[] = [
  { id: "identity_credibility", label: "Identity & credibility", hint: "Who you are, roles, results, rooms — the credibility that travels with you." },
  { id: "domain", label: "Domain you own", hint: "The single field/category you want to be known in — specific, not 'leadership' (e.g. 'operational turnarounds in regulated healthcare')." },
  { id: "expertise", label: "Specific expertise", hint: "3–5 concrete capabilities inside that domain you can teach (e.g. 'post-merger ops integration', 'FDA submission readiness')." },
  { id: "signature_pov", label: "Signature POV", hint: "The one belief about your industry you'd defend on a stage." },
  { id: "origin_arc", label: "Origin arc", hint: "The experience or turning point that gave you that POV." },
  { id: "audience", label: "Audience", hint: "Who specifically needs to hear from you (role, industry, stage, geography)." },
  { id: "audience_pain", label: "Audience pain", hint: "What they're quietly struggling with that no one else is naming." },
  { id: "transformation", label: "Transformation promise", hint: "What's different in their life or career after 12 months of following you." },
  { id: "voice", label: "Writing voice profile", hint: "Tone words, cadence (punchy vs essayistic), vocabulary register, 1–2 sample opening lines, and what you never sound like." },
  { id: "signature_themes", label: "Signature themes", hint: "The 3–5 topics you want to own for the next year." },
  { id: "channels", label: "Channels", hint: "Where you'll publish (LinkedIn, newsletter, podcast, keynote, etc.)." },
  { id: "outcome_goal", label: "12-month outcome", hint: "What winning looks like — boards, keynotes, inbound, a book, an exit." },
  { id: "non_negotiables", label: "Non-negotiables", hint: "Topics, tone, platforms, or clients that are off-limits." },
  { id: "workshop_alignment", label: "Workshop alignment", hint: "Which workshop deliverables you most want to walk out with." },
];

export const BRIEF_SECTION_BY_ID: Record<BriefSectionId, BriefSection> = Object.fromEntries(
  BRIEF_SPINE.map((s) => [s.id, s]),
) as Record<BriefSectionId, BriefSection>;

export type BriefFact = {
  section: BriefSectionId;
  value: string;
  confidence: number;
  updated_at: string;
};

export type BriefSummary = {
  markdown: string;
  spine_coverage: Partial<Record<BriefSectionId, number>>;
  completed_at: string | null;
  updated_at: string;
};

export type AlignmentItem = {
  deliverable_key: string;
  deliverable_label: string;
  block_label: string;
  application_text: string;
  anchored_sections: BriefSectionId[];
};

export type BriefAlignment = {
  items: AlignmentItem[];
  model: string | null;
  generated_at: string;
  updated_at: string;
};

