import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FacilitatorCTA() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="border-l-4 border-primary bg-card rounded-xl p-10"
    >
      <h2 className="text-2xl font-semibold tracking-tight text-card-foreground md:text-3xl">
        Ready to install the system?
      </h2>
      <p className="mt-3 text-base text-muted-foreground md:mt-4 md:text-lg mb-6">
        Three-hour afternoon intensives at the IGNITE Center, Norcross, GA. Small cohort — full facilitator attention. Nothing assigned that doesn't ship before you leave the room.
      </p>
      <Button asChild size="lg">
        <Link to="/register">
          Claim your seat <ArrowRight className="ml-1 size-4" />
        </Link>
      </Button>
    </motion.section>
  );
}
