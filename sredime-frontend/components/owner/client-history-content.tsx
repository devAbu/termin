"use client";

import { useMemo, useState } from "react";
import {
  Ban,
  Banknote,
  BarChart3,
  CalendarDays,
  ChevronLeft,
  CircleCheck,
  Clock,
  Inbox,
  Lock,
  Phone,
  Plus,
  Send,
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
import { Select } from "@/components/ui/select";
import { Icon } from "@/components/ui/icon";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { Toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { formatDateShort, formatPrice, formatTimeOfDay, initialsFromName } from "@/lib/format";
import { BOOKING_STATUS_TONE } from "@/lib/booking-status";
import { hasText } from "@/lib/validation";
import { SESSION_NAMES } from "@/lib/session";
import { summarizeClients, type BookingDetails } from "@/lib/api/bookings";
import {
  NO_SHOW_THRESHOLD,
  filterHistory,
  sortNewestFirst,
  summarizeClientHistory,
  type HistoryFilter,
} from "@/lib/api/client-history";
import { bookingAmount, completedRevenue } from "@/lib/api/booking-metrics";
import { BOOKING_STATUS_ICON } from "@/components/owner/booking-status-icon";
import { NewAppointmentModal, type NewBookingInput } from "@/components/owner/new-appointment-modal";
import type { ClientNote, Salon, Service, Worker } from "@/types/entities";
import type { Role } from "@/types/dashboard";
import type { VariantProps } from "class-variance-authority";

type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

let nextLocalId = 200000;
let nextLocalNoteId = 900000;

export function ClientHistoryContent({
  salon,
  workers,
  services,
  clientName,
  clientPhone,
  bookings,
  allSalonBookings,
  initialNotes,
  pendingCount,
  initialRole = "owner",
}: {
  salon: Salon;
  workers: Worker[];
  services: Service[];
  clientName: string;
  clientPhone: string;
  bookings: BookingDetails[];
  allSalonBookings: BookingDetails[];
  initialNotes: ClientNote[];
  pendingCount: number;
  initialRole?: Role;
}) {
  const t = useTranslations("dashboard");
  const tc = useTranslations("clientHistory");
  const tStatus = useTranslations("bookingStatus");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [role, setRole] = useState<Role>(initialRole);
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [notes, setNotes] = useState<ClientNote[]>(initialNotes);
  const [draft, setDraft] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [proposed, setProposed] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [extra, setExtra] = useState<BookingDetails[]>([]);
  const [newApptOpen, setNewApptOpen] = useState(false);
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

  const allBookings = useMemo(() => sortNewestFirst([...bookings, ...extra]), [bookings, extra]);
  const summary = useMemo(() => summarizeClientHistory(allBookings, now), [allBookings, now]);
  const { completedCount, totalRevenue, lastCompletedAt, firstBookingAt, noShowsInWindow, thresholdReached } = summary;

  const filteredList = filterHistory(allBookings, filter);
  const listRevenue = completedRevenue(filteredList);

  const canBlock = isOwner;

  const statusBadge = blocked
    ? { label: tc("statusBlocked"), icon: Ban, tone: "danger" as BadgeTone }
    : thresholdReached
      ? { label: tc("statusThreshold"), icon: TriangleAlert, tone: "warning" as BadgeTone }
      : { label: tc("statusActive"), icon: CircleCheck, tone: "success" as BadgeTone };

  const showAlert = !blocked && !proposed && !alertDismissed && thresholdReached;

  const NAV: { id: string; label: string; icon: typeof Users; href: string; ownerOnly?: boolean; count?: number; active?: boolean }[] = [
    { id: "kalendar", label: t("navCalendar"), icon: CalendarDays, href: `/dashboard?role=${role}` },
    { id: "zahtjevi", label: t("navRequests"), icon: Inbox, href: `/dashboard?tab=zahtjevi&role=${role}`, count: pendingCount },
    { id: "klijenti", label: t("navClients"), icon: Users, href: `/dashboard?tab=klijenti&role=${role}`, active: true },
    { id: "usluge", label: t("navServices"), icon: Tag, href: `/dashboard?tab=usluge&role=${role}`, ownerOnly: true },
    { id: "radnici", label: t("navStaff"), icon: UserPlus, href: `/dashboard?tab=radnici&role=${role}`, ownerOnly: true },
    { id: "vrijeme", label: t("navHours"), icon: Clock, href: `/dashboard?tab=vrijeme&role=${role}` },
    { id: "statistika", label: t("navStats"), icon: BarChart3, href: "/statistika", ownerOnly: true },
  ];
  const visibleNav = NAV.filter((n) => isOwner || !n.ownerOnly);

  function addNote() {
    if (!hasText(draft)) return;
    const note: ClientNote = {
      id: nextLocalNoteId++,
      salonId: salon.id,
      clientName,
      authorName: isOwner ? SESSION_NAMES.owner : SESSION_NAMES.worker,
      text: draft.trim(),
      createdAt: new Date().toISOString(),
    };
    setNotes((cur) => [note, ...cur]);
    setDraft("");
  }

  function removeNote(id: number) {
    setNotes((cur) => cur.filter((n) => n.id !== id));
  }

  function confirmBlockOrPropose() {
    setDialogOpen(false);
    setAlertDismissed(true);
    setReason("");
    if (canBlock) {
      setBlocked(true);
      flash(t("blockedToast"));
    } else {
      setProposed(true);
      flash(t("proposedToast"));
    }
  }

  function unblock() {
    setBlocked(false);
    flash(tc("unblockedToast"));
  }

  const clientSummary = summarizeClients(allBookings);

  function handleNewBooking(input: NewBookingInput) {
    const iso = new Date(input.date);
    const service = services.find((s) => s.id === input.serviceId)!;
    const worker = workers.find((w) => w.id === input.workerId)!;
    const isoStr = `${iso.getFullYear()}-${String(iso.getMonth() + 1).padStart(2, "0")}-${String(iso.getDate()).padStart(2, "0")}T${input.time}:00`;
    const booking: BookingDetails = {
      id: nextLocalId++,
      clientId: null,
      clientName,
      clientPhone,
      status: "confirmed",
      scheduledAt: isoStr,
      manuallyEntered: true,
      salon: { id: salon.id, name: salon.name, slug: salon.slug, address: salon.address },
      service: { id: service.id, name: service.name, durationMinutes: service.durationMinutes, bufferMinutes: service.bufferMinutes, price: service.price, discountPercent: service.discountPercent },
      worker: { id: worker.id, name: worker.name },
    };
    setExtra((cur) => [...cur, booking]);
    setNewApptOpen(false);
    flash(t("addedToast", { who: clientName, when: `${input.date.getDate()}.${input.date.getMonth() + 1}., ${input.time}` }));
  }

  const dialogCopy = canBlock
    ? {
        title: tc("blockDialogTitleOwner"),
        body: tc("blockDialogBodyOwner", { client: clientName, salon: salon.name }),
        cta: tc("blockDialogCtaOwner"),
        iconBg: "bg-danger-bg",
        iconFg: "text-danger-fg",
        ctaVariant: "destructive" as const,
      }
    : {
        title: tc("blockDialogTitleWorker"),
        body: tc("blockDialogBodyWorker"),
        cta: tc("blockDialogCtaWorker"),
        iconBg: "bg-warning-bg",
        iconFg: "text-warning-fg",
        ctaVariant: "primary" as const,
      };

  return (
    <div className="flex min-h-full bg-surface-canvas">
      <aside className="hidden w-60 flex-none flex-col gap-5 bg-surface-inverse p-4 text-brand-on lg:flex">
        <div className="flex flex-col gap-0.5 px-2 py-1">
          <span className="text-base font-bold tracking-tight">{salon.name}</span>
          <span className="text-xs text-indigo-200">{salon.city}</span>
        </div>
        <nav className="flex flex-col gap-1">
          {visibleNav.map((n) => (
            <Link
              key={n.id}
              href={n.href}
              className={cn(
                "flex h-10 items-center gap-2.5 rounded-control px-2.5 text-sm font-medium",
                n.active ? "bg-indigo-500 text-brand-on" : "text-indigo-200 hover:bg-indigo-500/60",
              )}
            >
              <Icon icon={n.icon} size={17} />
              <span className="flex-1 text-left">{n.label}</span>
              {!!n.count && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-2xs font-bold text-[var(--text-on-accent)]">
                  {n.count}
                </span>
              )}
            </Link>
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
                onClick={() => selectRole(r)}
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
          <div className="flex flex-wrap items-center gap-3">
            <Link href={`/dashboard?tab=klijenti&role=${role}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary">
              <Icon icon={ChevronLeft} size={16} />
              {tc("backToClients")}
            </Link>
            <span className="truncate text-lg font-bold text-text-primary lg:text-xl">{clientName}</span>
            <div className="flex-1" />
            <span className="hidden items-center gap-1.5 text-xs text-text-muted lg:inline-flex">
              <Icon icon={Lock} size={13} />
              {tc("onlyThisSalon", { salon: salon.name })}
            </span>
          </div>
          <nav className="flex gap-1.5 overflow-x-auto lg:hidden">
            {visibleNav.map((n) => (
              <Link
                key={n.id}
                href={n.href}
                className={cn(
                  "flex h-9 flex-none items-center gap-1.5 rounded-control px-3 text-sm font-medium",
                  n.active ? "bg-brand text-primary-foreground" : "border border-border-subtle bg-card text-text-secondary",
                )}
              >
                {n.label}
                {!!n.count && <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-2xs font-bold text-[var(--text-on-accent)]">{n.count}</span>}
              </Link>
            ))}
          </nav>
        </div>

        <main className="flex flex-1 flex-col gap-5 p-4 lg:p-6">
          <div className="flex flex-wrap items-center gap-4 rounded-card bg-card p-4 shadow-card lg:p-6">
            <span className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-brand-subtle text-xl font-bold text-brand lg:h-16 lg:w-16">
              {initialsFromName(clientName)}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xl font-bold tracking-tight text-text-primary lg:text-2xl">{clientName}</span>
                <Badge variant={statusBadge.tone}>
                  <Icon icon={statusBadge.icon} size={12} />
                  {statusBadge.label}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-x-4.5 gap-y-1.5">
                <span className="inline-flex items-center gap-1.5 text-sm text-text-secondary">
                  <Icon icon={Phone} size={14} className="text-icon-muted" />
                  {clientPhone}
                </span>
                {firstBookingAt && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-text-secondary">
                    <Icon icon={CalendarDays} size={14} className="text-icon-muted" />
                    {tc("firstBookingLabel", { date: formatDateShort(firstBookingAt) })}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" size="md" onClick={() => setNewApptOpen(true)}>
                <Icon icon={Plus} size={16} />
                {t("newAppointment")}
              </Button>
              {blocked ? (
                <Button type="button" variant="secondary" size="md" onClick={unblock}>
                  <Icon icon={CircleCheck} size={16} />
                  {tc("unblockCta")}
                </Button>
              ) : (
                <Button type="button" variant={canBlock ? "destructive" : "secondary"} size="md" onClick={() => setDialogOpen(true)}>
                  <Icon icon={canBlock ? Ban : Send} size={16} />
                  {canBlock ? t("blockClient") : t("proposeBlock")}
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: tc("statTotalLabel"), value: String(allBookings.length), icon: CalendarDays, tone: "brand", hint: tc("statTotalHint", { salon: salon.name, date: firstBookingAt ? formatDateShort(firstBookingAt) : "—" }) },
              { label: tc("statCompletedLabel"), value: String(completedCount), icon: CircleCheck, tone: "success", hint: lastCompletedAt ? tc("statCompletedHint", { date: formatDateShort(lastCompletedAt) }) : tc("statCompletedHintNone") },
              { label: tc("statNoShowLabel"), value: `${noShowsInWindow} / ${NO_SHOW_THRESHOLD}`, icon: UserX, tone: "danger", hint: tc("statNoShowHint", { threshold: NO_SHOW_THRESHOLD }) },
              { label: tc("statRevenueLabel"), value: formatPrice(totalRevenue), icon: Banknote, tone: "brand", hint: tc("statRevenueHint") },
            ].map((s) => (
              <div key={s.label} className="flex flex-col gap-2 rounded-card bg-card p-4 shadow-card">
                <span className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "flex h-8 w-8 flex-none items-center justify-center rounded-full",
                      s.tone === "success" && "bg-success-bg text-success-fg",
                      s.tone === "danger" && "bg-danger-bg text-danger-fg",
                      s.tone === "brand" && "bg-brand-subtle text-brand",
                    )}
                  >
                    <Icon icon={s.icon} size={15} />
                  </span>
                  <span className="eyebrow">{s.label}</span>
                </span>
                <span className={cn("text-2xl font-bold tracking-tight", s.tone === "danger" && noShowsInWindow > 0 ? "text-danger-fg" : "text-text-primary")}>{s.value}</span>
                <span className="text-xs leading-relaxed text-text-muted">{s.hint}</span>
              </div>
            ))}
          </div>

          {showAlert && (
            <div className="flex flex-wrap items-center gap-3.5 rounded-card bg-card p-4 shadow-card lg:p-6">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-warning-bg text-warning-fg">
                <Icon icon={TriangleAlert} size={20} />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-base font-bold text-text-primary">{tc("noShowAlertTitle", { threshold: NO_SHOW_THRESHOLD })}</span>
                <span className="text-sm leading-relaxed text-text-secondary">{canBlock ? tc("noShowAlertBodyOwner") : tc("noShowAlertBodyWorker")}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setAlertDismissed(true)}>
                  {tc("alertDismiss")}
                </Button>
                <Button type="button" variant={canBlock ? "destructive" : "primary"} size="sm" onClick={() => setDialogOpen(true)}>
                  {canBlock ? t("blockClient") : t("proposeBlock")}
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="min-w-0 overflow-hidden rounded-card bg-card shadow-card">
              <div className="flex flex-wrap items-center gap-2.5 border-b border-border-subtle p-4 lg:p-6">
                <span className="text-lg font-bold tracking-tight text-text-primary">{tc("historyTitle")}</span>
                <span className="text-sm text-text-muted">{tc("historySubtitle", { salon: salon.name })}</span>
                <div className="flex-1" />
                <Select value={filter} onChange={(e) => setFilter(e.target.value as HistoryFilter)} className="w-[190px]">
                  <option value="all">{tc("filterAllStatuses")}</option>
                  <option value="completed">{tc("filterCompleted")}</option>
                  <option value="cancelled">{tc("filterCancelled")}</option>
                  <option value="no_show">{tc("filterNoShow")}</option>
                </Select>
              </div>

              {filteredList.length === 0 ? (
                <div className="p-8 text-center text-sm text-text-secondary">{tc("emptyHistory")}</div>
              ) : (
                filteredList.map((b) => {
                  const StatusIcon = BOOKING_STATUS_ICON[b.status];
                  return (
                    <div
                      key={b.id}
                      className="grid grid-cols-1 gap-2 border-b border-border-subtle p-4 last:border-b-0 sm:grid-cols-[90px_minmax(0,1fr)_auto] sm:items-center sm:gap-3 lg:grid-cols-[110px_minmax(0,1fr)_auto_80px] lg:p-4 lg:px-6"
                    >
                      <span className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-text-primary">{formatDateShort(b.scheduledAt)}</span>
                        <span className="text-xs text-text-muted">{formatTimeOfDay(b.scheduledAt)}</span>
                      </span>
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="font-medium text-text-primary">{b.service.name}</span>
                        <span className="text-sm text-text-secondary">{b.worker.name}</span>
                      </span>
                      <Badge variant={BOOKING_STATUS_TONE[b.status]} className="justify-self-start">
                        <Icon icon={StatusIcon} size={11} />
                        {tStatus(b.status)}
                      </Badge>
                      <span className={cn("text-sm font-semibold sm:text-right", b.status === "completed" ? "text-text-primary" : "text-text-muted")}>
                        {b.status === "completed" ? formatPrice(bookingAmount(b)) : "—"}
                      </span>
                    </div>
                  );
                })
              )}

              <div className="flex flex-wrap justify-between gap-3 bg-surface-sunken p-4 lg:px-6">
                <span className="text-sm text-text-secondary">{tc("listMeta", { shown: filteredList.length, total: allBookings.length })}</span>
                <span className="text-sm font-semibold text-text-primary">{tc("listTotal", { amount: formatPrice(listRevenue) })}</span>
              </div>
            </div>

            <div className="flex min-w-0 flex-col gap-5">
              <div className="flex flex-col gap-3.5 rounded-card bg-card p-4 shadow-card lg:p-6">
                <div className="flex flex-col gap-1.5">
                  <span className="flex items-center gap-2">
                    <Icon icon={Lock} size={16} className="text-icon-default" />
                    <span className="text-lg font-bold tracking-tight text-text-primary">{tc("notesTitle")}</span>
                  </span>
                  <span className="text-sm leading-relaxed text-text-secondary">{tc("notesSubtitle", { salon: salon.name })}</span>
                </div>

                {notes.length === 0 ? (
                  <span className="rounded-control bg-surface-sunken p-3.5 text-sm leading-relaxed text-text-muted">{tc("notesEmpty")}</span>
                ) : (
                  notes.map((n) => (
                    <div key={n.id} className="flex flex-col gap-2 rounded-control bg-surface-sunken p-3.5">
                      <span className="text-sm leading-relaxed text-text-primary">{n.text}</span>
                      <span className="flex flex-wrap items-center gap-2.5">
                        <span className="text-xs text-text-muted">{tc("notesMeta", { author: n.authorName, date: formatDateShort(n.createdAt) })}</span>
                        <div className="flex-1" />
                        <button type="button" onClick={() => removeNote(n.id)} className="text-xs font-medium text-danger-fg">
                          {tc("notesRemove")}
                        </button>
                      </span>
                    </div>
                  ))
                )}

                <label className="flex flex-col gap-2">
                  <span className="eyebrow">{tc("notesAddLabel")}</span>
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={3}
                    placeholder={tc("notesPlaceholder")}
                    className="w-full resize-y rounded-control border border-border-subtle bg-card p-3 text-base leading-relaxed text-text-primary placeholder:text-text-muted focus-visible:border-border-brand focus-visible:shadow-focus focus-visible:outline-none"
                  />
                </label>
                <Button type="button" variant="primary" size="md" className="self-start" disabled={!hasText(draft)} onClick={addNote}>
                  <Icon icon={Plus} size={16} />
                  {tc("notesSave")}
                </Button>
              </div>

              {blocked && (
                <div className="flex flex-col gap-3 rounded-card bg-card p-4 shadow-card lg:p-6">
                  <span className="flex items-center gap-2">
                    <Icon icon={Ban} size={16} className="text-danger-fg" />
                    <span className="text-base font-bold text-danger-fg">{tc("blockedPanelTitle")}</span>
                  </span>
                  <span className="text-sm leading-relaxed text-text-secondary">
                    {tc("blockedPanelBody", { salon: salon.name, author: isOwner ? SESSION_NAMES.owner : SESSION_NAMES.worker, date: formatDateShort(now.toISOString()) })}
                  </span>
                  <Button type="button" variant="secondary" size="md" className="self-start" onClick={unblock}>
                    {tc("unblockCta")}
                  </Button>
                </div>
              )}

              {proposed && !blocked && (
                <div className="flex flex-col gap-3 rounded-card bg-card p-4 shadow-card lg:p-6">
                  <span className="flex items-center gap-2">
                    <Icon icon={Send} size={16} className="text-warning-fg" />
                    <span className="text-base font-bold text-warning-fg">{tc("proposalPanelTitle")}</span>
                  </span>
                  <span className="text-sm leading-relaxed text-text-secondary">{tc("proposalPanelBody", { owner: SESSION_NAMES.owner })}</span>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {newApptOpen && (
        <NewAppointmentModal
          salon={salon}
          workers={workers}
          services={services}
          clients={clientSummary}
          existingBookings={[...allSalonBookings, ...extra]}
          onClose={() => setNewApptOpen(false)}
          onSave={handleNewBooking}
        />
      )}

      {dialogOpen && (
        <ModalOverlay className="p-5">
          <div className="flex w-full max-w-[420px] flex-col gap-4 rounded-modal bg-card p-6 shadow-modal">
            <span className={cn("flex h-11 w-11 items-center justify-center rounded-full", dialogCopy.iconBg, dialogCopy.iconFg)}>
              <Icon icon={canBlock ? Ban : Send} size={22} />
            </span>
            <div className="flex flex-col gap-1.5">
              <span className="text-xl font-bold tracking-tight text-text-primary">{dialogCopy.title}</span>
              <span className="text-sm leading-relaxed text-text-secondary">{dialogCopy.body}</span>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-text-primary">{tc("reasonLabel")}</span>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={tc("reasonPlaceholder")}
                className="h-11 rounded-control border border-border-subtle bg-card px-3 text-base text-text-primary placeholder:text-text-muted focus-visible:border-border-brand focus-visible:shadow-focus focus-visible:outline-none"
              />
            </label>
            <div className="flex gap-2.5">
              <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={() => setDialogOpen(false)}>
                {t("dismiss")}
              </Button>
              <Button type="button" variant={dialogCopy.ctaVariant} size="lg" className="flex-1" onClick={confirmBlockOrPropose}>
                {dialogCopy.cta}
              </Button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
}
