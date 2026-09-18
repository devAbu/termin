import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { Salon } from "@/types/entities";

/** "Radno vrijeme" tab: opening hours per day with a session-only open/closed toggle. */
export function HoursTab({
  openingHours,
  hoursClosed,
  isOwner,
  onToggle,
}: {
  openingHours: Salon["openingHours"];
  hoursClosed: Record<number, boolean>;
  isOwner: boolean;
  onToggle: (dayIndex: number, wasOpen: boolean) => void;
}) {
  const t = useTranslations("dashboard");

  return (
    <div className="flex flex-col divide-y divide-border-subtle rounded-card bg-card shadow-card">
      <div className="p-4 text-sm text-text-secondary">{isOwner ? t("hoursNoteOwner") : t("hoursNoteWorker")}</div>
      {openingHours.map((h, i) => {
        const baseOpen = h.time !== null;
        const open = hoursClosed[i] === undefined ? baseOpen : !hoursClosed[i];
        return (
          <div key={h.day} className="flex items-center justify-between gap-3 p-4">
            <span className="font-medium text-text-primary">{h.day}</span>
            <div className="flex items-center gap-3">
              <span className={open ? "text-text-primary" : "text-text-muted"}>{open && h.time !== null ? h.time : t("hoursClosed")}</span>
              <button
                type="button"
                onClick={() => onToggle(i, open)}
                className={cn("h-8 rounded-pill px-3 text-xs font-semibold", open ? "bg-brand-subtle text-brand" : "border border-border-subtle bg-card text-text-secondary")}
              >
                {open ? t("hoursOpen") : t("hoursClosed")}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
