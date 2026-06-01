import { motion } from "framer-motion";
import { Rocket, Briefcase, Mic2, Crown, type LucideIcon } from "lucide-react";

const ITEMS: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Rocket, title: "Founders & CEOs", desc: "Done chasing opportunities, ready to be chased by them. Walk out with the publishing system that turns the next 90 days of meetings, news cycles, and half-formed ideas into the authority content that walks deals, speaking invites, and talent through your door." },
  { icon: Briefcase, title: "Executives in transition", desc: "Stepping into a new role, a new board, or a public-facing remit — and out of time. A credible brand installed in one afternoon, instead of three months of agency back-and-forth and a résumé that no longer does the work it used to." },
  { icon: Mic2, title: "Authors, speakers & consultants", desc: "Monetizing authority on a 10x multiplier. One well-formed idea becomes an Op-Ed, a keynote opener, a newsletter, and a month of social — every asset traceable to your actual expertise, none of it ghostwritten." },
  { icon: Crown, title: "Newly-appointed C-suite", desc: "Senior partners, practice leaders, and first-90-day execs who need to show up credibly from week one — without weekend rewrites, a $8K monthly ghostwriter retainer, or a public footprint that contradicts itself across LinkedIn, press, and the keynote stage." },
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
