import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import brandexpertsLogoUrl from "@/assets/brandexperts-header.svg";
import { getPublicSiteSettings } from "@/lib/site-settings.functions";
import { PRICING } from "@/lib/value-grid";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";


const nav = [
  { to: "/", label: "home" },
  { to: "/schedule", label: "schedule" },
  { to: "/register", label: "join" },
  { to: "/facilitator", label: "who" },
  { to: "/contact", label: "contact" },
] as const;

export function SiteHeader() {
  const { isAuthenticated, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const getSettings = useServerFn(getPublicSiteSettings);
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => getSettings(),
    staleTime: 60_000,
  });
  const isFreeCohort = settings?.home_variant === "selection";
  const ctaFull = isFreeCohort ? "Apply — free cohort" : `Lock in your seat — from $${PRICING.founders.price}`;
  const ctaShort = isFreeCohort ? "Apply" : "Join";

  const close = () => setOpen(false);

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-2xl backdrop-saturate-200"
      style={{
        backgroundColor: "var(--header-bg)",
        borderBottom: "1px solid var(--header-border)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 md:px-6">
        <Link
          to="/"
          className="flex items-center font-semibold tracking-tight transition-opacity hover:opacity-80"
          aria-label="Atlanta Startup Workshop"
        >
          <img src={brandexpertsLogoUrl} alt="BrandExperts" className="h-9 w-auto md:h-12" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground lg:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: true }}
              activeProps={{
                className:
                  "text-foreground relative after:absolute after:inset-x-0 after:-bottom-[18px] after:h-0.5 after:rounded-full after:bg-hero-gradient",
              }}
              className="relative transition-colors hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className="relative transition-colors hover:text-foreground"
            >
              admin
            </Link>
          )}
        </nav>

        {/* Desktop right side */}
        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                dashboard
              </Link>
              <button
                onClick={() => signOut()}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              sign in
            </Link>
          )}
          <Link
            to="/register"
            className="rounded-full bg-hero-gradient px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.03] hover:glow-brand"
          >
            {ctaFull}
          </Link>
        </div>

        {/* Mobile + tablet right side */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            to="/register"
            className="rounded-full bg-hero-gradient px-3.5 py-2 text-sm font-medium text-white transition-all hover:opacity-90 hover:scale-[1.03]"
          >
            {ctaShort}
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Open menu"
                className="inline-flex size-11 items-center justify-center rounded-full border border-white/15 text-foreground transition-all hover:border-white/30 hover:bg-white/5"
              >
                <Menu className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[82vw] max-w-sm border-white/10 bg-background p-0"
              style={{ backdropFilter: "blur(24px) saturate(1.8)" }}
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center gap-3 border-b border-white/5 px-6 py-5">
                  <img src={brandexpertsLogoUrl} alt="BrandExperts" className="h-9 w-auto" />
                </div>
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SheetDescription className="sr-only">
                  Site navigation and account actions
                </SheetDescription>

                <nav className="flex flex-col px-2 py-3">
                  {nav.map((n) => (
                    <Link
                      key={n.to}
                      to={n.to}
                      onClick={close}
                      activeOptions={{ exact: true }}
                      activeProps={{
                        className:
                          "text-foreground bg-white/[0.07] border-l-2 border-brand-magenta pl-[14px]",
                      }}
                      className="rounded-xl px-4 py-3 text-base capitalize text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground"
                    >
                      {n.label}
                    </Link>
                  ))}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={close}
                      className="rounded-xl px-4 py-3 text-base text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground"
                    >
                      admin
                    </Link>
                  )}
                </nav>

                <div className="mt-auto space-y-3 border-t border-white/5 px-6 py-5">
                  <Link
                    to="/register"
                    onClick={close}
                    className="flex w-full items-center justify-center rounded-full bg-hero-gradient px-5 py-3 text-base font-medium text-white transition-all hover:opacity-90 hover:glow-brand"
                  >
                    {ctaFull}
                  </Link>
                  {isAuthenticated ? (
                    <>
                      <Link
                        to="/dashboard"
                        onClick={close}
                        className="flex w-full items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm text-muted-foreground transition-colors hover:border-white/30 hover:text-foreground"
                      >
                        dashboard
                      </Link>
                      <button
                        onClick={() => {
                          close();
                          signOut();
                        }}
                        className="flex w-full items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm text-muted-foreground transition-colors hover:border-white/30 hover:text-foreground"
                      >
                        sign out
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      onClick={close}
                      className="flex w-full items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm text-muted-foreground transition-colors hover:border-white/30 hover:text-foreground"
                    >
                      sign in
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
