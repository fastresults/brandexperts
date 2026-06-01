export type Task = {
  title: string;
  deliverable: string;
  tool: string;
  details: string[];
  takeaway?: string;
  followUp?: string;
};

export type Stage = {
  n: number;
  slug: string;
  title: string;
  shortTitle: string;
  summary: string;
  oneLiner: string;
  takeHome: string;
  walkOut: string[];
  afterWorkshop: string[];
  duration: string;
  covers: string[];
  tasks: Task[];
};

// The Executive Brand Intensive — 6 blocks across a 3-hour afternoon.
export const STAGES: Stage[] = [
  {
    n: 1,
    slug: "foundation",
    title: "Foundation — Who you are on the record",
    shortTitle: "foundation",
    summary:
      "Lock the positioning, three pillars, audience, and proof points every future asset inherits from.",
    oneLiner: "Positioning & blueprint",
    takeHome:
      "Your Brand Blueprint — a locked positioning statement, three content pillars, target audience, and proof points — plus a sourced Brand Assessment naming the white space you can credibly own vs. peers in your category.",
    walkOut: [
      "Brand Blueprint: positioning, 3 pillars, audience, proof points",
      "Brand Assessment Report: gap analysis vs. category peers with prioritized white space",
    ],
    afterWorkshop: [],
    duration: "30 min",
    covers: ["Positioning", "3 content pillars", "Audience map", "Brand gap analysis"],
    tasks: [
      {
        title: "Upload your foundation",
        deliverable:
          "Past work, bio, and source material captured as the factual ground truth nothing later will violate.",
        tool: "Foundation intake",
        details: [
          "Capture past posts, talks, and articles as source of truth",
          "Lock the bio + LinkedIn URL the system writes from",
          "Note Company URL + one competitor URL",
        ],
        takeaway: "Your evidence base — uploaded, dated, and ready for the engine.",
      },
      {
        title: "Run the brand assessment",
        deliverable:
          "A sourced gap analysis against peers in your category with prioritized opportunities you can credibly own.",
        tool: "Brand assessment engine",
        details: [
          "Compare positioning vs. 3 named peers",
          "Surface the white space your category leaves open",
          "Prioritize the opportunities you'll exploit first",
        ],
        takeaway: "Your Brand Assessment Report — gaps named, white space ranked.",
      },
      {
        title: "Generate the Brand Blueprint",
        deliverable:
          "Positioning statement + 3 content pillars + target audience + proof points — locked, in your folder, and feeding every asset built after this block.",
        tool: "Blueprint generator",
        details: [
          "Write the one-sentence positioning that anchors every future asset",
          "Pick exactly 3 pillars (not 5, not 7)",
          "Define audience: buyers, peers, talent, press",
          "Lock the proof points each pillar will reference",
        ],
        takeaway:
          "Your Brand Blueprint — the single most important artifact of the day; everything else is downstream.",
      },
    ],
  },
  {
    n: 2,
    slug: "voice",
    title: "Voice — Sound like yourself at scale",
    shortTitle: "voice",
    summary:
      "Capture your tone, vocabulary, and cadence so every future asset sounds unmistakably like you — not like generic AI.",
    oneLiner: "Voice profile & bios",
    takeHome:
      "A captured Voice Profile that keeps every future draft sounding like you, three bios (short / medium / long) ready to paste into LinkedIn, speaker pages, and board bios, an exec-grade headshot set, and three saved presets so every future brief is a 30-second decision.",
    walkOut: [
      "Voice profile — tone, vocabulary, cadence, sentence rhythm captured",
      "Three bios — 50w / 150w / 350w — copy-paste ready",
      "Executive Headshot Set — LinkedIn, press, speaker tile, podcast",
      "Three saved pillar presets (audience + domain + weighting)",
    ],
    afterWorkshop: [
      "Paste the new About into LinkedIn before you leave the room",
    ],
    duration: "30 min",
    covers: ["Voice capture", "Bios (short/medium/long)", "Headshot variations", "Pillar presets"],
    tasks: [
      {
        title: "Capture your voice",
        deliverable:
          "A trained voice profile that picks up the rhythm, vocabulary, and sentence shape of your past work — so future drafts sound like you wrote them.",
        tool: "Voice capture engine",
        details: [
          "Train on the past samples uploaded in Block 1",
          "Surface the rhythm and vocabulary patterns you can't see in your own writing",
          "Lock the voice profile to every future asset",
        ],
        takeaway: "Your voice — captured and locked. The AI now writes as you.",
      },
      {
        title: "Generate the three bios",
        deliverable:
          "Short (50w), medium (150w), and long (350w) bios in your voice — ready to paste into LinkedIn About, speaker pages, podcast intros, press kits, and board bios.",
        tool: "Bio generator",
        details: [
          "Three lengths in one pass, all in the captured voice",
          "Built off the Brand Blueprint so every line is on-brand",
          "Edit live in the room until you read them out loud and say 'yes, that's me'",
        ],
        takeaway: "Three bios — copy/paste ready for every context you show up in.",
        followUp: "Replace your LinkedIn About with the medium bio before Block 3 starts.",
      },
      {
        title: "Generate the headshot set + save your presets",
        deliverable:
          "An executive-grade headshot set generated from your source photo (LinkedIn, press, speaker page, podcast tile) plus three saved presets — one per pillar — so every future brief is a 30-second decision.",
        tool: "Headshot generator + preset library",
        details: [
          "Generate exec-grade variations from one source photo",
          "Save one preset per pillar: audience + domain + weighting",
          "Test a preset on a sample brief — confirm the output stays on-voice",
        ],
        takeaway:
          "Your headshot set + three saved presets — every future brief auto-aligns to brand without re-explaining context.",
      },
    ],
  },
  {
    n: 3,
    slug: "signature",
    title: "Signature Content — The Authority Trio",
    shortTitle: "signature",
    summary:
      "Three publish-ready pieces — one Op-Ed, one POV post, one framework carousel — each doing a different job in your authority engine.",
    oneLiner: "Op-Ed, POV, framework",
    takeHome:
      "Three publish-ready pieces of authority content: an 800–1,200 word Op-Ed editors actually open, a contrarian POV post designed for comments not likes, and a 7-slide framework carousel that gets bookmarked and cited.",
    walkOut: [
      "Op-Ed / thought leadership article (800–1,200 words) on your #1 pillar",
      "POV post — contrarian, publish-ready, designed for conversation",
      "Framework carousel — 7 slides of your proprietary methodology",
    ],
    afterWorkshop: [
      "Publish the POV post today — before you leave Block 6",
    ],
    duration: "45 min",
    covers: ["Op-Ed", "POV post", "Framework carousel", "Brand Blueprint validation"],
    tasks: [
      {
        title: "Write the Op-Ed",
        deliverable:
          "An 800–1,200 word thought leadership article on your #1 pillar — the kind of piece editors and conference programmers actually open, drafted in your voice and validated against your Brand Blueprint.",
        tool: "Op-Ed engine",
        details: [
          "Brief → draft → polish in the captured voice",
          "Auto-validate against the Brand Blueprint (this is where agency work usually breaks)",
          "Inbound / press / credibility job — the long-form anchor",
        ],
        takeaway: "Your Op-Ed — publish-ready on your #1 pillar.",
      },
      {
        title: "Write the POV post",
        deliverable:
          "A contrarian Hot Take, publish-ready on LinkedIn and X, written without hedging — built for comments, not likes.",
        tool: "POV generator",
        details: [
          "Take a stance the category is too polite to take",
          "Strip the hedging executives default to",
          "Reach / comments / signal-of-conviction job",
        ],
        takeaway: "Your POV post — publish-ready today.",
      },
      {
        title: "Build the framework carousel",
        deliverable:
          "A 7-slide visual carousel of your proprietary methodology — the format that gets saved, shared, and cited in other people's work.",
        tool: "Carousel builder",
        details: [
          "Name your methodology (named frameworks become moats)",
          "One slide per step, sequenced so it teaches itself",
          "Save / share / citation job — the durable asset",
        ],
        takeaway: "Your framework carousel — 7 slides, ready to publish.",
      },
    ],
  },
  {
    n: 4,
    slug: "distribution",
    title: "Distribution & Repurposing",
    shortTitle: "distribution",
    summary:
      "Convert one idea into five channels in 45 minutes — the multiplier most executives never operationalize because they don't have a team. The system replaces the team.",
    oneLiner: "One idea → five channels",
    takeHome:
      "Your Op-Ed reshaped into a newsletter issue (subject line + preview + full issue), a 5-minute keynote opener with executive Q&A talking points, fourteen days of social posts scheduled to auto-publish, and (optionally) a press release ready to send.",
    walkOut: [
      "Newsletter issue — subject line, preview text, full issue derived from the Op-Ed",
      "Keynote opener + 5-minute stage script + executive Q&A talking points",
      "Two weeks (14 days) of scheduled social posts, auto-publishing",
      "Press release draft (optional, for execs with an announcement)",
    ],
    afterWorkshop: [
      "(Optional) Send the press release to your media list this week",
    ],
    duration: "45 min",
    covers: ["Newsletter issue", "Keynote opener", "Scheduled social calendar", "One-shot syndication"],
    tasks: [
      {
        title: "One-shot syndication of the POV post",
        deliverable:
          "Your POV post pushed in a single action to LinkedIn, X, and every relevant channel — the same idea, formatted natively for each platform.",
        tool: "Syndication engine",
        details: [
          "Push to LinkedIn + X + any other owned channel in one click",
          "Native-format per platform (no generic cross-poster output)",
          "Track which channel actually moves pipeline",
        ],
        takeaway: "Your POV — already in five places.",
      },
      {
        title: "Newsletter + keynote opener from the Op-Ed",
        deliverable:
          "The same Op-Ed reshaped two more ways: a complete newsletter issue (subject, preview, body) and a 5-minute keynote opener with executive Q&A talking points.",
        tool: "Repurposing engine",
        details: [
          "Newsletter: subject line, preview text, full issue",
          "Keynote opener: 5-min stage script + 3 Q&A points executives get asked",
          "Same idea, three formats, same voice",
        ],
        takeaway:
          "Newsletter issue + keynote opener + talking-points doc — ~$8K of agency labor done in 30 minutes.",
      },
      {
        title: "Build the 14-day calendar",
        deliverable:
          "Fourteen days of recycled cuts from the Op-Ed and carousel, scheduled to auto-publish across the channels you actually use.",
        tool: "Scheduler",
        details: [
          "Pull the most quotable lines from the Op-Ed",
          "Slice the carousel into single-slide social posts",
          "Schedule across two weeks — cadence is a leadership discipline, not a marketing chore",
        ],
        takeaway: "14 days of scheduled posts — auto-publishing starting tomorrow.",
      },
    ],
  },
  {
    n: 5,
    slug: "system",
    title: "The Compounding System",
    shortTitle: "system",
    summary:
      "Wire the operating system so you never need us, an agency, or a ghostwriter again. By the end of this block the question stops being 'what should I post?' and becomes 'which prompt do I run today?'",
    oneLiner: "The 30-min weekly cadence",
    takeHome:
      "A 30-Day Authority Sprint sequenced day-by-day around pillar #1, a 90-Day Newsletter Arc outlining the next quarter's themes, an organized workspace filed under your name, and a one-page weekly ritual: 10 min review · 10 min capture · 10 min approve.",
    walkOut: [
      "30-Day Authority Sprint — sequenced day-by-day, ready to execute",
      "90-Day Newsletter Arc — next quarter's themes and through-lines outlined",
      "Tailored outreach: one real prospect researched → one tailored email or post",
      "Organized workspace — every asset filed under your name for ongoing access",
      "Weekly ritual doc — the 30-min cadence (review · capture · approve)",
    ],
    afterWorkshop: [
      "Run the 30-min weekly cadence — that's the entire ongoing time commitment",
    ],
    duration: "25 min",
    covers: ["30-day sprint", "90-day arc", "Reusable presets", "Personal Brand Operating Manual"],
    tasks: [
      {
        title: "Research → tailored outreach",
        deliverable:
          "One real prospect or target account researched in-session, then converted into one tailored email or post — proving the research-to-asset pipeline you'll run every week.",
        tool: "Research-to-asset pipeline",
        details: [
          "Pick one named prospect, account, or target audience",
          "Run the research → asset loop end-to-end",
          "Send (or queue) the tailored output before you leave the block",
        ],
        takeaway: "Pipeline proven on a real target — you can run it Monday.",
      },
      {
        title: "Build the Sprint and the Arc",
        deliverable:
          "A 30-Day Authority Sprint sequenced day-by-day around pillar #1 plus a 90-Day Newsletter Arc outlining the next quarter's themes and through-lines.",
        tool: "Sprint + Arc builders",
        details: [
          "30 days: one action per day, sequenced around pillar #1",
          "90 days: themes per issue, through-lines tied to the Blueprint",
          "Both live in your workspace, both auto-update as you ship",
        ],
        takeaway:
          "30-Day Sprint + 90-Day Arc — your next quarter is on the calendar.",
      },
      {
        title: "Personal Brand Operating Manual",
        deliverable:
          "Your playbook for running this yourself — the documented weekly ritual, content-trigger map, and the metrics that actually matter (inbound, citations, invitations) — exported as a PDF you own.",
        tool: "Operating Manual generator",
        details: [
          "Document the 30-min weekly ritual (review · capture · approve)",
          "Map content triggers: meetings, news cycles, performance signals → next asset",
          "Lock the metrics that matter (and the ones that don't)",
        ],
        takeaway:
          "Personal Brand Operating Manual — exportable PDF, yours to keep and hand off.",
      },
    ],
  },
  {
    n: 6,
    slug: "commitments",
    title: "Commitments & the 90-day cadence",
    shortTitle: "commitments",
    summary:
      "Each executive states publicly to the room: the post going live today, the article going live this week, the 30-min weekly cadence they'll run for 90 days. Public commitment is the accountability mechanism.",
    oneLiner: "Public commitment close",
    takeHome:
      "Three commitments stated aloud to the room (today's post, this week's article, the 90-day weekly cadence with day and time blocked), the cadence on your actual calendar, and an optional 30-day check-in.",
    walkOut: [
      "Today's post: stated and queued",
      "This week's article: stated with a publish date",
      "90-day cadence: day of week + time + calendar block — all set",
      "Optional 30-day check-in offered",
    ],
    afterWorkshop: [
      "Run the cadence — 30 minutes a week, every week, for the next 90 days",
    ],
    duration: "5 min",
    covers: ["Public commitment", "Calendar block", "30-day check-in"],
    tasks: [
      {
        title: "Make the three commitments out loud",
        deliverable:
          "Each executive states publicly to the room: (1) the post going live today, (2) the article going live this week, (3) the 30-min weekly cadence — day, time, calendar block — they will run for the next 90 days.",
        tool: "Public commitment ritual",
        details: [
          "Stand up, state the three commitments aloud",
          "Block the recurring 30-min cadence on your actual calendar before you sit",
          "Optional: opt into a 30-day check-in tier",
        ],
        takeaway: "Three commitments said aloud — the accountability mechanism is live.",
      },
    ],
  },
];

export const stageBySlug = (slug: string) => STAGES.find((s) => s.slug === slug);
