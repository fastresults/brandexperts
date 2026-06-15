import { Link } from "@tanstack/react-router";
import { StartupLabsLogo } from "@/components/brand/StartupLabsLogo";
import evolveLogoUrl from "@/assets/evolve-logo.svg";

export function SiteFooter() {
  return (
    <footer className="relative border-t border-white/5 py-8 md:py-10">
      {/* Gradient accent line at top */}
      <div className="absolute inset-x-0 top-0 h-px bg-hero-gradient opacity-30" />

      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:gap-6 md:text-left">
        <div className="flex items-center gap-3">
          <Link to="/" className="opacity-80 transition-opacity hover:opacity-100">
            <StartupLabsLogo className="h-9 w-auto md:h-10 text-foreground" />
          </Link>
          <span className="text-muted-foreground/60">· Norcross, GA</span>
        </div>

        <div className="flex flex-col items-center gap-1 md:flex-row md:gap-4">
          <span className="text-muted-foreground/70">
            © {new Date().getFullYear()} · Three hours to build it. Every quarter after to run it.
          </span>
          <span className="hidden md:inline text-muted-foreground/30">·</span>
          <Link
            to="/contact"
            className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Contact
          </Link>
          <span className="hidden md:inline text-muted-foreground/30">·</span>
          <Link
            to="/privacy"
            className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Privacy
          </Link>
          <span className="hidden md:inline text-muted-foreground/30">·</span>
          <Link
            to="/terms"
            className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Terms
          </Link>
        </div>

        <div className="flex items-center gap-2 opacity-70 transition-opacity hover:opacity-100">
          <span className="text-xs text-muted-foreground/60">A division of</span>
          <img src={evolveLogoUrl} alt="Evolve Inc." className="h-7 w-auto md:h-8" />
        </div>
      </div>
    </footer>
  );
}
