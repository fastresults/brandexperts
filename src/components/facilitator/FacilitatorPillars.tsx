import { motion } from "framer-motion";
import { Brain, Megaphone, Zap, Shuffle, Globe, Users, type LucideIcon } from "lucide-react";

const PILLARS: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Brain,
    title: "A voice AI can't copy",
    desc: "The reason AI content gets scrolled past? It sounds like AI. Adam built the capture pattern that makes the model write as you — not as a generic version of you in a blazer. That voice profile is the only moat left in a feed full of sameness.",
  },
  {
    icon: Megaphone,
    title: "Positioning that earns attention, not just followers",
    desc: "Built to compound. One well-formed insight becomes ten assets across ten channels. Inbound stops being something you chase and starts being something you receive. Built from first principles — not recycled LinkedIn advice.",
  },
  {
    icon: Zap,
    title: "You leave with 15 assets. Not a plan to make them.",
    desc: "Nothing in the room is a concept. Every prompt, preset, and workflow ships as finished work before you leave — because a plan you'll execute 'next week' is a plan you'll never execute.",
  },
  {
    icon: Shuffle,
    title: "One idea. Five channels. Thirty minutes a week.",
    desc: "The repurposing system most creators never actually build because they don't have a team. Adam replaces the team with a system you own — live, in the room, locked to your voice.",
  },
  {
    icon: Globe,
    title: "Ready when the moment hits",
    desc: "Prep workflows that take 90 seconds — so you walk into podcasts, pitches, panels, and introductions already knowing what to say, in your own words, without spending a week on it.",
  },
  {
    icon: Users,
    title: "Sounds like you. Not like AI wrote it for a LinkedIn influencer.",
    desc: "A facilitator who has run this at every scale and won't waste a minute of your three hours. No filler slides. No homework. Nothing assigned that doesn't ship before you leave.",
  },
];

export function FacilitatorPillars() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground md:text-sm md:tracking-[0.2em]">
        What he brings to the room
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PILLARS.map(({ icon: Icon, title, desc }) => (
          <motion.div
            key={title}
            whileHover={{ scale: 1.02, boxShadow: "0 10px 30px -10px rgb(0 0 0 / 0.3)" }}
            transition={{ duration: 0.2 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <Icon className="text-primary mb-4" size={24} />
            <h3 className="text-lg font-semibold tracking-tight text-card-foreground mb-2">{title}</h3>
            <p className="text-sm leading-[1.7] text-muted-foreground">{desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
