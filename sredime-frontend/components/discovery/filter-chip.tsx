import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Pill filter/category chip — used in the homepage hero and the search page
 * filter bar. `href` renders an anchor, otherwise a toggle button.
 */
export function FilterChip({
  icon,
  children,
  active = false,
  className,
  ...props
}: {
  icon?: React.ReactNode;
  active?: boolean;
  className?: string;
} & (
  | ({ href: string } & React.ComponentProps<"a">)
  | ({ href?: undefined } & React.ComponentProps<"button">)
)) {
  const classes = cn(
    "inline-flex items-center gap-2 h-[38px] rounded-pill border px-4 text-sm font-medium",
    "transition-[background-color,border-color,color] duration-fast ease-standard",
    active
      ? "bg-brand border-brand text-primary-foreground"
      : "bg-card border-border-subtle text-text-primary hover:bg-brand-subtle hover:border-indigo-200 hover:text-brand",
    className,
  );

  if ("href" in props && props.href) {
    const { href, ...rest } = props as { href: string } & React.ComponentProps<"a">;
    return (
      <a href={href} className={classes} {...rest}>
        {icon}
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...(props as React.ComponentProps<"button">)}>
      {icon}
      {children}
    </button>
  );
}
