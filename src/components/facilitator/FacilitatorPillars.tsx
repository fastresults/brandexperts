import { motion } from "framer-motion";
import { Brain, Megaphone, Zap, Shuffle, Globe, Users, type LucideIcon } from "lucide-react";

const PILLARS: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Brain, title: "Voice that survives the AI tone trap", desc: "The single biggest reason AI-assisted executive content gets ignored is that it sounds like ChatGPT in a blazer. Adam built the capture pattern that makes the model write as you at scale — the only structural moat left in a feed flooded with sameness." },
  { icon: Megaphone, title: "Authority engineering, not follower hacks", desc: "Brand systems engineered to compound — every well-formed insight becomes ten authority assets, and inbound stops being something you chase and starts being something you receive. Drawn from four decades of Fortune 500 storytelling and seven years inside a sovereign communications office." },
  { icon: Zap, title: "Three hours of finished work, not theory", desc: "Nothing taught in the room is a slideware concept. Every prompt, preset, and workflow is one Adam ran in production this week — for executives whose calendars don't survive a week-long draft-review-revise loop." },
  { icon: Shuffle, title: "One idea → five channels", desc: "The repurposing engine most executives never operationalize because they don't have a team. Adam replaces the comms team with a system you own — live, in the room, in your voice." },
  { icon: Globe, title: "Boardroom-grade prep on demand", desc: "Strategy and prep workflows stress-tested with Citigroup boardrooms, OECS heads of government, and the St. Kitts–Nevis pavilion at Expo 2020 Dubai. Walk into any meeting already knowing the company's strategy, recent moves, and pressure points — in 90 seconds, not a junior analyst's week." },
  { icon: Users, title: "Executive-caliber delivery", desc: "A facilitator who has briefed prime ministers, CMOs, and conference mainstages. No wasted words, no filler slides, no homework — and nothing assigned that doesn't ship before you leave the room." },
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
