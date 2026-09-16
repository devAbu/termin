import type { LucideIcon, LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Wrapper around lucide-react — design/README.md: "always use it; never
 * paste raw SVG paths". Icons inherit currentColor by default; tint with
 * text-icon-default / text-icon-muted or a semantic color utility.
 */
export function Icon({
  icon: LucideIconComponent,
  size = 20,
  className,
  ...props
}: { icon: LucideIcon; size?: number } & Omit<LucideProps, "size">) {
  return (
    <LucideIconComponent
      size={size}
      strokeWidth={2}
      className={cn("shrink-0", className)}
      {...props}
    />
  );
}
