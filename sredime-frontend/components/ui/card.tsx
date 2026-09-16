import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * White, 20px radius, soft shadow, no border (design/README.md — border and
 * shadow never appear together). Pass `interactive` for cards that lift on
 * hover (salon cards, clickable list rows).
 */
function Card({
  className,
  interactive = false,
  ...props
}: React.ComponentProps<"div"> & { interactive?: boolean }) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground rounded-card shadow-card transition-[box-shadow,transform] duration-normal ease-out",
        interactive && "hover:shadow-card-hover hover:-translate-y-0.5",
        className,
      )}
      {...props}
    />
  );
}

export { Card };
