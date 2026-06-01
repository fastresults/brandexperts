// Parses a finished brand-brief markdown blob into a normalized,
// strongly-typed section bag the LedgerBrief layout can render.
//
// Handles BOTH formats the model has emitted in the wild:
//   (a) the current H2 schema  ("## Identity & credibility\n...")
//   (b) legacy numbered prose  ("1. Identity & Credibility\nGlobal marketing...")
//
// Anything the parser can't map cleanly lands in `unknown` so the UI can
// still render it as raw markdown rather than dropping content.

export interface ExpertisePillar {
  title: string;
  desc: string;
}

export interface VoiceFields {
  summary?: string;
  tone?: string;
  cadence?: string;
  vocabulary?: string;
  openers?: string;
  neverSoundsLike?: string;
}

export interface WorkExperienceRole {
  role: string;
  company?: string;
  period?: string;
  outcome?: string;
}

export interface WorkExperience {
  summary: string;
  roles: WorkExperienceRole[];
}

export interface ParsedBrief {
  title?: string;
  positioning?: string;
  snapshot?: string;
  identity?: string;
  workExperience?: WorkExperience;
  domain?: string;
  domainTags: string[];
  expertise: ExpertisePillar[];
  audience?: string;
  audiencePain?: string;
  transformation?: string;
  pov?: string;
  originArc?: string;
  voice?: VoiceFields;
  themes: string[];
  channels?: string;
  outcomeGoal?: string;
  nonNegotiables?: string;
  workshopAlignment?: string;
  unknown: Array<{ title: string; body: string }>;
}

interface RawSection {
  title: string;
  body: string;
}

// ---- helpers ----

const stripLeadingBullet = (line: string) =>
  line.replace(/^\s*([-*•]|\d+\.)\s+/, "");

const stripBoldRuns = (s: string) => s.replace(/\*\*(.+?)\*\*/g, "$1");

const normalizeKey = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

function splitIntoSections(md: string): { title: string | undefined; sections: RawSection[] } {
  const lines = md.split(/\r?\n/);
  const sections: RawSection[] = [];
  let title: string | undefined;
  let current: RawSection | null = null;

  const flush = () => {
    if (current) {
      current.body = current.body.trim();
      sections.push(current);
      current = null;
    }
  };

  for (const raw of lines) {
    const line = raw;

    // H1 → document title (only the first one wins)
    const h1 = line.match(/^#\s+(.+)$/);
    if (h1 && !title) {
      title = h1[1].trim();
      continue;
    }

    // H2 / H3 → section break
    const h2 = line.match(/^#{2,3}\s+(.+)$/);
    if (h2) {
      flush();
      current = { title: h2[1].trim(), body: "" };
      continue;
    }

    // Legacy "1. Identity & Credibility" on its own line → section break.
    // Only treat as a heading if it's a short label line (no trailing prose).
    const numbered = line.match(/^\s*(\d+)[.)]\s+([A-Z][^.?!]{2,60})\s*$/);
    if (numbered) {
      flush();
      current = { title: numbered[2].trim(), body: "" };
      continue;
    }

    if (current) {
      current.body += (current.body ? "\n" : "") + line;
    } else {
      // Pre-heading content → leading positioning blockquote or stray prose
      sections.push({ title: "__preamble__", body: line });
    }
  }
  flush();
  return { title, sections };
}

function extractPositioning(preamble: string): string | undefined {
  // First markdown blockquote in the preamble becomes the positioning line.
  const m = preamble.match(/^>\s*(.+)$/m);
  if (!m) return undefined;
  return m[1].replace(/^["“”']+|["“”']+$/g, "").trim();
}

// Parse "**Label** — value" or "Label — value" or "Label: value" lines into a map.
function parseLabeledLines(body: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const raw of body.split(/\r?\n/)) {
    const line = stripLeadingBullet(stripBoldRuns(raw)).trim();
    if (!line) continue;
    // Try em-dash, en-dash, or colon as separator.
    const m = line.match(/^([A-Za-z][A-Za-z &/']{1,40})\s*[—–:-]\s+(.+)$/);
    if (m) {
      out[normalizeKey(m[1])] = m[2].trim();
    }
  }
  return out;
}

function parseVoice(body: string): VoiceFields {
  // Capture leading prose (lines before the first labeled "**Tone**" / "Tone —" line)
  // as a narrative voice summary.
  const lines = body.split(/\r?\n/);
  const labelRegex = /^\s*(?:\*\*)?(Tone|Cadence|Vocabulary|Sample openers|Openers|Never sounds like|Never)\b/i;
  const summaryLines: string[] = [];
  const fieldLines: string[] = [];
  let inFields = false;
  for (const raw of lines) {
    if (!inFields && labelRegex.test(raw)) inFields = true;
    if (inFields) fieldLines.push(raw);
    else if (raw.trim()) summaryLines.push(raw);
  }
  const summaryRaw = summaryLines.join(" ").trim();
  const labels = parseLabeledLines(fieldLines.join("\n"));
  return {
    summary: summaryRaw ? stripBoldRuns(summaryRaw) : undefined,
    tone: labels["tone"],
    cadence: labels["cadence"],
    vocabulary: labels["vocabulary"],
    openers: labels["sample openers"] ?? labels["openers"],
    neverSoundsLike: labels["never sounds like"] ?? labels["never"],
  };
}

// Pull a "**Domains:** a · b · c" trailing line out of a domain body.
// Returns the remaining prose and the parsed tags.
function extractDomainTags(body: string): { prose: string; tags: string[] } {
  const lines = body.split(/\r?\n/);
  const tagLineIdx = lines.findIndex((l) =>
    /^\s*\*?\*?\s*Domains?\s*:?\*?\*?\s*[—–:-]?\s*/i.test(l) && /[·,•|]/.test(l),
  );
  if (tagLineIdx === -1) return { prose: body, tags: [] };
  const tagLine = lines[tagLineIdx];
  const stripped = stripBoldRuns(tagLine).replace(/^\s*Domains?\s*[:—–-]\s*/i, "");
  const tags = stripped
    .split(/\s*[·•|,]\s*/)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 8);
  const prose = lines.filter((_, i) => i !== tagLineIdx).join("\n");
  return { prose, tags };
}

function parseWorkExperience(body: string): WorkExperience {
  const lines = body.split(/\r?\n/);
  const summaryLines: string[] = [];
  const roleLines: string[] = [];
  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const isBullet = /^([-*•]|\d+[.)])\s+/.test(trimmed);
    if (isBullet) roleLines.push(trimmed);
    else summaryLines.push(trimmed);
  }
  const roles: WorkExperienceRole[] = [];
  for (const raw of roleLines) {
    const line = stripLeadingBullet(raw).trim();
    // **Role, Company (years)** — outcome
    const m = line.match(/^\*\*(.+?)\*\*\s*[—–:-]?\s*(.*)$/);
    let head = "";
    let outcome = "";
    if (m) {
      head = m[1].trim();
      outcome = m[2].trim();
    } else {
      const m2 = line.match(/^(.+?)\s+[—–-]\s+(.+)$/);
      if (m2) {
        head = m2[1].trim();
        outcome = m2[2].trim();
      } else {
        head = line;
      }
    }
    // Extract trailing "(years)" / "(2019–2023)" into period.
    let period: string | undefined;
    const periodMatch = head.match(/\(([^)]+)\)\s*$/);
    if (periodMatch) {
      period = periodMatch[1].trim();
      head = head.slice(0, periodMatch.index).trim().replace(/[,;]\s*$/, "");
    }
    // Split "Role, Company" if a comma is present.
    let role = head;
    let company: string | undefined;
    const commaIdx = head.indexOf(",");
    if (commaIdx > 0) {
      role = head.slice(0, commaIdx).trim();
      company = head.slice(commaIdx + 1).trim();
    }
    roles.push({ role, company, period, outcome: outcome || undefined });
  }
  return {
    summary: stripBoldRuns(summaryLines.join(" ")).trim(),
    roles,
  };
}

function parseAudienceBundle(body: string) {
  const labels = parseLabeledLines(body);
  return {
    audience:
      labels["who they serve"] ?? labels["audience"] ?? undefined,
    audiencePain:
      labels["the pain they walk in with"] ??
      labels["pain"] ??
      labels["audience pain"] ??
      undefined,
    transformation:
      labels["the transformation"] ??
      labels["transformation"] ??
      labels["promise"] ??
      undefined,
  };
}

function parseThemes(body: string): string[] {
  const out: string[] = [];
  for (const raw of body.split(/\r?\n/)) {
    const line = stripBoldRuns(stripLeadingBullet(raw)).trim();
    if (!line) continue;
    // "Theme name — gloss" → keep as one item; otherwise raw line.
    out.push(line);
  }
  return out.slice(0, 6);
}

function parseExpertise(body: string): ExpertisePillar[] {
  const out: ExpertisePillar[] = [];
  for (const raw of body.split(/\r?\n/)) {
    const line = stripLeadingBullet(raw).trim();
    if (!line) continue;
    // **AI-Enhanced Personal Branding:** Building digital presence…
    const m = line.match(/^\*\*(.+?)\*\*[:\s—–-]+\s*(.+)$/);
    if (m) {
      out.push({ title: m[1].trim(), desc: m[2].trim() });
      continue;
    }
    const m2 = line.match(/^([A-Z][^:—–-]{2,60})\s*[:\s—–-]+\s*(.+)$/);
    if (m2) {
      out.push({ title: m2[1].trim(), desc: m2[2].trim() });
    }
  }
  return out;
}

function cleanProse(body: string): string {
  return stripBoldRuns(
    body
      .split(/\r?\n/)
      .map((l) => stripLeadingBullet(l).trim())
      .filter(Boolean)
      .join(" "),
  ).trim();
}

// ---- main entry ----

export function parseBrief(md: string): ParsedBrief {
  const { title, sections } = splitIntoSections(md);

  const preamble = sections
    .filter((s) => s.title === "__preamble__")
    .map((s) => s.body)
    .join("\n");

  const result: ParsedBrief = {
    title,
    positioning: extractPositioning(preamble),
    domainTags: [],
    expertise: [],
    themes: [],
    unknown: [],
  };

  for (const sec of sections) {
    if (sec.title === "__preamble__") continue;
    const key = normalizeKey(sec.title);

    // Identity / credibility
    if (
      key === "identity credibility" ||
      key === "identity" ||
      key === "credibility" ||
      key === "identity and credibility"
    ) {
      result.identity = cleanProse(sec.body);
      continue;
    }

    if (key === "executive snapshot" || key === "snapshot") {
      result.snapshot = cleanProse(sec.body);
      continue;
    }

    if (
      key === "work experience" ||
      key === "experience" ||
      key === "career" ||
      key === "professional experience" ||
      key === "work history"
    ) {
      result.workExperience = parseWorkExperience(sec.body);
      continue;
    }

    if (key === "domain") {
      const { prose, tags } = extractDomainTags(sec.body);
      result.domain = cleanProse(prose);
      result.domainTags = tags;
      continue;
    }

    if (key === "expertise" || key === "core expertise") {
      result.expertise = parseExpertise(sec.body);
      // If the parser found nothing structured, keep the raw prose as `domain`-style.
      if (!result.expertise.length) {
        result.unknown.push({ title: sec.title, body: sec.body });
      }
      continue;
    }

    if (
      key === "audience transformation" ||
      key === "audience and transformation"
    ) {
      const bundle = parseAudienceBundle(sec.body);
      result.audience ??= bundle.audience;
      result.audiencePain ??= bundle.audiencePain;
      result.transformation ??= bundle.transformation;
      continue;
    }

    if (key === "audience") {
      result.audience = cleanProse(sec.body);
      continue;
    }

    if (key === "audience pain" || key === "pain") {
      result.audiencePain = cleanProse(sec.body);
      continue;
    }

    if (
      key === "transformation" ||
      key === "transformation promise" ||
      key === "promise"
    ) {
      result.transformation = cleanProse(sec.body);
      continue;
    }

    if (
      key === "signature point of view" ||
      key === "signature pov" ||
      key === "pov" ||
      key === "point of view"
    ) {
      result.pov = cleanProse(sec.body);
      continue;
    }

    if (key === "origin arc" || key === "origin" || key === "story") {
      result.originArc = cleanProse(sec.body);
      continue;
    }

    if (key === "voice" || key === "voice tone" || key === "voice and tone") {
      result.voice = parseVoice(sec.body);
      continue;
    }

    if (key === "signature themes" || key === "themes") {
      result.themes = parseThemes(sec.body);
      continue;
    }

    if (
      key === "channels cadence" ||
      key === "channels and cadence" ||
      key === "channels"
    ) {
      result.channels = cleanProse(sec.body);
      continue;
    }

    if (
      key === "outcome goal non negotiables" ||
      key === "outcome goal and non negotiables" ||
      key === "outcome goal" ||
      key === "outcome"
    ) {
      result.outcomeGoal = cleanProse(sec.body);
      continue;
    }

    if (key === "non negotiables" || key === "non negotiable") {
      result.nonNegotiables = cleanProse(sec.body);
      continue;
    }

    if (
      key === "workshop alignment" ||
      key === "alignment" ||
      key === "workshop"
    ) {
      result.workshopAlignment = cleanProse(sec.body);
      continue;
    }

    // Anything we couldn't slot — preserve so the UI can show it raw.
    result.unknown.push({ title: sec.title, body: sec.body });
  }

  return result;
}
