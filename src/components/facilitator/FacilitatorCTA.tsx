import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function FacilitatorCTA() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-hero-gradient p-8 md:p-10"
    >
      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      />
      <div className="relative">
        <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Ready to stop winging it?
        </h2>
        <p className="mt-3 text-base text-white/85 md:mt-4 md:text-lg mb-6">
          Three hours at the IGNITE Center, Norcross GA. Small cohort — full attention. Nothing assigned that doesn't ship before you leave.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold text-neutral-900 transition-all hover:opacity-95 hover:scale-[1.02]"
        >
          Lock in your seat <ArrowRight className="size-4" />
        </Link>
      </div>
    </motion.section>
  );
}
