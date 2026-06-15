import { motion } from "framer-motion";
import adamPortrait from "@/assets/adam-anderson.jpg";

export function FacilitatorHero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col md:flex-row md:items-start md:gap-10"
    >
      {/* Portrait — small on mobile (stacked above), 160px square on desktop (right of headline) */}
      <div className="order-1 md:order-2 md:flex-shrink-0 mb-6 md:mb-0 md:mt-[2.4rem]">
        <div className="overflow-hidden rounded-2xl border border-border shadow-sm w-24 h-24 md:w-40 md:h-40">
          <img
            src={adamPortrait}
            alt="Adam Anderson, workshop facilitator"
            width={320}
            height={320}
            loading="eager"
            className="w-full h-full object-cover"
          />
        </div>
        <p className="hidden md:block text-xs uppercase tracking-[0.18em] text-muted-foreground mt-3">
          Adam Anderson · Facilitator
        </p>
      </div>

      {/* Headline column — keeps the existing left primary border */}
      <div className="order-2 md:order-1 md:flex-1 border-l-4 border-primary pl-6">
        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground md:text-sm md:tracking-[0.2em]">
          Brand Operator & AI Strategist
        </p>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
          Adam Anderson
          <br />
          doesn't write your brand.
          <br />
          He installs the system that does.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground md:mt-5 md:text-lg">
          Adam's take: most personal brands fail not because of bad content — but because there's no system underneath. He's spent years building the framework that fixes that, then compressed it into a single afternoon because that's all the people he works with have. He doesn't write your content. He installs the operating system that does — locked to your voice, grounded in your actual expertise, ready to publish by Monday and run itself every quarter after.
        </p>
      </div>
    </motion.section>
  );
}
