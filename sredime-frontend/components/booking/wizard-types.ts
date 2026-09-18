import type { LucideIcon } from "lucide-react";

export type Step = 0 | 1 | 2 | 3;

/** One line of the booking recap; `key` identifies which wizard step edits it. */
export interface RecapRow {
  key: "service" | "staff" | "time" | "duration";
  icon: LucideIcon;
  label: string;
  value: string;
}
