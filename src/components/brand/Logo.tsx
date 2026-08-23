import { Link } from "@tanstack/react-router";
import logo from "@/assets/gbb-logo.png.asset.json";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  variant = "dark",
  withWordmark = true,
}: {
  className?: string;
  variant?: "dark" | "light";
  withWordmark?: boolean;
}) {
  return (
    <Link to="/" className={cn("flex items-center gap-3", className)} aria-label="GrowthBridge Bank home">
      <img
        src={logo.url}
        alt="GrowthBridge Bank GBB emblem"
        className="size-10 shrink-0 rounded-full object-cover"
        width={40}
        height={40}
      />
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-base font-semibold tracking-tight",
              variant === "light" ? "text-primary-foreground" : "text-foreground",
            )}
          >
            GrowthBridge Bank
          </span>
          <span className="mt-1 text-[0.625rem] font-medium tracking-[0.24em] text-gold">GBB</span>
        </span>
      )}
    </Link>
  );
}
