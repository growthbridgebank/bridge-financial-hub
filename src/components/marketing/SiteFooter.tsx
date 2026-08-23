import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";

const COLUMNS = [
  {
    title: "Products",
    links: [
      { label: "Checking", to: "/checking" },
      { label: "Savings", to: "/savings" },
      { label: "Investments", to: "/investing" },
      { label: "Rewards", to: "/rewards-overview" },
      { label: "Cards", to: "/cards-overview" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Security", to: "/security-overview" },
      { label: "Contact", to: "/contact" },
      { label: "Careers", to: "/careers" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/legal/privacy" },
      { label: "Terms", to: "/legal/terms" },
      { label: "Disclosures", to: "/legal/disclosures" },
      { label: "Investment Risk Disclosure", to: "/legal/investment-risk" },
      { label: "Rewards Terms", to: "/legal/rewards-terms" },
      { label: "Electronic Communications", to: "/legal/electronic-communications" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-gradient-navy text-primary-foreground">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div>
          <Logo variant="light" />
          <p className="mt-4 max-w-xs text-sm text-primary-foreground/70">
            Building Your Financial Future. A modern financial technology platform for everyday banking, saving, and
            investing.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h2 className="font-display text-sm font-semibold tracking-wide text-gold">{column.title}</h2>
            <ul className="mt-4 space-y-2">
              {column.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-primary-foreground/75 transition-colors hover:text-primary-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="mx-auto w-full max-w-7xl space-y-3 px-4 py-8 text-xs text-primary-foreground/60 sm:px-6">
          <p>
            GrowthBridge Bank (GBB) is a financial technology platform, not a chartered bank. Banking, card, payment,
            brokerage, and identity-verification services are provided only through regulated partner institutions once
            those partners are contracted and connected. GBB does not currently claim FDIC insurance, Federal Reserve
            membership, SEC registration, FINRA membership, a bank charter, or any government affiliation.
          </p>
          <p>
            Investing involves risk, including possible loss of principal. No return is guaranteed. Balances and
            performance shown in the product reflect data returned by connected providers or a clearly labeled test
            environment.
          </p>
          <p>© {new Date().getFullYear()} GrowthBridge Bank. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
