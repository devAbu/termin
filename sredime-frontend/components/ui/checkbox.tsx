import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

function Checkbox({
  className,
  checked,
  onCheckedChange,
  ...props
}: Omit<React.ComponentProps<"input">, "type" | "checked" | "onChange"> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  return (
    <span className="relative inline-flex h-5 w-5 flex-none items-center justify-center">
      <input
        data-slot="checkbox"
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className={cn(
          "peer h-5 w-5 cursor-pointer appearance-none rounded-xs border border-border-subtle bg-card",
          "checked:border-brand checked:bg-brand",
          "transition-[background-color,border-color] duration-fast ease-standard",
          "focus-visible:outline-none focus-visible:shadow-focus",
          "disabled:cursor-not-allowed disabled:opacity-45",
          className,
        )}
        {...props}
      />
      <Check size={13} strokeWidth={3} className="pointer-events-none absolute text-primary-foreground opacity-0 peer-checked:opacity-100" />
    </span>
  );
}

export { Checkbox };
