import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { FacilitatorHero } from "@/components/facilitator/FacilitatorHero";
import { FacilitatorStats } from "@/components/facilitator/FacilitatorStats";
import { FacilitatorStory } from "@/components/facilitator/FacilitatorStory";
import { FacilitatorPillars } from "@/components/facilitator/FacilitatorPillars";
import { FacilitatorTimeline } from "@/components/facilitator/FacilitatorTimeline";
import { FacilitatorAudience } from "@/components/facilitator/FacilitatorAudience";
import { FacilitatorCTA } from "@/components/facilitator/FacilitatorCTA";

export const Route = createFileRoute("/facilitator")({
  head: () => ({
    meta: [
      { title: "Adam Anderson — The Brand Operator Who Makes Founders Into Public Figures" },
      {
        name: "description",
        content:
          "Brand operator. AI builder. Public figure maker. Adam Anderson has made 50+ founders the name in their category — and he does it in one afternoon.",
      },
      { property: "og:title", content: "Adam Anderson — The Brand Operator Who Makes Founders Into Public Figures" },
      {
        property: "og:description",
        content:
          "He's taken 50+ founders and operators from respected-in-their-circle to publicly known in their category. He compressed what agencies charge $15K and 90 days for into a single afternoon.",
      },
      { property: "og:url", content: "https://brandexperts.org/facilitator" },
    ],
    links: [{ rel: "canonical", href: "https://brandexperts.org/facilitator" }],
  }),
  component: FacilitatorPage,
});

function FacilitatorPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main
        className="flex-1 mx-auto w-full px-6 py-16 md:py-24"
        style={{ maxWidth: "860px" }}
      >

        <div className="space-y-12 md:space-y-20">
          <FacilitatorHero />
          <div className="border-t border-border" />
          <FacilitatorStats />
          <div className="border-t border-border" />
          <FacilitatorStory />
          <div className="border-t border-border" />
          <FacilitatorPillars />
          <div className="border-t border-border" />
          <FacilitatorTimeline />
          <div className="border-t border-border" />
          <FacilitatorAudience />
          <div className="border-t border-border" />
          <FacilitatorCTA />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
