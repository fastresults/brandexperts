import { motion } from "framer-motion";
import { Rocket, Briefcase, Mic2, Crown, type LucideIcon } from "lucide-react";

const ITEMS: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Rocket, title: "Building something", desc: "Founders and operators whose work is good but whose brand isn't keeping pace. You're closing deals in the room but losing them before you get there — because your digital presence doesn't reflect what you actually do. Walk out with the publishing system that fixes that in one afternoon." },
  { icon: Briefcase, title: "Making a move", desc: "Pivoting, launching, or changing direction and needing your story to land fast. Not three months from now after the agency finishes the deck — this afternoon, in your voice, ready to publish by Monday." },
  { icon: Mic2, title: "Already publishing, not landing", desc: "Posting consistently but not converting it into positioning. You're generating content but it's not building authority — because there's no system underneath connecting what you publish to what you want to be known for." },
  { icon: Crown, title: "Stepping into visibility", desc: "Newly public-facing professionals — new title, new audience, new stage — who can't afford to wing the personal brand piece. You have one chance to set the narrative. This is the afternoon you set it right." },
];

export function FacilitatorAudience() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground md:text-sm md:tracking-[0.2em]">
        This workshop is built for
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ITEMS.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-xl border border-border bg-card p-6">
            <Icon className="text-primary mb-3" size={22} />
            <h3 className="text-lg font-semibold tracking-tight text-card-foreground mb-2">{title}</h3>
            <p className="text-sm leading-[1.7] text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground/80">
        Not for: people looking for follower-growth hacks or social media tactics divorced from substance.
      </p>
    </motion.section>
  );
}
