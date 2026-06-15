import { motion } from "framer-motion";

export function FacilitatorStory() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground md:text-sm md:tracking-[0.2em]">
        The story
      </p>
      <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">Built it. Didn't just teach it.</h2>
      <div className="mt-4 space-y-6 text-base text-foreground/90 md:mt-5 md:text-lg">
        <p>
          <span className="font-semibold text-foreground">Enterprise.</span> Adam's first chapter was inside some of the most demanding brand environments in North America — the Mayo Clinic Experience Center at Mall of America, the 3M HIS Division Experience Center, the Amway Arena. Citigroup. Disney. Fortune 500 clients who couldn't afford to get it wrong. He didn't just design for them. He built the systems those brands ran on.
        </p>
        <p>
          <span className="font-semibold text-foreground">Nation-scale.</span> In 2014 he moved to the Federation of St. Kitts & Nevis to co-found the region's largest public-private technology partnership. He engineered the national eGovernment portal, the Inland Revenue tax system, and a child-protective-services platform. Branded the national Citizenship-by-Investment program. Directed COVID-19 crisis communications for the Ministry of Health. Co-created the Caribbean Investment Summit — now a five-jurisdiction franchise. He didn't consult on any of it. He built it.
        </p>
        <blockquote className="border-l-[3px] border-primary pl-5 italic text-xl tracking-tight leading-tight md:text-3xl text-foreground">
          I didn't learn AI in a classroom. I shipped five products with it — while running a live agency, producing international events, and advising clients who couldn't afford to get it wrong.
        </blockquote>
        <p>
          <span className="font-semibold text-foreground">Frontier.</span> Right now Adam is building Ampfli (<a href="https://askeve.io" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">askeve.io</a>), an AI content intelligence platform, and the Institute of AI Professionals (<a href="https://theiaip.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">theiaip.com</a>) — a global standards body with founding chapters across five world regions. He builds on the bleeding edge daily: frontier LLMs, agentic workflows, AI-native code generation, vector databases, edge infrastructure. The same toolchain he uses in production is the one he installs in the room with you.
        </p>
      </div>
    </motion.section>
  );
}
