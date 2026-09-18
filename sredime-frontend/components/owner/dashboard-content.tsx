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
  Info,
  Mail,
  Pencil,
  Plus,
  Repeat,
  Store,
  Tag,
  TriangleAlert,
  UserPlus,
  UserX,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { Toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { firstName, formatPrice, formatDayLabel, formatWeekdayShort, getEffectivePrice, initialsFromName, pluralBs } from "@/lib/format";
import { BOOKING_STATUS_TONE } from "@/lib/booking-status";
import { SESSION_NAMES } from "@/lib/session";
import { hoursForDate } from "@/lib/api/availability";
import {
  pickBookingsForDate,
  pickPendingBookings,
  summarizeClients,
  type BookingDetails,
} from "@/lib/api/bookings";
import { NewAppointmentModal, type NewBookingInput } from "@/components/owner/new-appointment-modal";
import { InviteWorkerModal, type InvitePayload } from "@/components/owner/invite-worker-modal";
import { EditServiceModal } from "@/components/owner/edit-service-modal";
import type { Salon, Service, Worker, BookingStatus } from "@/types/entities";
import type { Page, Role } from "@/types/dashboard";
import type { VariantProps } from "class-variance-authority";

type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

type TeamStatus = "owner" | "active" | "invited" | "draft";
interface TeamMember {
  id: number;
  name: string;
  role: string;
  contact: string;
  status: TeamStatus;
  workerId?: number;
}

const OWNER_MEMBER: TeamMember = { id: -1, name: SESSION_NAMES.owner, role: "Vlasnica salona", contact: "selma@studiolux.ba", status: "owner" };

const TEAM_BADGE: Record<TeamStatus, { tone: BadgeTone; icon: typeof Store; labelKey: string }> = {
  owner: { tone: "info", icon: Store, labelKey: "badgeOwner" },
  active: { tone: "success", icon: CircleCheck, labelKey: "badgeActive" },
  invited: { tone: "warning", icon: Mail, labelKey: "badgeInvited" },
  draft: { tone: "neutral", icon: Info, labelKey: "badgeDraft" },
};

function contactFor(name: string, salon: Salon) {
  const first = firstName(name).toLowerCase();
  const domain = salon.name.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return `${first}@${domain}.ba`;
}

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
  initialRole = "owner",
}: {
  salon: Salon;
  workers: Worker[];
  services: Service[];
  bookings: BookingDetails[];
  initialPage?: Page;
  initialRole?: Role;
}) {
  const t = useTranslations("dashboard");
  const tStatus = useTranslations("bookingStatus");
  const tClient = useTranslations("clientHistory");
  const tInvite = useTranslations("workerInvite");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [role, setRole] = useState<Role>(initialRole);
  const [page, setPage] = useState<Page>(initialPage);
  const [dayOffset, setDayOffset] = useState(0);
  const [staffFilter, setStaffFilter] = useState<number | "all">("all");
  const [overrides, setOverrides] = useState<Record<number, Partial<BookingDetails>>>({});
  const [extra, setExtra] = useState<BookingDetails[]>([]);
  const [canBlockOverrides, setCanBlockOverrides] = useState<Record<number, boolean>>({});
  const [hoursClosed, setHoursClosed] = useState<Record<number, boolean>>({});
  const [serviceOverrides, setServiceOverrides] = useState<Record<number, Partial<Service>>>({});
  const [editServiceModal, setEditServiceModal] = useState<Service | null>(null);
  const [actionModal, setActionModal] = useState<{ type: "move" | "cancel" | "noshow"; bookingId: number } | null>(null);
  const [newApptOpen, setNewApptOpen] = useState(false);
  const [team, setTeam] = useState<TeamMember[]>(() => [
    OWNER_MEMBER,
    ...workers.map((w) => ({ id: w.id, name: w.name, role: w.position, contact: contactFor(w.name, salon), status: "active" as const, workerId: w.id })),
  ]);
  const [inviteModal, setInviteModal] = useState<{ mode: "new" } | { mode: "resend"; member: TeamMember } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [now] = useState(() => new Date());

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast((cur) => (cur === msg ? null : cur)), 2600);
  }

  function selectRole(r: Role) {
    setRole(r);
    const params = new URLSearchParams(searchParams.toString());
    params.set("role", r);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const isOwner = role === "owner";

  const allBookings = useMemo(() => {
    const merged = bookings.map((b) => (overrides[b.id] ? { ...b, ...overrides[b.id] } : b));
    return [...merged, ...extra].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }, [bookings, overrides, extra]);

  const clients = useMemo(() => summarizeClients(allBookings), [allBookings]);

  const displayedServices = useMemo(
    () => services.map((s) => (serviceOverrides[s.id] ? { ...s, ...serviceOverrides[s.id] } : s)),
    [services, serviceOverrides],
  );

  function handleServiceSave(id: number, changes: Partial<Service>) {
    setServiceOverrides((cur) => ({ ...cur, [id]: { ...cur[id], ...changes } }));
    setEditServiceModal(null);
    flash(t("serviceUpdatedToast", { name: changes.name ?? "" }));
  }

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
            <Badge variant={BOOKING_STATUS_TONE[b.status]}>
              <Icon icon={StatusIcon} size={11} />
              {tStatus(b.status)}
            </Badge>
            {b.manuallyEntered && <Badge variant="info">{t("manualBadge")}</Badge>}
          </div>
          <span className="text-sm text-text-secondary">
            {b.service.name} · {b.worker.name} · {formatPrice(getEffectivePrice(b.service.price, b.service.discountPercent))}
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
  // Reset on every actionModal transition (open, close, switch to a different booking) — adjusted
  // during render (React's recommended pattern for "state that depends on a changing value",
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes)
  // rather than a useEffect, and tied to the modal's own identity rather than to each call site
  // remembering to reset it, so a future exit path can't reintroduce the stale-index crash this
  // once caused.
  const [prevActionModal, setPrevActionModal] = useState(actionModal);
  if (prevActionModal !== actionModal) {
    setPrevActionModal(actionModal);
    setMoveChoice(0);
  }

  function handleNewBooking(input: NewBookingInput) {
    const iso = new Date(input.date);
    const [h, m] = input.time.split(":").map(Number);
    iso.setHours(h, m, 0, 0);
    const isoStr = `${iso.getFullYear()}-${String(iso.getMonth() + 1).padStart(2, "0")}-${String(iso.getDate()).padStart(2, "0")}T${input.time}:00`;
    const service = displayedServices.find((s) => s.id === input.serviceId)!;
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
      service: { id: service.id, name: service.name, durationMinutes: service.durationMinutes, bufferMinutes: service.bufferMinutes, price: service.price, discountPercent: service.discountPercent },
      worker: { id: worker.id, name: worker.name },
    };
    setExtra((cur) => [...cur, booking]);
    setNewApptOpen(false);
    flash(t("addedToast", { who: input.clientName, when: `${input.date.getDate()}.${input.date.getMonth() + 1}., ${input.time}` }));
  }

  function handleInviteSent(payload: InvitePayload) {
    if (inviteModal?.mode === "resend") {
      const targetId = inviteModal.member.id;
      setTeam((cur) => cur.map((m) => (m.id === targetId ? { ...m, contact: payload.contact || m.contact, status: "invited" } : m)));
      flash(tInvite("resentToast", { contact: payload.contact || inviteModal.member.contact }));
    } else {
      setTeam((cur) => [...cur, { id: nextLocalId++, name: payload.name, role: payload.role, contact: payload.contact, status: "invited" }]);
      flash(tInvite("sentToast", { contact: payload.contact }));
    }
  }

  const pendingInvites = team.filter((m) => m.status === "invited").length;

  return (
    <div className="flex min-h-screen bg-surface-canvas">
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
            <span className="text-sm font-semibold">{isOwner ? SESSION_NAMES.owner : SESSION_NAMES.worker}</span>
            <span className="text-xs text-indigo-200">{isOwner ? t("viewingAsOwner") : t("viewingAsWorker")}</span>
          </div>
          <div className="flex gap-1.5">
            {(["owner", "worker"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  selectRole(r);
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
                    {initialsFromName(c.name)}
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
                      <Link href={`/dashboard/klijenti/${encodeURIComponent(c.name)}?role=${role}`}>
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
              {displayedServices.map((s) => (
                <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-text-primary">{s.name}</span>
                      {s.discountPercent != null && (
                        <Badge variant="warning">{t("discountBadge", { percent: s.discountPercent })}</Badge>
                      )}
                    </div>
                    <span className="text-sm text-text-secondary">
                      {t("durationLabel", { dur: s.durationMinutes })} · {t("bufferLabel", { buffer: s.bufferMinutes })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      {s.discountPercent != null && (
                        <span className="text-xs text-text-muted line-through">{formatPrice(s.price)}</span>
                      )}
                      <span className="price text-base">{formatPrice(getEffectivePrice(s.price, s.discountPercent))}</span>
                    </div>
                    {isOwner && (
                      <Button type="button" variant="secondary" size="sm" onClick={() => setEditServiceModal(s)}>
                        <Icon icon={Pencil} size={13} />
                        {t("editService")}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {page === "radnici" && (
            <div className="flex flex-col gap-5">
              <div className="flex items-start gap-2.5 rounded-control bg-brand-subtle px-4 py-3.5">
                <Icon icon={Info} size={16} className="mt-0.5 flex-none text-brand" />
                <span className="text-sm leading-relaxed text-text-secondary">{tInvite("infoBanner")}</span>
              </div>

              <div className="overflow-hidden rounded-card bg-card shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 shadow-inset-line">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-base font-bold text-text-primary">{tInvite("teamTitle")}</span>
                    <span className="text-sm text-text-muted">
                      {tInvite("teamMeta", {
                        count: team.length,
                        word: pluralBs(team.length, tInvite("peopleOne"), tInvite("peopleFew"), tInvite("peopleMany")),
                        pending: pendingInvites,
                      })}
                    </span>
                  </div>
                  {isOwner && (
                    <Button type="button" size="sm" onClick={() => setInviteModal({ mode: "new" })}>
                      <Icon icon={UserPlus} size={15} />
                      {t("inviteWorker")}
                    </Button>
                  )}
                </div>
                <div className="flex flex-col divide-y divide-border-subtle">
                  {team.map((m) => {
                    const badge = TEAM_BADGE[m.status];
                    const canBlockOn = m.workerId != null ? (canBlockOverrides[m.workerId] ?? workers.find((w) => w.id === m.workerId)?.canBlockClients) : undefined;
                    return (
                      <div
                        key={m.id}
                        className="grid grid-cols-[44px_minmax(0,1fr)] items-center gap-x-3.5 gap-y-2.5 p-4 sm:grid-cols-[44px_minmax(0,1fr)_auto_auto] sm:gap-3.5"
                      >
                        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-brand-subtle text-sm font-bold text-brand">
                          {initialsFromName(m.name)}
                        </span>
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="font-bold text-text-primary">{m.name}</span>
                          <span className="truncate text-sm text-text-secondary">
                            {m.role} · {m.contact}
                          </span>
                        </span>
                        <Badge variant={badge.tone} className="w-fit">
                          <Icon icon={badge.icon} size={11} />
                          {tInvite(badge.labelKey)}
                        </Badge>
                        <span className="col-span-2 flex flex-wrap gap-2 sm:col-span-1 sm:justify-end">
                          {m.workerId != null && isOwner && (
                            <button
                              type="button"
                              onClick={() => setCanBlockOverrides((cur) => ({ ...cur, [m.workerId!]: !canBlockOn }))}
                              className={cn(
                                "h-9 rounded-control px-3 text-xs font-semibold",
                                canBlockOn ? "bg-brand-subtle text-brand" : "border border-border-subtle bg-card text-text-secondary",
                              )}
                            >
                              {canBlockOn ? t("canBlockOn") : t("canBlockOff")}
                            </button>
                          )}
                          {(m.status === "invited" || m.status === "draft") && isOwner && (
                            <Button type="button" variant="secondary" size="sm" onClick={() => setInviteModal({ mode: "resend", member: m })}>
                              <Icon icon={m.status === "invited" ? Repeat : UserPlus} size={14} />
                              {m.status === "invited" ? tInvite("resendCta") : tInvite("sendCta")}
                            </Button>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
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
                    value: formatPrice(
                      allBookings
                        .filter((b) => b.status === "completed")
                        .reduce((sum, b) => sum + getEffectivePrice(b.service.price, b.service.discountPercent), 0),
                    ),
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

      {inviteModal && (
        <InviteWorkerModal
          mode={inviteModal.mode}
          initialName={inviteModal.mode === "resend" ? inviteModal.member.name : undefined}
          initialContact={inviteModal.mode === "resend" ? inviteModal.member.contact : undefined}
          initialRole={inviteModal.mode === "resend" ? inviteModal.member.role : undefined}
          onClose={() => setInviteModal(null)}
          onSent={handleInviteSent}
        />
      )}

      {newApptOpen && (
        <NewAppointmentModal
          salon={salon}
          workers={workers}
          services={displayedServices}
          clients={clients}
          existingBookings={allBookings}
          onClose={() => setNewApptOpen(false)}
          onSave={handleNewBooking}
        />
      )}

      {editServiceModal && (
        <EditServiceModal service={editServiceModal} onClose={() => setEditServiceModal(null)} onSave={handleServiceSave} />
      )}

      {actionModal && modalBooking && (
        <ModalOverlay className="p-5">
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
                disabled={actionModal.type === "move" && (moveSlots.length === 0 || moveChoice >= moveSlots.length)}
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
        </ModalOverlay>
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
}
