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
      {/* Portrait */}
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

      {/* Headline */}
      <div className="order-2 md:order-1 md:flex-1 border-l-4 border-primary pl-6">
        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground md:text-sm md:tracking-[0.2em]">
          Brand Operator · AI Builder · Public Figure Maker
        </p>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
          Adam Anderson has made
          <br />
          50 founders the name
          <br />
          <span className="text-gradient-brand">in their category. You're next.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground md:mt-5 md:text-lg">
          He's not a coach. Not a ghostwriter. Not a consultant who disappears after the deck.
          He's the operator who built the system that turns founders and executives from
          respected-in-their-circle to publicly known in their category — in one afternoon.
          He's installed it 50+ times. He runs it himself. Now he installs it for you.
        </p>
      </div>
    </motion.section>
  );
}
