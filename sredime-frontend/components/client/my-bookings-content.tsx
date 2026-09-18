"use client";

import { useMemo, useRef, useState } from "react";
import {
  Calendar,
  CalendarX,
  Check,
  Clock,
  MapPin,
  Repeat,
  Star,
  Store,
  TriangleAlert,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Navbar } from "@/components/chrome/navbar";
import { Footer } from "@/components/chrome/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Icon } from "@/components/ui/icon";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { Toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { formatPrice, formatWeekdayShort, formatMonthShort } from "@/lib/format";
import { bookingAmount } from "@/lib/api/booking-metrics";
import { BOOKING_STATUS_TONE } from "@/lib/booking-status";
import type { BookingDetails } from "@/lib/api/bookings";
import type { BookingStatus } from "@/types/entities";

type Tab = "upcoming" | "history";

function upcomingWord(n: number, t: (key: string) => string) {
  if (n === 1) return t("upcomingOne");
  if (n >= 2 && n <= 4) return t("upcomingFew");
  return t("upcomingMany");
}

function timeRange(iso: string, durationMinutes: number): string {
  const start = new Date(iso);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const fmt = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${fmt(start)} – ${fmt(end)}`;
}

export function MyBookingsContent({
  upcoming,
  history,
  reviewedBookingIds,
}: {
  upcoming: BookingDetails[];
  history: BookingDetails[];
  reviewedBookingIds: number[];
}) {
  const t = useTranslations("myBookings");
  const tStatus = useTranslations("bookingStatus");

  const [tab, setTab] = useState<Tab>("upcoming");
  const [cancelledIds, setCancelledIds] = useState<number[]>([]);
  const [cancelTargetId, setCancelTargetId] = useState<number | null>(null);
  const [salonFilter, setSalonFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "">("");
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const liveUpcoming = upcoming.filter((b) => !cancelledIds.includes(b.id));
  const cancelTarget = upcoming.find((b) => b.id === cancelTargetId) ?? null;

  const salonOptions = useMemo(() => Array.from(new Set(history.map((h) => h.salon.name))), [history]);
  const statusOptions = useMemo(() => Array.from(new Set(history.map((h) => h.status))), [history]);
  const filteredHistory = history.filter(
    (h) => (!salonFilter || h.salon.name === salonFilter) && (!statusFilter || h.status === statusFilter),
  );

  function flash(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }

  function confirmCancel() {
    if (!cancelTarget) return;
    setCancelledIds((ids) => [...ids, cancelTarget.id]);
    setCancelTargetId(null);
    flash(t("cancelToast"));
  }

  const meta =
    liveUpcoming.length > 0
      ? t("metaCount", {
          count: liveUpcoming.length,
          word: upcomingWord(liveUpcoming.length, t),
          date: `${new Date(liveUpcoming[liveUpcoming.length - 1].scheduledAt).getDate()}. ${formatMonthShort(new Date(liveUpcoming[liveUpcoming.length - 1].scheduledAt))}`,
        })
      : t("metaEmpty");

  return (
    <div className="relative flex min-h-full flex-col bg-surface-canvas">
      <Navbar />

      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-6 py-8 md:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">{t("title")}</h1>
            <span className="text-sm text-text-secondary">{meta}</span>
          </div>
          <Button asChild variant="accent" size="md">
            <Link href="/pretraga">{t("newBooking")}</Link>
          </Button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto rounded-control bg-surface-sunken p-1">
          {(["upcoming", "history"] as Tab[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "flex h-10 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-[10px] px-3 text-sm transition-colors",
                tab === id ? "bg-card font-semibold text-brand shadow-card" : "font-medium text-text-secondary",
              )}
            >
              {id === "upcoming" ? t("tabUpcoming") : t("tabHistory")}
              {id === "upcoming" && liveUpcoming.length > 0 && (
                <span
                  className={cn(
                    "inline-flex h-5 items-center rounded-full px-1.5 text-2xs font-bold",
                    tab === id ? "bg-brand-subtle" : "bg-card",
                  )}
                >
                  {liveUpcoming.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === "upcoming" ? (
          <div className="flex flex-col gap-4">
            {liveUpcoming.length > 0 && (
              <div className="flex items-start gap-2.5 rounded-control bg-brand-subtle px-4 py-3.5">
                <Icon icon={Calendar} size={16} className="mt-0.5 flex-none text-brand" />
                <span className="text-sm leading-relaxed text-text-secondary">{t("cancelNote")}</span>
              </div>
            )}

            {liveUpcoming.length === 0 ? (
              <div className="flex flex-col items-center gap-2.5 rounded-card bg-card p-10 text-center shadow-card">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-sunken text-icon-muted">
                  <Icon icon={CalendarX} size={22} />
                </span>
                <span className="text-lg font-bold text-text-primary">{t("emptyUpcomingTitle")}</span>
                <span className="max-w-[320px] text-sm leading-relaxed text-text-secondary">{t("emptyUpcomingBody")}</span>
                <Button asChild variant="primary" size="md" className="mt-1.5">
                  <Link href="/pretraga">{t("searchSalons")}</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {liveUpcoming.map((b) => {
                  const start = new Date(b.scheduledAt);
                  const confirmed = b.status === "confirmed";
                  return (
                    <div
                      key={b.id}
                      className="grid grid-cols-1 gap-4 rounded-card bg-card p-4 shadow-card sm:grid-cols-[64px_minmax(0,1fr)] md:grid-cols-[76px_minmax(0,1fr)_auto] md:items-center md:gap-5 md:p-5"
                    >
                      <div
                        className={cn(
                          "flex flex-col items-center justify-center gap-0.5 rounded-control px-2 py-2.5",
                          confirmed ? "bg-brand text-primary-foreground" : "bg-surface-sunken text-text-secondary",
                        )}
                      >
                        <span className="text-2xs font-semibold uppercase tracking-wide">
                          {formatWeekdayShort(start).charAt(0).toUpperCase() + formatWeekdayShort(start).slice(1)}
                        </span>
                        <span className="text-2xl font-bold leading-tight">{start.getDate()}</span>
                        <span className="text-2xs font-medium">{formatMonthShort(start)}</span>
                      </div>

                      <div className="flex min-w-0 flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-lg font-bold tracking-tight text-text-primary">{b.service.name}</span>
                          <Badge variant={BOOKING_STATUS_TONE[b.status]}>{tStatus(b.status)}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                          <span className="inline-flex items-center gap-1.5 text-sm text-text-secondary">
                            <Icon icon={Clock} size={14} className="text-icon-muted" />
                            {timeRange(b.scheduledAt, b.service.durationMinutes)}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-sm text-text-secondary">
                            <Icon icon={Store} size={14} className="text-icon-muted" />
                            {b.salon.name} · {b.worker.name}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-sm text-text-secondary">
                            <Icon icon={MapPin} size={14} className="text-icon-muted" />
                            {b.salon.address}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-2.5 md:items-end">
                        <span className="flex flex-col items-start md:items-end">
                          <span className="text-2xs text-text-muted">{t("priceLabel")}</span>
                          <span className="price text-lg">{formatPrice(bookingAmount(b))}</span>
                        </span>
                        <div className="flex flex-wrap gap-2 md:justify-end">
                          <Button asChild variant="secondary" size="sm">
                            <Link href={`/saloni/${b.salon.slug}`}>{t("salonLink")}</Link>
                          </Button>
                          <Button type="button" variant="destructive" size="sm" onClick={() => setCancelTargetId(b.id)}>
                            <Icon icon={X} size={14} />
                            {t("cancelCta")}
                          </Button>
                        </div>
                        <span className="text-2xs text-text-muted">{t("cancelFreeNote")}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-text-primary">{t("filterSalonLabel")}</span>
                <Select value={salonFilter} onChange={(e) => setSalonFilter(e.target.value)} className="w-[200px]">
                  <option value="">{t("allSalons")}</option>
                  {salonOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-text-primary">{t("filterStatusLabel")}</span>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as BookingStatus | "")} className="w-[200px]">
                  <option value="">{t("allStatuses")}</option>
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {tStatus(s)}
                    </option>
                  ))}
                </Select>
              </label>
              <span className="ml-auto text-sm text-text-muted">
                {t("historyMeta", { shown: filteredHistory.length, total: history.length })}
              </span>
            </div>

            <div className="flex flex-col divide-y divide-border-subtle overflow-hidden rounded-card bg-card shadow-card">
              {filteredHistory.map((h) => {
                const reviewed = reviewedBookingIds.includes(h.id);
                const when = `${new Date(h.scheduledAt).getDate()}. ${formatMonthShort(new Date(h.scheduledAt))} ${new Date(h.scheduledAt).getFullYear()}, ${String(new Date(h.scheduledAt).getHours()).padStart(2, "0")}:${String(new Date(h.scheduledAt).getMinutes()).padStart(2, "0")}`;
                return (
                  <div key={h.id} className="grid grid-cols-1 gap-3 p-4 md:grid-cols-[1.4fr_1fr_auto] md:items-center md:gap-5">
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-base font-semibold text-text-primary">{h.service.name}</span>
                      <span className="text-sm text-text-secondary">
                        {h.salon.name} · {h.worker.name}
                      </span>
                    </div>
                    <div className="flex flex-col items-start gap-1.5">
                      <span className="inline-flex items-center gap-1.5 text-sm text-text-secondary">
                        <Icon icon={Calendar} size={14} className="text-icon-muted" />
                        {when}
                      </span>
                      <Badge variant={BOOKING_STATUS_TONE[h.status]}>{tStatus(h.status)}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 md:justify-end">
                      <span className="price text-base">{formatPrice(bookingAmount(h))}</span>
                      {h.status === "completed" &&
                        (reviewed ? (
                          <span className="inline-flex items-center gap-1.5 px-1 text-sm font-medium text-text-secondary">
                            <Icon icon={Check} size={14} className="text-success-fg" />
                            {t("reviewSubmitted")}
                          </span>
                        ) : (
                          <Button asChild variant="secondary" size="sm">
                            <Link href={`/moji-termini/${h.id}/recenzija`}>
                              <Icon icon={Star} size={14} />
                              {t("leaveReview")}
                            </Link>
                          </Button>
                        ))}
                      <Button asChild variant="primary" size="sm">
                        <Link href={`/saloni/${h.salon.slug}/zakazi?usluga=${h.service.id}&radnik=${h.worker.id}`}>
                          <Icon icon={Repeat} size={14} />
                          {t("rebook")}
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}

              {filteredHistory.length === 0 && (
                <div className="flex flex-col items-center gap-2 p-10 text-center">
                  <span className="text-base font-bold text-text-primary">{t("emptyHistoryTitle")}</span>
                  <span className="text-sm text-text-secondary">{t("emptyHistoryBody")}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />

      {cancelTarget && (
        <ModalOverlay className="p-5">
          <div className="flex w-full max-w-[400px] flex-col gap-4 rounded-modal bg-card p-6 shadow-modal">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-danger-bg text-danger-fg">
              <Icon icon={TriangleAlert} size={22} />
            </span>
            <div className="flex flex-col gap-1.5">
              <span className="text-xl font-bold tracking-tight text-text-primary">{t("cancelModalTitle")}</span>
              <span className="text-sm leading-relaxed text-text-secondary">
                {t("cancelModalText", {
                  service: cancelTarget.service.name,
                  salon: cancelTarget.salon.name,
                  when: `${formatWeekdayShort(new Date(cancelTarget.scheduledAt))} ${new Date(cancelTarget.scheduledAt).getDate()}. ${formatMonthShort(new Date(cancelTarget.scheduledAt))} u ${timeRange(cancelTarget.scheduledAt, cancelTarget.service.durationMinutes).split(" – ")[0]}`,
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-control bg-success-bg px-3 py-2.5 text-sm font-medium text-success-fg">
              <Icon icon={Check} size={16} />
              {t("cancelModalFreeNote")}
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={() => setCancelTargetId(null)}>
                {t("keepBooking")}
              </Button>
              <Button type="button" variant="destructive" size="lg" className="flex-1" onClick={confirmCancel}>
                {t("confirmCancel")}
              </Button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
}
