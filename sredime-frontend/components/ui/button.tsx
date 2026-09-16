import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control font-medium " +
    "transition-[background-color,border-color,color,box-shadow] duration-fast ease-standard " +
    "disabled:pointer-events-none disabled:opacity-45 disabled:cursor-not-allowed " +
    "active:scale-[var(--press-scale)] " +
    "focus-visible:outline-none focus-visible:shadow-focus " +
    "[&_svg]:shrink-0 [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-brand text-primary-foreground hover:bg-brand-hover",
        accent: "bg-gold-400 text-[var(--text-on-accent)] hover:bg-gold-500",
        secondary:
          "bg-surface-card border border-border-subtle text-brand hover:bg-brand-subtle",
        ghost: "text-text-secondary hover:bg-brand-subtle hover:text-brand",
        destructive: "bg-danger-bg text-danger-fg hover:bg-danger-border",
        link: "text-brand underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-4 text-sm",
        lg: "h-[var(--control-height-lg)] px-6 text-base",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
