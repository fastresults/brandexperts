// Pure markdown assembler for the "Complete package" export.
// Combines: final brief, founder profile (enriched + raw), uploaded docs manifest,
// every Q&A from the spine, alignment notes, and generation metadata.

import { BRIEF_SPINE, BRIEF_SECTION_BY_ID, type BriefFact, type BriefSectionId, type BriefSummary, type AlignmentItem } from "@/lib/brand-brief";

export type CompletePackageInput = {
  user: { email: string | null; name: string | null };
  summary: BriefSummary | null;
  facts: BriefFact[];
  founderProfile: {
    extracted: Record<string, unknown> | null;
    raw_text: string | null;
    source: string | null;
    source_file_path: string | null;
    linkedin_url: string | null;
    extracted_at: string | null;
    unfair_advantage: string | null;
    right_person_reason: string | null;
  } | null;
  documents: Array<{
    kind: string;
    original_name: string;
    mime_type: string | null;
    size_bytes: number | null;
    created_at: string;
  }>;
  alignment: { items: AlignmentItem[]; model: string | null; generated_at: string } | null;
};

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return iso;
  }
}

function fmtBytes(n: number | null): string {
  if (!n || n <= 0) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function fenceText(body: string): string {
  // Use ~~~ fence so any ``` inside the source text won't terminate it.
  return ["~~~text", body.trim(), "~~~"].join("\n");
}

function divider(): string {
  return "\n---\n";
}

export function buildCompletePackageMarkdown(input: CompletePackageInput): string {
  const { user, summary, facts, founderProfile, documents, alignment } = input;
  const generatedAt = new Date().toISOString();
  const factsBySection = new Map<BriefSectionId, BriefFact>();
  for (const f of facts) factsBySection.set(f.section, f);
  const covered = BRIEF_SPINE.filter((s) => {
    const f = factsBySection.get(s.id);
    return f && (f.value ?? "").trim().length > 0;
  }).length;
  const total = BRIEF_SPINE.length;

  const parts: string[] = [];

  // 1. Cover
  parts.push(
    [
      "# Brand Brief — Complete Package",
      "",
      `**Prepared for:** ${user.name ?? user.email ?? "Executive"}${user.email && user.name ? ` <${user.email}>` : ""}`,
      `**Generated:** ${generatedAt}`,
      `**Brief completed:** ${fmtDate(summary?.completed_at)}`,
      `**Brief last updated:** ${fmtDate(summary?.updated_at)}`,
      `**Spine coverage:** ${covered} of ${total} sections answered`,
      "",
      "This document contains every source we used, every answer you gave, and the final brand brief we produced — in that order. It is the canonical archive of your intake.",
    ].join("\n"),
  );

  // 2. Final brief
  parts.push(divider());
  parts.push("## 1. Final Brand Brief\n");
  if (summary?.markdown?.trim()) {
    parts.push(summary.markdown.trim());
  } else {
    parts.push("_The final brief has not been generated yet._");
  }

  // 3. Founder profile (enriched)
  parts.push(divider());
  parts.push("## 2. Founder Profile (Enriched)\n");
  if (founderProfile) {
    const meta: string[] = [];
    if (founderProfile.source) meta.push(`- **Source:** ${founderProfile.source}`);
    if (founderProfile.source_file_path) meta.push(`- **Source file:** ${founderProfile.source_file_path}`);
    if (founderProfile.linkedin_url) meta.push(`- **LinkedIn:** ${founderProfile.linkedin_url}`);
    if (founderProfile.extracted_at) meta.push(`- **Extracted:** ${fmtDate(founderProfile.extracted_at)}`);
    if (meta.length) parts.push(meta.join("\n") + "\n");

    if (founderProfile.unfair_advantage) {
      parts.push(`**Unfair advantage:** ${founderProfile.unfair_advantage}\n`);
    }
    if (founderProfile.right_person_reason) {
      parts.push(`**Why this is the right person:** ${founderProfile.right_person_reason}\n`);
    }
    if (founderProfile.extracted && Object.keys(founderProfile.extracted).length > 0) {
      parts.push("### Structured fields\n");
      parts.push("```json");
      parts.push(JSON.stringify(founderProfile.extracted, null, 2));
      parts.push("```");
    } else {
      parts.push("_No structured fields extracted._");
    }
  } else {
    parts.push("_No founder profile on file._");
  }

  // 4. Raw source material
  parts.push(divider());
  parts.push("## 3. Raw Source Material\n");
  const raw = founderProfile?.raw_text?.trim();
  if (raw) {
    parts.push(
      `Verbatim text extracted from your uploaded resume or LinkedIn export. This is the unedited input the system read.\n`,
    );
    parts.push(fenceText(raw));
  } else {
    parts.push("_No raw resume or LinkedIn text on file._");
  }

  // 5. Uploaded documents manifest
  parts.push(divider());
  parts.push("## 4. Uploaded Documents\n");
  if (documents.length > 0) {
    parts.push("| Kind | File | Type | Size | Uploaded |");
    parts.push("| --- | --- | --- | --- | --- |");
    for (const d of documents) {
      parts.push(
        `| ${d.kind} | ${d.original_name} | ${d.mime_type ?? "—"} | ${fmtBytes(d.size_bytes)} | ${fmtDate(d.created_at)} |`,
      );
    }
  } else {
    parts.push("_No documents uploaded._");
  }

  // 6. Question & Answer ledger
  parts.push(divider());
  parts.push("## 5. Question & Answer Ledger\n");
  parts.push(
    "Every section of the brief spine, in canonical order, with the answer you locked in.\n",
  );
  for (let i = 0; i < BRIEF_SPINE.length; i++) {
    const s = BRIEF_SPINE[i];
    const f = factsBySection.get(s.id);
    parts.push(`### ${i + 1}. ${s.label}`);
    parts.push(`_${s.hint}_\n`);
    if (f && (f.value ?? "").trim().length > 0) {
      parts.push(`**Answer:**\n\n${f.value.trim()}\n`);
      parts.push(
        `_Confidence: ${Math.max(1, Math.min(5, f.confidence ?? 4))}/5 · Updated: ${fmtDate(f.updated_at)}_\n`,
      );
    } else {
      parts.push("_No answer captured yet._\n");
    }
  }

  // 7. Workshop alignment
  parts.push(divider());
  parts.push("## 6. Workshop Alignment Notes\n");
  if (alignment && alignment.items.length > 0) {
    parts.push(
      `_Generated ${fmtDate(alignment.generated_at)}${alignment.model ? ` · model: ${alignment.model}` : ""}_\n`,
    );
    for (const item of alignment.items) {
      parts.push(`### ${item.deliverable_label}`);
      parts.push(`_Block: ${item.block_label}_\n`);
      parts.push(item.application_text);
      if (item.anchored_sections.length > 0) {
        const labels = item.anchored_sections
          .map((id) => BRIEF_SECTION_BY_ID[id]?.label ?? id)
          .join(", ");
        parts.push(`\n_Anchored on: ${labels}_\n`);
      } else {
        parts.push("");
      }
    }
  } else {
    parts.push("_Workshop alignment has not been generated yet._");
  }

  // 8. Appendix
  parts.push(divider());
  parts.push("## 7. Appendix — Generation Metadata\n");
  const coverageRows = BRIEF_SPINE.map((s) => {
    const f = factsBySection.get(s.id);
    const c = f ? Math.max(1, Math.min(5, f.confidence ?? 4)) : 0;
    return `- ${s.label}: ${c > 0 ? `confidence ${c}/5` : "missing"}`;
  });
  parts.push(`- **Facts captured:** ${facts.length} of ${total}`);
  parts.push(`- **Sections covered:** ${covered} of ${total}`);
  parts.push(`- **Brief last updated:** ${fmtDate(summary?.updated_at)}`);
  parts.push(`- **Brief completed at:** ${fmtDate(summary?.completed_at)}`);
  parts.push(`- **Alignment generated:** ${alignment ? fmtDate(alignment.generated_at) : "—"}`);
  parts.push(`- **Package generated:** ${generatedAt}`);
  parts.push("\n### Per-section coverage\n");
  parts.push(coverageRows.join("\n"));

  return parts.join("\n") + "\n";
}

export function buildCompletePackageFilename(): string {
  return `brand-brief-complete-${new Date().toISOString().slice(0, 10)}.md`;
}
