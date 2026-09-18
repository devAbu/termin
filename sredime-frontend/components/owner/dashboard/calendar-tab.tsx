import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { firstName, formatDayLabel } from "@/lib/format";
import { addDays, startOfDay } from "@/lib/date";
import { hoursForDate } from "@/lib/api/availability";
import { countNoShows } from "@/lib/api/booking-metrics";
import { pickBookingsForDate, type BookingDetails, type SalonClientSummary } from "@/lib/api/bookings";
import { dayFullnessPercent } from "@/lib/api/dashboard";
import type { Salon, Worker } from "@/types/entities";
import { AppointmentList, type AppointmentActions } from "./appointment-card";

const NO_SHOW_KPI_WINDOW_DAYS = 30;

/** "Kalendar" tab: day navigation, KPI cards, worker filter and that day's appointments. */
export function CalendarTab({
  salon,
  workers,
  allBookings,
  clients,
  now,
  dayOffset,
  onDayOffsetChange,
  staffFilter,
  onStaffFilterChange,
  actions,
  onFlash,
}: {
  salon: Salon;
  workers: Worker[];
  allBookings: BookingDetails[];
  clients: SalonClientSummary[];
  now: Date;
  dayOffset: number;
  onDayOffsetChange: (dayOffset: number) => void;
  staffFilter: number | "all";
  onStaffFilterChange: (filter: number | "all") => void;
  actions: AppointmentActions;
  onFlash: (message: string) => void;
}) {
  const t = useTranslations("dashboard");

  const day = useMemo(() => addDays(startOfDay(new Date()), dayOffset), [dayOffset]);
  const dayBookings = useMemo(() => pickBookingsForDate(allBookings, day), [allBookings, day]);
  const dayHours = hoursForDate(salon, day);
  const filteredDayBookings = dayBookings.filter((b) => staffFilter === "all" || b.worker.id === staffFilter);
  const pendingForDay = dayBookings.filter((b) => b.status === "pending").length;
  const noShows30 = useMemo(() => countNoShows(allBookings, { now, days: NO_SHOW_KPI_WINDOW_DAYS }), [allBookings, now]);
  const fullnessPct = dayFullnessPercent(filteredDayBookings, dayHours);

  const kpis = [
    { label: t("kpiApptsLabel"), value: String(filteredDayBookings.length) },
    { label: t("kpiPendingLabel"), value: String(pendingForDay) },
    { label: t("kpiFullLabel"), value: dayHours ? `${fullnessPct}%` : "—" },
    { label: t("kpiNoShowLabel"), value: String(noShows30) },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => onDayOffsetChange(dayOffset - 1)} className="flex h-9 w-9 items-center justify-center rounded-control border border-border-subtle bg-card">
          <Icon icon={ChevronLeft} size={16} />
        </button>
        <button
          type="button"
          onClick={() => (dayOffset === 0 ? onFlash(t("alreadyToday")) : onDayOffsetChange(0))}
          className="h-9 rounded-control border border-border-subtle bg-card px-3.5 text-sm font-medium text-text-primary"
        >
          {dayOffset === 0 ? t("today") : formatDayLabel(day)}
        </button>
        <button type="button" onClick={() => onDayOffsetChange(dayOffset + 1)} className="flex h-9 w-9 items-center justify-center rounded-control border border-border-subtle bg-card">
          <Icon icon={ChevronRight} size={16} />
        </button>
        <span className="text-sm text-text-secondary">{formatDayLabel(day)}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="flex flex-col gap-1 rounded-card bg-card p-4 shadow-card">
            <span className="eyebrow">{kpi.label}</span>
            <span className="text-2xl font-bold text-text-primary">{kpi.value}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => onStaffFilterChange("all")}
          className={cn("h-8 flex-none rounded-pill px-3.5 text-xs font-medium", staffFilter === "all" ? "bg-brand-subtle text-brand" : "border border-border-subtle bg-card text-text-secondary")}
        >
          {t("staffFilterAll")}
        </button>
        {workers.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => onStaffFilterChange(w.id)}
            className={cn("h-8 flex-none rounded-pill px-3.5 text-xs font-medium", staffFilter === w.id ? "bg-brand-subtle text-brand" : "border border-border-subtle bg-card text-text-secondary")}
          >
            {firstName(w.name)}
          </button>
        ))}
      </div>

      {filteredDayBookings.length === 0 ? (
        <div className="flex flex-col items-center gap-1.5 rounded-card bg-card p-10 text-center shadow-card">
          <span className="text-base font-bold text-text-primary">{dayHours ? t("emptyDayNone") : t("emptyDayClosed")}</span>
          <span className="text-sm text-text-secondary">{t("emptyDaySub")}</span>
        </div>
      ) : (
        <AppointmentList bookings={filteredDayBookings} clients={clients} actions={actions} />
      )}
    </>
  );
}
