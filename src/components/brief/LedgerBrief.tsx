import type { ParsedBrief } from "@/lib/brief-parser";
import { Markdown } from "@/components/brief/Markdown";

/**
 * "Ledger" editorial layout for the finished brand brief.
 * Selected design direction — magazine-grade, dark, semantic-token only.
 */
export function LedgerBrief({ sections }: { sections: ParsedBrief }) {
  let n = 0;
  const num = () => String(++n).padStart(2, "0");

  // Decide which body to show as the "lead" identity paragraph. Prefer
  // the dedicated Identity section; fall back to the Executive snapshot.
  const identityLead = sections.identity ?? sections.snapshot;

  const showAudienceBand =
    sections.audience || sections.audiencePain || sections.transformation;

  const showVoice =
    sections.voice &&
    (sections.voice.summary ||
      sections.voice.tone ||
      sections.voice.cadence ||
      sections.voice.vocabulary ||
      sections.voice.openers ||
      sections.voice.neverSoundsLike);

  const showWorkExperience =
    sections.workExperience &&
    (sections.workExperience.summary || sections.workExperience.roles.length > 0);

  const showLeftCol = sections.themes.length > 0;
  const showRightCol =
    sections.channels || sections.outcomeGoal || sections.nonNegotiables;

  return (
    <article className="grid grid-cols-1 gap-x-12 gap-y-16 md:grid-cols-12">
      {/* Positioning blockquote — only if present */}
      {sections.positioning && (
        <section className="md:col-span-12">
          <blockquote className="border-l-2 border-primary/40 pl-6 text-2xl font-light italic leading-snug text-foreground/90 md:text-3xl">
            “{sections.positioning}”
          </blockquote>
        </section>
      )}

      {/* 01. Identity */}
      {identityLead && (
        <section className="md:col-span-12">
          <SectionMark n={num()} title="Identity & credibility" />
          <p className="max-w-3xl text-2xl font-light leading-relaxed text-foreground/90">
            {identityLead}
          </p>
        </section>
      )}

      {/* 02. Work experience — featured, full-width résumé rail */}
      {showWorkExperience && sections.workExperience && (
        <section className="rounded-xl border border-white/5 bg-muted/20 p-10 md:col-span-12">
          <SectionMark n={num()} title="Work experience" />
          {sections.workExperience.summary && (
            <p className="mb-8 max-w-3xl text-lg font-light leading-relaxed text-foreground/90">
              {sections.workExperience.summary}
            </p>
          )}
          {sections.workExperience.roles.length > 0 && (
            <ul className="divide-y divide-border/40">
              {sections.workExperience.roles.map((r, i) => (
                <li
                  key={i}
                  className="grid grid-cols-1 gap-2 py-4 md:grid-cols-12 md:gap-6"
                >
                  <div className="md:col-span-5">
                    <div className="text-sm font-semibold text-foreground">
                      {r.role}
                    </div>
                    {r.company && (
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        {r.company}
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    {r.period && (
                      <span className="text-xs font-medium tracking-wide text-muted-foreground">
                        {r.period}
                      </span>
                    )}
                  </div>
                  <div className="md:col-span-5">
                    {r.outcome && (
                      <p className="text-sm leading-relaxed text-foreground/75">
                        {r.outcome}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* 03. Domain + 04. Expertise (two columns when both present) */}
      {(sections.domain || sections.expertise.length > 0) && (
        <>
          {sections.domain && (
            <section className={sections.expertise.length > 0 ? "md:col-span-5" : "md:col-span-12"}>
              <SectionMark n={num()} title="Domain" />
              <p className="text-lg font-medium text-foreground/80">
                {sections.domain}
              </p>
              {sections.domainTags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {sections.domainTags.map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-border/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </section>
          )}
          {sections.expertise.length > 0 && (
            <section className={sections.domain ? "md:col-span-7" : "md:col-span-12"}>
              <SectionMark n={num()} title="Expertise" />
              <ul className="space-y-4">
                {sections.expertise.map((p, i) => (
                  <li key={i} className="flex flex-col">
                    <span className="mb-1 text-sm font-semibold text-foreground">
                      {p.title}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {p.desc}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {/* 04/05/06. Audience band — 3 columns with a top hairline */}
      {showAudienceBand && (
        <section className="grid grid-cols-1 gap-8 border-t border-white/5 pt-8 md:col-span-12 md:grid-cols-3">
          {sections.audience && (
            <div>
              <SectionMark n={num()} title="Audience" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                {sections.audience}
              </p>
            </div>
          )}
          {sections.audiencePain && (
            <div>
              <SectionMark n={num()} title="Audience pain" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                {sections.audiencePain}
              </p>
            </div>
          )}
          {sections.transformation && (
            <div>
              <SectionMark n={num()} title="Transformation" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                {sections.transformation}
              </p>
            </div>
          )}
        </section>
      )}

      {/* 07. Signature POV — pull-quote card */}
      {sections.pov && (
        <section className="rounded-xl border border-white/5 bg-muted/30 p-10 md:col-span-12">
          <SectionMark n={num()} title="Signature point of view" />
          <blockquote className="text-2xl font-light italic leading-snug tracking-tight text-foreground md:text-3xl">
            “{sections.pov}”
          </blockquote>
        </section>
      )}

      {/* 08. Origin arc — full-width prose */}
      {sections.originArc && (
        <section className="md:col-span-12">
          <SectionMark n={num()} title="Origin arc" />
          <p className="max-w-3xl text-base leading-relaxed text-foreground/80">
            {sections.originArc}
          </p>
        </section>
      )}

      {/* Voice + Themes / Channels + Outcome — two columns */}
      {(showLeftCol || showRightCol) && (
        <>
          <section
            className={
              showLeftCol && showRightCol
                ? "space-y-10 md:col-span-6"
                : "space-y-10 md:col-span-12"
            }
          >
            {showVoice && sections.voice && (
              <div>
                <SectionMark n={num()} title="Voice" />
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <VoiceField label="Tone" value={sections.voice.tone} />
                  <VoiceField label="Cadence" value={sections.voice.cadence} />
                  <VoiceField
                    label="Vocabulary"
                    value={sections.voice.vocabulary}
                  />
                  <VoiceField
                    label="Sample openers"
                    value={sections.voice.openers}
                  />
                  <VoiceField
                    label="Never sounds like"
                    value={sections.voice.neverSoundsLike}
                    full
                  />
                </dl>
              </div>
            )}

            {sections.themes.length > 0 && (
              <div>
                <SectionMark n={num()} title="Signature themes" />
                <div className="space-y-2">
                  {sections.themes.map((t, i) => (
                    <div
                      key={i}
                      className="border-l-2 border-primary/30 py-1 pl-4 text-sm text-foreground/85"
                    >
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {showRightCol && (
            <section
              className={
                showLeftCol ? "space-y-10 md:col-span-6" : "space-y-10 md:col-span-12"
              }
            >
              {sections.channels && (
                <div>
                  <SectionMark n={num()} title="Channels & cadence" />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {sections.channels}
                  </p>
                </div>
              )}
              {sections.outcomeGoal && (
                <div>
                  <SectionMark n={num()} title="Outcome goal" />
                  <p className="text-sm font-medium leading-relaxed text-foreground">
                    {sections.outcomeGoal}
                  </p>
                </div>
              )}
              {sections.nonNegotiables && (
                <div>
                  <SectionMark n={num()} title="Non-negotiables" />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {sections.nonNegotiables}
                  </p>
                </div>
              )}
            </section>
          )}
        </>
      )}

      {/* Workshop alignment footer */}
      {sections.workshopAlignment && (
        <footer className="mt-4 border-t border-white/10 pt-12 md:col-span-12">
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="flex-1">
              <SectionMark n={num()} title="Workshop alignment" />
              <p className="text-sm italic leading-relaxed text-muted-foreground">
                {sections.workshopAlignment}
              </p>
            </div>
            <div className="flex-none">
              <SectionMark n="" title="Status" />
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Alignment verified
              </span>
            </div>
          </div>
        </footer>
      )}

      {/* Unknown sections — render raw so nothing is dropped */}
      {sections.unknown.length > 0 && (
        <section className="md:col-span-12">
          {sections.unknown.map((u, i) => (
            <div key={i} className="mb-8">
              <SectionMark n={num()} title={u.title} />
              <Markdown variant="document">{u.body}</Markdown>
            </div>
          ))}
        </section>
      )}
    </article>
  );
}

function SectionMark({ n, title }: { n: string; title: string }) {
  return (
    <div className="mb-4 block text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
      {n ? `${n}. ${title}` : title}
    </div>
  );
}

function VoiceField({
  label,
  value,
  full,
}: {
  label: string;
  value?: string;
  full?: boolean;
}) {
  if (!value) return null;
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <dt className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
        {label}
      </dt>
      <dd className="text-sm text-foreground/90">{value}</dd>
    </div>
  );
}
