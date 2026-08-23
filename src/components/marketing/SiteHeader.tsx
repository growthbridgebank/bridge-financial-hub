import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export const NAV_LINKS = [
  { label: "Personal", to: "/personal" },
  { label: "Business", to: "/business" },
  { label: "Checking", to: "/checking" },
  { label: "Savings", to: "/savings" },
  { label: "Investing", to: "/investing" },
  { label: "Rewards", to: "/rewards-overview" },
  { label: "Cards", to: "/cards-overview" },
  { label: "Security", to: "/security-overview" },
  { label: "Help Center", to: "/help" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-1 xl:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "text-foreground bg-secondary" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link to="/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Open an Account</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="min-h-11 min-w-11 xl:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <nav aria-label="Mobile" className="mt-8 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-3 text-base font-medium text-foreground hover:bg-secondary"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="mt-4 rounded-md px-3 py-3 text-base font-medium text-foreground hover:bg-secondary sm:hidden"
                >
                  Sign In
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
