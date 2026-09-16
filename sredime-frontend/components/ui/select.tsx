import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

function Select({
  className,
  size = "md",
  children,
  ...props
}: React.ComponentProps<"select"> & { size?: "md" | "lg" }) {
  return (
    <span className="relative flex items-center">
      <select
        data-slot="select"
        className={cn(
          "w-full appearance-none rounded-control border border-border-subtle bg-card px-3 pr-9 text-base text-foreground",
          "transition-[background-color,border-color,color,box-shadow] duration-fast ease-standard",
          "focus-visible:outline-none focus-visible:border-border-brand focus-visible:shadow-focus",
          "disabled:opacity-45 disabled:cursor-not-allowed",
          size === "lg" ? "h-[var(--control-height-lg)]" : "h-11",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 text-icon-muted"
      />
    </span>
  );
}

export { Select };
