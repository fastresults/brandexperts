import { motion } from "framer-motion";
import { Rocket, Briefcase, Mic2, Crown, type LucideIcon } from "lucide-react";

const ITEMS: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Rocket,
    title: "You're building something",
    desc: "Your work is good. Your brand isn't keeping pace. You're closing deals in the room but losing them before you get there — because your digital presence doesn't reflect what you actually do. Three hours fixes that.",
  },
  {
    icon: Briefcase,
    title: "You're making a move",
    desc: "Pivoting, launching, or changing direction and needing your story to land fast. Not three months from now after an agency finishes a deck. This afternoon, in your voice, ready to post by Monday.",
  },
  {
    icon: Mic2,
    title: "You're posting. Nothing's landing.",
    desc: "Consistent output that isn't building authority. You're generating content but it's not converting — because there's no system underneath connecting what you publish to what you want to be known for.",
  },
  {
    icon: Crown,
    title: "You're stepping into visibility",
    desc: "New title, new audience, new stage — you can't afford to wing the personal brand piece. You have one shot at setting the narrative. This is the afternoon you set it right.",
  },
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
        This is built for you if
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ITEMS.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-xl border border-border bg-card p-6 transition-all hover:border-white/25">
            <Icon className="text-primary mb-3" size={22} />
            <h3 className="text-lg font-semibold tracking-tight text-card-foreground mb-2">{title}</h3>
            <p className="text-sm leading-[1.7] text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground/70">
        Not a fit if you're looking for follower-growth hacks or social tactics disconnected from substance.
      </p>
    </motion.section>
  );
}
