import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Type-set wordmark — no logo file was supplied with the brand brief
 * (design/README.md). Replace with the real mark when one exists.
 */
export function Logo({ inverse = false, className }: { inverse?: boolean; className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "shrink-0 text-lg font-bold tracking-[-0.01em]",
        inverse ? "text-white" : "text-text-primary",
        className,
      )}
    >
      Sredi
      <span className={inverse ? "text-gold-400" : "text-gold-500"}>Me</span>
    </Link>
  );
}
