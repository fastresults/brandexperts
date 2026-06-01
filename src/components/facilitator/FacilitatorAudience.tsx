import { motion } from "framer-motion";
import { Rocket, Briefcase, Mic2, Crown, type LucideIcon } from "lucide-react";

const ITEMS: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Rocket, title: "Founders & CEOs", desc: "Building inbound pipeline from their own profile — leaving the room with the publishing system that turns the next 90 days of meetings, news, and ideas into authority content." },
  { icon: Briefcase, title: "Executives in transition", desc: "Stepping into a new role, a new board, or a public-facing remit — needing a credible brand fast, without three months of agency back-and-forth." },
  { icon: Mic2, title: "Authors, speakers & consultants", desc: "Monetizing authority — turning one well-formed idea into an Op-Ed, a keynote opener, a newsletter, and a month of social presence in a single afternoon." },
  { icon: Crown, title: "Newly-appointed C-suite", desc: "Senior partners, practice leaders, and first-90-day execs who need to show up credibly without weekend rewrites or a ghostwriter on retainer." },
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
