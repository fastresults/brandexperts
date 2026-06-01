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
      { title: "Adam Anderson — Facilitator, The Executive Brand Intensive" },
      {
        name: "description",
        content:
          "40 years of brand, tech, and sovereign communications experience. Adam Anderson leads The Executive Brand Intensive — a 3-hour, hands-on workshop that installs an executive personal-brand operating system in your voice.",
      },
      { property: "og:title", content: "Adam Anderson — Facilitator, The Executive Brand Intensive" },
      {
        property: "og:description",
        content:
          "Fortune 500, sovereign cabinet, and AI-native product fluency — translated into an executive brand operating system you walk out owning.",
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
