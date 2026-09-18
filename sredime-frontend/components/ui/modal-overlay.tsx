import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ModalOverlay({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("fixed inset-0 z-30 flex items-center justify-center bg-[var(--overlay-scrim)] p-4 backdrop-blur-sm", className)}>
      {children}
    </div>
  );
}
