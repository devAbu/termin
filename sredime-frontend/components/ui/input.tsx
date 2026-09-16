import * as React from "react";
import { cn } from "@/lib/utils";

function Input({
  className,
  size = "md",
  ...props
}: React.ComponentProps<"input"> & { size?: "md" | "lg" }) {
  return (
    <input
      data-slot="input"
      className={cn(
        "w-full rounded-control border border-border-subtle bg-card px-3 text-base text-foreground",
        "placeholder:text-text-muted",
        "transition-[background-color,border-color,color,box-shadow] duration-fast ease-standard",
        "focus-visible:outline-none focus-visible:border-border-brand focus-visible:shadow-focus",
        "disabled:opacity-45 disabled:cursor-not-allowed",
        size === "lg" ? "h-[var(--control-height-lg)]" : "h-11",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
