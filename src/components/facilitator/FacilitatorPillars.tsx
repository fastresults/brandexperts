import { motion } from "framer-motion";
import { Brain, Megaphone, Zap, Shuffle, Globe, Users, type LucideIcon } from "lucide-react";

const PILLARS: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Brain, title: "Voice that survives the AI tone trap", desc: "The single biggest reason AI-assisted content gets ignored is that it sounds like ChatGPT in a blazer. Adam built the capture pattern that makes the model write as you at scale — the only structural moat left in a feed flooded with sameness." },
  { icon: Megaphone, title: "Positioning that earns attention, not just followers", desc: "Brand systems built to compound — every well-formed insight becomes ten assets across ten channels, and inbound stops being something you chase and starts being something you receive. Built from first principles, not recycled LinkedIn advice." },
  { icon: Zap, title: "You leave with 15 assets, not a plan to make them", desc: "Nothing taught in the room is a slideware concept. Every prompt, preset, and workflow ships as finished work before you leave — because a plan you'll execute \"next week\" is a plan you'll never execute." },
  { icon: Shuffle, title: "One idea. Five channels. Thirty minutes a week.", desc: "The repurposing system most creators never operationalize because they don't have a team. Adam replaces the team with a system you own — built live, in the room, locked to your voice." },
  { icon: Globe, title: "Ready for the moments that matter", desc: "Prep workflows that work in 90 seconds — so you walk into podcasts, pitches, panels, and introductions already knowing what to say, in your own words, without spending a week on it." },
  { icon: Users, title: "Output that sounds like you, not like AI wrote it for a LinkedIn influencer", desc: "A facilitator who has run this process at every scale and won't waste a minute of your three hours. No filler slides, no homework, nothing assigned that doesn't ship before you leave the room." },
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
            whileHover={{ scale: 1.02, boxShadow: "0 10px 30px -10px rgb(0 0 0 / 0.25)" }}
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
