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
      { title: "Adam Anderson — Who runs the room at the Brand OS Intensive" },
      {
        name: "description",
        content:
          "Builder. Brand operator. AI practitioner. Adam Anderson compressed a 90-day agency process into one 3-hour afternoon — and runs the same system himself.",
      },
      { property: "og:title", content: "Adam Anderson — Who runs the room at the Brand OS Intensive" },
      {
        property: "og:description",
        content:
          "He didn't learn this in a classroom. He built 5 AI-native SaaS products, ran brand systems for 50+ founders, and produced 5 international summits — then compressed it all into a single afternoon.",
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
