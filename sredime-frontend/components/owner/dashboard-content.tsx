"use client";

import { useMemo, useState } from "react";
import {
  Ban,
  BarChart3,
  Calendar,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  Clock,
  Inbox,
  Plus,
  Repeat,
  Tag,
  TriangleAlert,
  UserPlus,
  UserX,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { formatPrice, formatDayLabel, formatWeekdayShort, pluralBs } from "@/lib/format";
import { hoursForDate } from "@/lib/api/availability";
import {
  pickBookingsForDate,
  pickPendingBookings,
  summarizeClients,
  type BookingDetails,
} from "@/lib/api/bookings";
import { NewAppointmentModal, type NewBookingInput } from "@/components/owner/new-appointment-modal";
import type { Salon, Service, Worker, BookingStatus } from "@/types/entities";
import type { VariantProps } from "class-variance-authority";

export type Page = "kalendar" | "zahtjevi" | "klijenti" | "usluge" | "radnici" | "vrijeme" | "statistika";
type Role = "owner" | "worker";
type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

const STATUS_TONE: Record<BookingStatus, BadgeTone> = {
  pending: "warning",
  confirmed: "success",
  completed: "neutral",
  cancelled_by_client: "neutral",
  cancelled_by_salon: "danger",
  no_show: "danger",
};

const STATUS_ICON = {
  pending: Clock,
  confirmed: CircleCheck,
  completed: Check,
  cancelled_by_client: CircleX,
  cancelled_by_salon: CircleX,
  no_show: UserX,
};

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function timeOf(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function endTimeOf(iso: string, durationMinutes: number) {
  const end = new Date(new Date(iso).getTime() + durationMinutes * 60_000);
  return `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`;
}

let nextLocalId = 100000;

export function DashboardContent({
  salon,
  workers,
  services,
  bookings,
  initialPage = "kalendar",
}: {
  salon: Salon;
  workers: Worker[];
  services: Service[];
  bookings: BookingDetails[];
  initialPage?: Page;
}) {
  const t = useTranslations("dashboard");
  const tStatus = useTranslations("bookingStatus");
  const tClient = useTranslations("clientHistory");

  const [role, setRole] = useState<Role>("owner");
  const [page, setPage] = useState<Page>(initialPage);
  const [dayOffset, setDayOffset] = useState(0);
  const [staffFilter, setStaffFilter] = useState<number | "all">("all");
  const [overrides, setOverrides] = useState<Record<number, Partial<BookingDetails>>>({});
  const [extra, setExtra] = useState<BookingDetails[]>([]);
  const [canBlockOverrides, setCanBlockOverrides] = useState<Record<number, boolean>>({});
  const [hoursClosed, setHoursClosed] = useState<Record<number, boolean>>({});
  const [actionModal, setActionModal] = useState<{ type: "move" | "cancel" | "noshow"; bookingId: number } | null>(null);
  const [newApptOpen, setNewApptOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [now] = useState(() => new Date());

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast((cur) => (cur === msg ? null : cur)), 2600);
  }

  const isOwner = role === "owner";

  const allBookings = useMemo(() => {
    const merged = bookings.map((b) => (overrides[b.id] ? { ...b, ...overrides[b.id] } : b));
    return [...merged, ...extra].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }, [bookings, overrides, extra]);

  const clients = useMemo(() => summarizeClients(allBookings), [allBookings]);

  const days = useMemo(() => {
    const base = startOfDay(new Date());
    const d = new Date(base);
    d.setDate(base.getDate() + dayOffset);
    return d;
  }, [dayOffset]);

  const dayBookings = useMemo(() => pickBookingsForDate(allBookings, days), [allBookings, days]);
  const dayHours = hoursForDate(salon, days);
  const filteredDayBookings = dayBookings.filter((b) => staffFilter === "all" || b.worker.id === staffFilter);
  const pendingForDay = dayBookings.filter((b) => b.status === "pending").length;
  const allPending = useMemo(() => pickPendingBookings(allBookings), [allBookings]);

  const noShows30 = useMemo(() => {
    const cutoff = now.getTime() - 30 * 86_400_000;
    return allBookings.filter((b) => b.status === "no_show" && new Date(b.scheduledAt).getTime() >= cutoff).length;
  }, [allBookings, now]);

  const fullnessPct = useMemo(() => {
    if (!dayHours) return null;
    const span = dayHours.close - dayHours.open;
    const busy = filteredDayBookings
      .filter((b) => b.status !== "cancelled_by_client" && b.status !== "cancelled_by_salon")
      .reduce((sum, b) => sum + b.service.durationMinutes, 0);
    return Math.min(100, Math.round((busy / span) * 100));
  }, [dayHours, filteredDayBookings]);

  const NAV: { id: Page; label: string; icon: typeof Calendar; ownerOnly?: boolean; count?: number }[] = [
    { id: "kalendar", label: t("navCalendar"), icon: CalendarDays },
    { id: "zahtjevi", label: t("navRequests"), icon: Inbox, count: allPending.length },
    { id: "klijenti", label: t("navClients"), icon: Users },
    { id: "usluge", label: t("navServices"), icon: Tag, ownerOnly: true },
    { id: "radnici", label: t("navStaff"), icon: UserPlus, ownerOnly: true },
    { id: "vrijeme", label: t("navHours"), icon: Clock },
    { id: "statistika", label: t("navStats"), icon: BarChart3, ownerOnly: true },
  ];
  const visibleNav = NAV.filter((n) => isOwner || !n.ownerOnly);

  function setStatus(id: number, status: BookingStatus, msg: string) {
    setOverrides((cur) => ({ ...cur, [id]: { ...cur[id], status } }));
    setActionModal(null);
    flash(msg);
  }

  function moveBooking(id: number, newIso: string) {
    setOverrides((cur) => ({ ...cur, [id]: { ...cur[id], scheduledAt: newIso, status: "confirmed" } }));
    setActionModal(null);
    flash(t("movedToast", { when: `${formatWeekdayShort(new Date(newIso))} ${new Date(newIso).getDate()}., ${timeOf(newIso)}` }));
  }

  function actionsFor(b: BookingDetails) {
    const out: { label: string; icon: typeof Check; variant: "primary" | "secondary" | "destructive"; onClick: () => void }[] = [];
    if (b.status === "pending") {
      out.push({ label: t("confirmAction"), icon: CircleCheck, variant: "primary", onClick: () => setStatus(b.id, "confirmed", t("confirmedToast")) });
    }
    if (b.status === "pending" || b.status === "confirmed") {
      out.push({ label: t("moveAction"), icon: Repeat, variant: "secondary", onClick: () => setActionModal({ type: "move", bookingId: b.id }) });
      out.push({ label: t("cancelAction"), icon: CircleX, variant: "destructive", onClick: () => setActionModal({ type: "cancel", bookingId: b.id }) });
    }
    if (b.status === "confirmed") {
      out.push({ label: t("completeAction"), icon: Check, variant: "secondary", onClick: () => setStatus(b.id, "completed", t("completedToast")) });
      out.push({ label: t("noShowAction"), icon: UserX, variant: "destructive", onClick: () => setActionModal({ type: "noshow", bookingId: b.id }) });
    }
    return out;
  }

  function renderAppointmentCard(b: BookingDetails) {
    const StatusIcon = STATUS_ICON[b.status];
    return (
      <div
        key={b.id}
        className={cn(
          "grid grid-cols-1 gap-3 rounded-card p-4 shadow-card sm:grid-cols-[80px_minmax(0,1fr)] md:grid-cols-[80px_minmax(0,1fr)_auto] md:items-center md:gap-4",
          b.status === "pending" ? "bg-brand-subtle" : "bg-card",
        )}
      >
        <div className="flex flex-col">
          <span className="text-sm font-bold text-text-primary">{timeOf(b.scheduledAt)}</span>
          <span className="text-xs text-text-muted">{endTimeOf(b.scheduledAt, b.service.durationMinutes)}</span>
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-text-primary">{b.clientName}</span>
            <Badge variant={STATUS_TONE[b.status]}>
              <Icon icon={StatusIcon} size={11} />
              {tStatus(b.status)}
            </Badge>
            {b.manuallyEntered && <Badge variant="info">{t("manualBadge")}</Badge>}
          </div>
          <span className="text-sm text-text-secondary">
            {b.service.name} · {b.worker.name} · {formatPrice(b.service.price)}
          </span>
          {clients.find((c) => c.name === b.clientName)?.noShowCount ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-warning-fg">
              <Icon icon={TriangleAlert} size={12} />
              {clients.find((c) => c.name === b.clientName)?.noShowCount} prethodnih nedolazaka
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          {actionsFor(b).map((a) => (
            <Button key={a.label} type="button" variant={a.variant} size="sm" onClick={a.onClick}>
              <Icon icon={a.icon} size={13} />
              {a.label}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  const modalBooking = actionModal ? allBookings.find((b) => b.id === actionModal.bookingId) ?? null : null;

  const moveSlots = useMemo(() => {
    if (!modalBooking) return [];
    const need = modalBooking.service.durationMinutes + modalBooking.service.bufferMinutes;
    const out: { date: Date; time: string; iso: string }[] = [];
    for (let dayOff = 0; dayOff < 7 && out.length < 4; dayOff++) {
      const d = new Date(startOfDay(new Date()));
      d.setDate(d.getDate() + dayOff);
      const hours = hoursForDate(salon, d);
      if (!hours) continue;
      const busy = allBookings
        .filter((b) => b.id !== modalBooking.id && b.worker.id === modalBooking.worker.id)
        .filter((b) => {
          const bd = new Date(b.scheduledAt);
          return bd.getFullYear() === d.getFullYear() && bd.getMonth() === d.getMonth() && bd.getDate() === d.getDate();
        })
        .map((b) => {
          const bd = new Date(b.scheduledAt);
          const start = bd.getHours() * 60 + bd.getMinutes();
          return { start, end: start + b.service.durationMinutes + 10 };
        });
      for (let t2 = hours.open; t2 + need <= hours.close && out.length < 4; t2 += 30) {
        const overlaps = busy.some((r) => t2 < r.end && t2 + need > r.start);
        if (!overlaps) {
          const time = `${String(Math.floor(t2 / 60)).padStart(2, "0")}:${String(t2 % 60).padStart(2, "0")}`;
          // Manual local-time string, not toISOString() — that converts to UTC and shifts the hour (same bug fixed earlier in bookings.json).
          const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${time}:00`;
          out.push({ date: d, time, iso });
        }
      }
    }
    return out;
  }, [modalBooking, salon, allBookings]);
  const [moveChoice, setMoveChoice] = useState(0);

  function handleNewBooking(input: NewBookingInput) {
    const iso = new Date(input.date);
    const [h, m] = input.time.split(":").map(Number);
    iso.setHours(h, m, 0, 0);
    const isoStr = `${iso.getFullYear()}-${String(iso.getMonth() + 1).padStart(2, "0")}-${String(iso.getDate()).padStart(2, "0")}T${input.time}:00`;
    const service = services.find((s) => s.id === input.serviceId)!;
    const worker = workers.find((w) => w.id === input.workerId)!;
    const booking: BookingDetails = {
      id: nextLocalId++,
      clientId: null,
      clientName: input.clientName,
      clientPhone: input.clientPhone,
      status: "confirmed",
      scheduledAt: isoStr,
      manuallyEntered: true,
      salon: { id: salon.id, name: salon.name, slug: salon.slug, address: salon.address },
      service: { id: service.id, name: service.name, durationMinutes: service.durationMinutes, bufferMinutes: service.bufferMinutes, price: service.price },
      worker: { id: worker.id, name: worker.name },
    };
    setExtra((cur) => [...cur, booking]);
    setNewApptOpen(false);
    flash(t("addedToast", { who: input.clientName, when: `${input.date.getDate()}.${input.date.getMonth() + 1}., ${input.time}` }));
  }

  return (
    <div className="flex min-h-full bg-surface-canvas">
      <aside className="hidden w-60 flex-none flex-col gap-5 bg-surface-inverse p-4 text-brand-on lg:flex">
        <div className="flex flex-col gap-0.5 px-2 py-1">
          <span className="text-base font-bold tracking-tight">{salon.name}</span>
          <span className="text-xs text-indigo-200">{salon.city}</span>
        </div>
        <nav className="flex flex-col gap-1">
          {visibleNav.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setPage(n.id)}
              className={cn(
                "flex h-10 items-center gap-2.5 rounded-control px-2.5 text-sm font-medium",
                page === n.id ? "bg-indigo-500 text-brand-on" : "text-indigo-200 hover:bg-indigo-500/60",
              )}
            >
              <Icon icon={n.icon} size={17} />
              <span className="flex-1 text-left">{n.label}</span>
              {!!n.count && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-2xs font-bold text-[var(--text-on-accent)]">
                  {n.count}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="flex-1" />
        <div className="flex flex-col gap-2 rounded-control bg-indigo-500 p-3">
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{isOwner ? "Selma Hodžić" : "Lejla Hadžić"}</span>
            <span className="text-xs text-indigo-200">{isOwner ? t("viewingAsOwner") : t("viewingAsWorker")}</span>
          </div>
          <div className="flex gap-1.5">
            {(["owner", "worker"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRole(r);
                  if (r === "worker" && page === "statistika") setPage("kalendar");
                }}
                className={cn(
                  "h-7 flex-1 rounded-control text-2xs font-semibold",
                  role === r ? "bg-card text-brand" : "bg-transparent text-indigo-200",
                )}
              >
                {r === "owner" ? t("roleOwner") : t("roleWorker")}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-col gap-3 border-b border-border-subtle bg-card px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-text-primary lg:text-xl">
                {{
                  kalendar: t("calendarTitle"),
                  zahtjevi: t("requestsTitle"),
                  klijenti: t("clientsTitle"),
                  usluge: t("servicesTitle"),
                  radnici: t("staffTitle"),
                  vrijeme: isOwner ? t("hoursTitleOwner") : t("hoursTitleWorker"),
                  statistika: t("statsTitle"),
                }[page]}
              </span>
            </div>
            {page === "kalendar" && (
              <Button type="button" variant="accent" size="sm" onClick={() => setNewApptOpen(true)}>
                <Icon icon={Plus} size={15} />
                <span className="hidden sm:inline">{t("newAppointment")}</span>
                <span className="sm:hidden">{t("newAppointmentShort")}</span>
              </Button>
            )}
          </div>
          <nav className="flex gap-1.5 overflow-x-auto lg:hidden">
            {visibleNav.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => setPage(n.id)}
                className={cn(
                  "flex h-9 flex-none items-center gap-1.5 rounded-control px-3 text-sm font-medium",
                  page === n.id ? "bg-brand text-primary-foreground" : "border border-border-subtle bg-card text-text-secondary",
                )}
              >
                {n.label}
                {!!n.count && <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-2xs font-bold text-[var(--text-on-accent)]">{n.count}</span>}
              </button>
            ))}
          </nav>
        </div>

        <main className="flex flex-1 flex-col gap-5 p-4 lg:p-6">
          {page === "kalendar" && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => setDayOffset((d) => d - 1)} className="flex h-9 w-9 items-center justify-center rounded-control border border-border-subtle bg-card">
                  <Icon icon={ChevronLeft} size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => (dayOffset === 0 ? flash("Već gledaš današnji dan.") : setDayOffset(0))}
                  className="h-9 rounded-control border border-border-subtle bg-card px-3.5 text-sm font-medium text-text-primary"
                >
                  {dayOffset === 0 ? t("today") : formatDayLabel(days)}
                </button>
                <button type="button" onClick={() => setDayOffset((d) => d + 1)} className="flex h-9 w-9 items-center justify-center rounded-control border border-border-subtle bg-card">
                  <Icon icon={ChevronRight} size={16} />
                </button>
                <span className="text-sm text-text-secondary">{formatDayLabel(days)}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  { label: t("kpiApptsLabel"), value: String(filteredDayBookings.length) },
                  { label: t("kpiPendingLabel"), value: String(pendingForDay) },
                  { label: t("kpiFullLabel"), value: dayHours ? `${fullnessPct}%` : "—" },
                  { label: t("kpiNoShowLabel"), value: String(noShows30) },
                ].map((kpi) => (
                  <div key={kpi.label} className="flex flex-col gap-1 rounded-card bg-card p-4 shadow-card">
                    <span className="eyebrow">{kpi.label}</span>
                    <span className="text-2xl font-bold text-text-primary">{kpi.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setStaffFilter("all")}
                  className={cn("h-8 flex-none rounded-pill px-3.5 text-xs font-medium", staffFilter === "all" ? "bg-brand-subtle text-brand" : "border border-border-subtle bg-card text-text-secondary")}
                >
                  {t("staffFilterAll")}
                </button>
                {workers.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setStaffFilter(w.id)}
                    className={cn("h-8 flex-none rounded-pill px-3.5 text-xs font-medium", staffFilter === w.id ? "bg-brand-subtle text-brand" : "border border-border-subtle bg-card text-text-secondary")}
                  >
                    {w.name.split(" ")[0]}
                  </button>
                ))}
              </div>

              {filteredDayBookings.length === 0 ? (
                <div className="flex flex-col items-center gap-1.5 rounded-card bg-card p-10 text-center shadow-card">
                  <span className="text-base font-bold text-text-primary">{dayHours ? t("emptyDayNone") : t("emptyDayClosed")}</span>
                  <span className="text-sm text-text-secondary">{t("emptyDaySub")}</span>
                </div>
              ) : (
                <div className="flex flex-col gap-3">{filteredDayBookings.map(renderAppointmentCard)}</div>
              )}
            </>
          )}

          {page === "zahtjevi" && (
            <>
              {allPending.length === 0 ? (
                <div className="rounded-card bg-card p-10 text-center shadow-card text-sm text-text-secondary">{t("noPending")}</div>
              ) : (
                <div className="flex flex-col gap-3">{allPending.map(renderAppointmentCard)}</div>
              )}
            </>
          )}

          {page === "klijenti" && (
            <div className="flex flex-col gap-3">
              {clients.length === 0 && <div className="rounded-card bg-card p-10 text-center shadow-card text-sm text-text-secondary">{t("noClients")}</div>}
              {clients.map((c) => (
                <div key={c.name} className="flex flex-wrap items-center gap-3 rounded-card bg-card p-4 shadow-card">
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-brand-subtle text-sm font-bold text-brand">
                    {c.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-text-primary">{c.name}</span>
                      <Badge variant={c.noShowCount > 0 ? "warning" : "success"}>{c.noShowCount > 0 ? t("riskTag") : t("regularTag")}</Badge>
                    </div>
                    <span className="text-sm text-text-secondary">
                      {c.phone} · {c.visits} {pluralBs(c.visits, t("visitsOne"), t("visitsFew"), t("visitsMany"))}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="secondary" size="sm" asChild>
                      <Link href={`/dashboard/klijenti/${encodeURIComponent(c.name)}`}>
                        {tClient("viewHistory")}
                        <Icon icon={ChevronRight} size={13} />
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant={isOwner ? "destructive" : "secondary"}
                      size="sm"
                      onClick={() => flash(isOwner ? t("blockedToast") : t("proposedToast"))}
                    >
                      <Icon icon={Ban} size={13} />
                      {isOwner ? t("blockClient") : t("proposeBlock")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {page === "usluge" && (
            <div className="flex flex-col divide-y divide-border-subtle rounded-card bg-card shadow-card">
              {services.map((s) => (
                <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-text-primary">{s.name}</span>
                    <span className="text-sm text-text-secondary">
                      {t("durationLabel", { dur: s.durationMinutes })} · {t("bufferLabel", { buffer: s.bufferMinutes })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="price text-base">{formatPrice(s.price)}</span>
                    <Button type="button" variant="secondary" size="sm" onClick={() => flash(t("editServiceToast"))}>
                      {t("editService")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {page === "radnici" && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
              {workers.map((w) => {
                const on = canBlockOverrides[w.id] ?? w.canBlockClients;
                return (
                  <div key={w.id} className="flex flex-col gap-3 rounded-card bg-card p-4 shadow-card">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-400">
                        {w.name.split(" ").map((p) => p[0]).join("")}
                      </span>
                      <div className="flex min-w-0 flex-col">
                        <span className="font-bold text-text-primary">{w.name}</span>
                        <span className="text-sm text-text-secondary">{w.position}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => isOwner && setCanBlockOverrides((cur) => ({ ...cur, [w.id]: !on }))}
                      className={cn(
                        "self-start rounded-pill px-3 py-1.5 text-xs font-semibold",
                        on ? "bg-brand-subtle text-brand" : "border border-border-subtle bg-card text-text-secondary",
                        !isOwner && "opacity-70",
                      )}
                    >
                      {on ? t("canBlockOn") : t("canBlockOff")}
                    </button>
                  </div>
                );
              })}
              {isOwner && (
                <button
                  type="button"
                  onClick={() => flash(t("inviteToast"))}
                  className="flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-border-subtle p-4 text-sm font-medium text-brand"
                >
                  <Icon icon={UserPlus} size={20} />
                  {t("inviteWorker")}
                </button>
              )}
            </div>
          )}

          {page === "vrijeme" && (
            <div className="flex flex-col divide-y divide-border-subtle rounded-card bg-card shadow-card">
              <div className="p-4 text-sm text-text-secondary">{isOwner ? t("hoursNoteOwner") : t("hoursNoteWorker")}</div>
              {salon.openingHours.map((h, i) => {
                const baseOpen = h.time !== "Zatvoreno";
                const open = hoursClosed[i] === undefined ? baseOpen : !hoursClosed[i];
                return (
                  <div key={h.day} className="flex items-center justify-between gap-3 p-4">
                    <span className="font-medium text-text-primary">{h.day}</span>
                    <div className="flex items-center gap-3">
                      <span className={open ? "text-text-primary" : "text-text-muted"}>{open ? h.time : t("hoursClosed")}</span>
                      <button
                        type="button"
                        onClick={() => setHoursClosed((cur) => ({ ...cur, [i]: open }))}
                        className={cn("h-8 rounded-pill px-3 text-xs font-semibold", open ? "bg-brand-subtle text-brand" : "border border-border-subtle bg-card text-text-secondary")}
                      >
                        {open ? t("hoursOpen") : t("hoursClosed")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {page === "statistika" && (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  { label: t("statsTotalLabel"), value: String(allBookings.length) },
                  { label: t("statsCompletedLabel"), value: String(allBookings.filter((b) => b.status === "completed").length) },
                  { label: t("statsNoShowLabel"), value: String(allBookings.filter((b) => b.status === "no_show").length) },
                  {
                    label: t("statsRevenueLabel"),
                    value: formatPrice(allBookings.filter((b) => b.status === "completed").reduce((sum, b) => sum + Number(b.service.price), 0)),
                  },
                ].map((kpi) => (
                  <div key={kpi.label} className="flex flex-col gap-1 rounded-card bg-card p-4 shadow-card">
                    <span className="eyebrow">{kpi.label}</span>
                    <span className="text-2xl font-bold text-text-primary">{kpi.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3 rounded-card bg-card p-4 shadow-card">
                <span className="text-sm font-bold text-text-primary">{t("statsPerStaffTitle")}</span>
                {workers.map((w) => {
                  const confirmed = allBookings.filter((b) => b.worker.id === w.id && (b.status === "completed" || b.status === "confirmed")).length;
                  const unconfirmed = allBookings.filter((b) => b.worker.id === w.id && b.status === "pending").length;
                  return (
                    <div key={w.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-text-primary">{w.name}</span>
                      <span className="text-text-secondary">{t("confirmedCountLabel", { confirmed, unconfirmed })}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-text-muted">{t("statsHint")}</span>
                <Link href="/statistika" className="text-xs font-medium text-brand hover:underline">
                  {t("statsFullReportCta")}
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>

      {newApptOpen && (
        <NewAppointmentModal
          salon={salon}
          workers={workers}
          services={services}
          clients={clients}
          existingBookings={allBookings}
          onClose={() => setNewApptOpen(false)}
          onSave={handleNewBooking}
        />
      )}

      {actionModal && modalBooking && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[var(--overlay-scrim)] p-5 backdrop-blur-sm">
          <div className="flex w-full max-w-[420px] flex-col gap-4 rounded-modal bg-card p-6 shadow-modal">
            <span
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full",
                actionModal.type === "move" ? "bg-brand-subtle text-brand" : "bg-danger-bg text-danger-fg",
              )}
            >
              <Icon icon={actionModal.type === "move" ? Repeat : actionModal.type === "cancel" ? CircleX : UserX} size={22} />
            </span>
            <div className="flex flex-col gap-1.5">
              <span className="text-xl font-bold tracking-tight text-text-primary">
                {actionModal.type === "move" ? t("moveTitle") : actionModal.type === "cancel" ? t("cancelTitle") : t("noShowTitle")}
              </span>
              <span className="text-sm text-text-secondary">
                {modalBooking.clientName} · {timeOf(modalBooking.scheduledAt)}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-text-secondary">
              {actionModal.type === "move" ? t("moveNote") : actionModal.type === "cancel" ? t("cancelNote") : t("noShowNote")}
            </p>
            {actionModal.type === "move" && (
              <div className="flex flex-col gap-2">
                {moveSlots.length === 0 ? (
                  <span className="text-sm text-text-muted">{t("moveNoSlots")}</span>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {moveSlots.map((s, i) => (
                      <button
                        key={s.iso}
                        type="button"
                        onClick={() => setMoveChoice(i)}
                        className={cn(
                          "rounded-control px-3 py-2 text-sm font-medium",
                          moveChoice === i ? "bg-brand text-primary-foreground" : "border border-border-subtle bg-card text-text-primary",
                        )}
                      >
                        {formatWeekdayShort(s.date)} {s.date.getDate()}., {s.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-2.5">
              <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={() => setActionModal(null)}>
                {t("dismiss")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="lg"
                className="flex-1"
                disabled={actionModal.type === "move" && moveSlots.length === 0}
                onClick={() => {
                  if (actionModal.type === "move") moveBooking(modalBooking.id, moveSlots[moveChoice].iso);
                  else if (actionModal.type === "cancel") setStatus(modalBooking.id, "cancelled_by_salon", t("cancelledToast"));
                  else setStatus(modalBooking.id, "no_show", t("noShowToast"));
                }}
              >
                {actionModal.type === "move" ? t("moveCta") : actionModal.type === "cancel" ? t("cancelCta") : t("noShowCta")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-surface-inverse px-4.5 py-3 text-sm font-medium text-brand-on shadow-popover">
          <Icon icon={Check} size={16} className="text-accent" />
          {toast}
        </div>
      )}
    </div>
  );
}
