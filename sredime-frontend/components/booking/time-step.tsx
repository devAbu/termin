import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDayLabel, formatWeekdayShort, pluralBs } from "@/lib/format";
import { buildDayWindow, isSameDay, startOfDay } from "@/lib/date";
import { BOOKING_WINDOW_DAYS, computeSlots, countFreeSlots, groupSlotsByDayPart, type DayPart } from "@/lib/api/availability";
import type { Salon, Service } from "@/types/entities";

const DAY_PART_LABEL_KEYS = {
  morning: "dayPartMorning",
  afternoon: "dayPartAfternoon",
  evening: "dayPartEvening",
} as const satisfies Record<DayPart, string>;

export function TimeStep({
  salon,
  service,
  activeWorkerIds,
  selectedDate,
  selectedTime,
  onSelectDate,
  onPickSlot,
}: {
  salon: Salon;
  service: Service;
  activeWorkerIds: number[];
  selectedDate: Date;
  selectedTime: string | null;
  onSelectDate: (date: Date) => void;
  onPickSlot: (date: Date, time: string) => void;
}) {
  const t = useTranslations("booking");

  const days = useMemo(() => buildDayWindow(BOOKING_WINDOW_DAYS), []);

  const slots = useMemo(
    () => (activeWorkerIds.length ? computeSlots({ salon, service, workerIds: activeWorkerIds, date: selectedDate }) : []),
    [salon, service, activeWorkerIds, selectedDate],
  );
  const freeSlots = slots.filter((s) => !s.taken);
  const firstFreeSlot = freeSlots[0] ?? null;

  const firstFreeDay = useMemo(() => {
    if (!activeWorkerIds.length) return null;
    for (const d of days) {
      if (countFreeSlots({ salon, service, workerIds: activeWorkerIds, date: d }) > 0) return d;
    }
    return null;
  }, [salon, service, activeWorkerIds, days]);

  const groups = useMemo(() => groupSlotsByDayPart(slots), [slots]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-text-primary md:text-2xl">{t("timeTitle")}</h2>
        <p className="mt-1.5 text-sm text-text-secondary">{t("timeLead", { duration: service.durationMinutes })}</p>
      </div>

      {firstFreeSlot && (
        <div className="flex flex-col gap-2.5 rounded-card bg-card p-4 shadow-card">
          <span className="eyebrow">{t("quickFirstFreeTag")}</span>
          <button
            type="button"
            onClick={() => onPickSlot(selectedDate, firstFreeSlot.time)}
            className={cn(
              "inline-flex w-fit items-center rounded-control px-3.5 py-2 text-sm font-bold",
              selectedTime === firstFreeSlot.time ? "bg-brand text-primary-foreground" : "bg-brand-subtle text-brand",
            )}
          >
            {formatDayLabel(selectedDate)}, {firstFreeSlot.time}
          </button>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((d) => {
          const daySlots = computeSlots({ salon, service, workerIds: activeWorkerIds, date: d });
          const count = daySlots.filter((s) => !s.taken).length;
          const isSelected = isSameDay(d, selectedDate);
          const isClosed = daySlots.length === 0;
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => onSelectDate(startOfDay(d))}
              className={cn(
                "flex flex-none flex-col items-center gap-0.5 rounded-control px-0 py-2.5",
                isSelected ? "bg-brand text-primary-foreground" : "border border-border-subtle bg-card text-text-primary",
              )}
              style={{ width: 70 }}
            >
              <span className="text-2xs uppercase tracking-wide opacity-75">{formatWeekdayShort(d)}</span>
              <span className="text-lg font-bold leading-tight">{d.getDate()}</span>
              <span className={cn("text-2xs", isSelected ? "opacity-85" : count > 0 ? "text-success-fg" : "text-text-muted")}>
                {count > 0 ? `${count} ${pluralBs(count, t("freeOne"), t("freeFew"), t("freeMany"))}` : isClosed ? t("dayClosed") : t("dayFull")}
              </span>
            </button>
          );
        })}
      </div>

      {freeSlots.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-card bg-card p-8 text-center shadow-card">
          <span className="text-sm text-text-secondary">{t("emptyDayTitle")}</span>
          {firstFreeDay && (
            <Button type="button" variant="secondary" size="sm" onClick={() => onSelectDate(startOfDay(firstFreeDay))}>
              {t("jumpToFirstFree", { day: formatDayLabel(firstFreeDay) })}
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map((g) => (
            <div key={g.part} className="flex flex-col gap-2.5 rounded-card bg-card p-4 shadow-card">
              <span className="text-sm font-bold text-text-primary">{t(DAY_PART_LABEL_KEYS[g.part])}</span>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(76px,1fr))] gap-2">
                {g.items.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={slot.taken}
                    onClick={() => onPickSlot(selectedDate, slot.time)}
                    className={cn(
                      "h-9 rounded-control text-sm font-medium",
                      slot.taken
                        ? "cursor-not-allowed bg-surface-sunken text-text-muted line-through"
                        : selectedTime === slot.time
                          ? "bg-brand text-primary-foreground"
                          : "border border-border-subtle bg-card text-text-primary hover:bg-brand-subtle",
                    )}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
