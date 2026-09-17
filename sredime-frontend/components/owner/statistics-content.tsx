"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  Banknote,
  CalendarCheck,
  CalendarDays,
  Clock,
  Gauge,
  Inbox,
  Tag,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { formatPrice, formatMonthShort } from "@/lib/format";
import type { BookingDetails } from "@/lib/api/bookings";
import {
  getStatsRange,
  getPreviousRange,
  filterBookingsInRange,
  buildRevenueBars,
  capacityMinutes,
  busyMinutes,
  topServicesByCount,
  rateBreakdown,
  staffStatsRows,
  type StatsPeriod,
} from "@/lib/api/statistics";
import type { Salon, Worker } from "@/types/entities";

const PERIODS: StatsPeriod[] = ["today", "week", "month", "custom"];

function formatBsDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

function dayMonthLabel(d: Date): string {
  return `${d.getDate()}. ${formatMonthShort(d)}`;
}

function formatDelta(value: number, unit: "pct" | "pp"): string {
  const sign = value >= 0 ? "+" : "−";
  const abs = Math.abs(value);
  const num = unit === "pct" ? abs.toFixed(1).replace(".", ",") : String(Math.round(abs));
  return `${sign}${num}${unit === "pct" ? "%" : " p.p."}`;
}

export function StatisticsContent({
  salon,
  workers,
  bookings,
  pendingCount,
}: {
  salon: Salon;
  workers: Worker[];
  bookings: BookingDetails[];
  pendingCount: number;
}) {
  const t = useTranslations("dashboard");
  const ts = useTranslations("statsPage");

  const [period, setPeriod] = useState<StatsPeriod>("week");
  const [now] = useState(() => new Date());
  const [customFrom, setCustomFrom] = useState(() => formatBsDate(new Date(now.getTime() - 13 * 86_400_000)));
  const [customTo, setCustomTo] = useState(() => formatBsDate(now));
  const [staffFilter, setStaffFilter] = useState<number | null>(null);

  const range = useMemo(
    () => getStatsRange(period, now, period === "custom" ? { from: customFrom, to: customTo } : undefined),
    [period, now, customFrom, customTo],
  );

  const filtered = useMemo(() => (range ? filterBookingsInRange(bookings, range, staffFilter) : []), [bookings, range, staffFilter]);
  const prevRange = useMemo(() => (range ? getPreviousRange(range) : null), [range]);
  const prevFiltered = useMemo(() => (prevRange ? filterBookingsInRange(bookings, prevRange, staffFilter) : []), [bookings, prevRange, staffFilter]);

  const completed = filtered.filter((b) => b.status === "completed");
  const prevCompleted = prevFiltered.filter((b) => b.status === "completed");
  const revenue = completed.reduce((sum, b) => sum + Number(b.service.price), 0);
  const prevRevenue = prevCompleted.reduce((sum, b) => sum + Number(b.service.price), 0);
  const avg = completed.length ? revenue / completed.length : 0;
  const prevAvg = prevCompleted.length ? prevRevenue / prevCompleted.length : 0;

  const workerCount = staffFilter ? 1 : workers.length;
  const capacity = range ? capacityMinutes(salon, workerCount, range) : 0;
  const prevCapacity = prevRange ? capacityMinutes(salon, workerCount, prevRange) : 0;
  const loadPct = capacity > 0 ? Math.min(100, Math.round((busyMinutes(filtered) / capacity) * 100)) : 0;
  const prevLoadPct = prevCapacity > 0 ? Math.min(100, Math.round((busyMinutes(prevFiltered) / prevCapacity) * 100)) : 0;

  const revenueDelta = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : null;
  const apptsDelta = completed.length - prevCompleted.length;
  const avgDelta = prevAvg > 0 ? ((avg - prevAvg) / prevAvg) * 100 : null;
  const loadDelta = loadPct - prevLoadPct;

  const bars = useMemo(() => (range ? buildRevenueBars(filtered, range, salon) : []), [filtered, range, salon]);
  const maxBarRevenue = Math.max(1, ...bars.map((b) => b.revenue));
  const services = useMemo(() => topServicesByCount(filtered), [filtered]);
  const maxServiceCount = Math.max(1, ...services.map((s) => s.count));
  const rates = useMemo(() => rateBreakdown(filtered), [filtered]);

  const visibleWorkers = staffFilter ? workers.filter((w) => w.id === staffFilter) : workers;
  const staffRows = useMemo(
    () => (range ? staffStatsRows(filtered, visibleWorkers, salon, range).sort((a, b) => b.revenue - a.revenue) : []),
    [filtered, visibleWorkers, salon, range],
  );
  const totals = {
    appts: staffRows.reduce((sum, r) => sum + r.appts, 0),
    revenue: staffRows.reduce((sum, r) => sum + r.revenue, 0),
  };

  const chartSpanDays = range ? Math.round((range.end.getTime() - range.start.getTime()) / 86_400_000) : 0;
  const chartCaption =
    chartSpanDays <= 1 ? ts("chartCaptionHourly") : chartSpanDays <= 14 ? ts("chartCaptionDaily") : ts("chartCaptionWeekly");
  const rangeLabel = !range
    ? ""
    : period === "today"
      ? ts("rangeToday", { date: dayMonthLabel(now) })
      : period === "week"
        ? ts("rangeWeek", { from: dayMonthLabel(range.start), to: dayMonthLabel(new Date(range.end.getTime() - 86_400_000)) })
        : period === "month"
          ? ts("rangeMonth", { from: dayMonthLabel(range.start), to: dayMonthLabel(new Date(range.end.getTime() - 86_400_000)) })
          : ts("rangeCustom", { from: customFrom, to: customTo });

  const NAV = [
    { id: "kalendar", label: t("navCalendar"), icon: CalendarDays, href: "/dashboard" },
    { id: "zahtjevi", label: t("navRequests"), icon: Inbox, href: "/dashboard?tab=zahtjevi", count: pendingCount },
    { id: "klijenti", label: t("navClients"), icon: Users, href: "/dashboard?tab=klijenti" },
    { id: "usluge", label: t("navServices"), icon: Tag, href: "/dashboard?tab=usluge" },
    { id: "radnici", label: t("navStaff"), icon: UserPlus, href: "/dashboard?tab=radnici" },
    { id: "vrijeme", label: t("navHours"), icon: Clock, href: "/dashboard?tab=vrijeme" },
    { id: "statistika", label: t("navStats"), icon: BarChart3, href: "/statistika", active: true },
  ];

  const kpis = [
    { label: ts("kpiRevenueLabel"), value: formatPrice(revenue), icon: Banknote, delta: revenueDelta === null ? null : formatDelta(revenueDelta, "pct"), up: revenueDelta === null ? null : revenueDelta >= 0 },
    { label: ts("kpiApptsLabel"), value: String(completed.length), icon: CalendarCheck, delta: `${apptsDelta >= 0 ? "+" : "−"}${Math.abs(apptsDelta)} ${ts("apptsUnit")}`, up: apptsDelta >= 0 },
    { label: ts("kpiAvgLabel"), value: completed.length ? formatPrice(avg) : "—", icon: Tag, delta: avgDelta === null ? null : formatDelta(avgDelta, "pct"), up: avgDelta === null ? null : avgDelta >= 0 },
    { label: ts("kpiLoadLabel"), value: `${loadPct}%`, icon: Gauge, delta: formatDelta(loadDelta, "pp"), up: loadDelta >= 0 },
  ];

  const RATE_META = [
    { key: "cancelled" as const, label: ts("cancelRateLabel"), fg: "text-warning-fg", bar: "bg-warning-fg", hint: ts("cancelRateHint") },
    { key: "noShow" as const, label: ts("noShowRateLabel"), fg: "text-danger-fg", bar: "bg-danger-fg", hint: ts("noShowRateHint") },
  ];

  return (
    <div className="flex min-h-full bg-surface-canvas">
      <aside className="hidden w-60 flex-none flex-col gap-5 bg-surface-inverse p-4 text-brand-on lg:flex">
        <div className="flex flex-col gap-0.5 px-2 py-1">
          <span className="text-base font-bold tracking-tight">{salon.name}</span>
          <span className="text-xs text-indigo-200">{salon.city}</span>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => (
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
        <div className="flex flex-col gap-0.5 rounded-control bg-indigo-500 p-3">
          <span className="text-sm font-semibold">Selma Hodžić</span>
          <span className="text-xs text-indigo-200">{t("viewingAsOwner")}</span>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-col gap-3 border-b border-border-subtle bg-card px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between gap-3">
            <span className="text-lg font-bold text-text-primary lg:text-xl">{ts("title")}</span>
            <span className="hidden text-sm text-text-muted lg:inline">{rangeLabel}</span>
          </div>
          <nav className="flex gap-1.5 overflow-x-auto lg:hidden">
            {NAV.map((n) => (
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
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex gap-1 rounded-control bg-surface-sunken p-1">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "h-8.5 flex-none rounded-sm px-3.5 text-sm transition-colors",
                    period === p ? "bg-card font-semibold text-brand shadow-card" : "font-medium text-text-secondary",
                  )}
                >
                  {ts(`period_${p}`)}
                </button>
              ))}
            </div>
            {period === "custom" && (
              <span className="flex flex-wrap items-center gap-2">
                <Input value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} placeholder="01.09.2026" className="w-[130px]" size="md" />
                <span className="text-sm text-text-muted">{ts("customRangeTo")}</span>
                <Input value={customTo} onChange={(e) => setCustomTo(e.target.value)} placeholder="09.09.2026" className="w-[130px]" size="md" />
              </span>
            )}
            <div className="flex-1" />
            <Select
              value={staffFilter ?? ""}
              onChange={(e) => setStaffFilter(e.target.value ? Number(e.target.value) : null)}
              className="w-full sm:w-[190px]"
            >
              <option value="">{ts("allStaff")}</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </Select>
          </div>

          {!range ? (
            <div className="rounded-card bg-card p-10 text-center text-sm text-text-secondary shadow-card">{ts("invalidRange")}</div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {kpis.map((k) => (
                  <div key={k.label} className="flex flex-col gap-2.5 rounded-card bg-card p-4 shadow-card">
                    <span className="flex flex-wrap items-center gap-2.5">
                      <span className="flex h-8.5 w-8.5 flex-none items-center justify-center rounded-full bg-brand-subtle text-brand">
                        <Icon icon={k.icon} size={16} />
                      </span>
                      <span className="eyebrow min-w-0 text-wrap">{k.label}</span>
                    </span>
                    <span className="text-2xl font-bold tracking-tight text-text-primary lg:text-3xl">{k.value}</span>
                    {k.delta && (
                      <span className={cn("inline-flex items-center gap-1.5 text-xs", k.up ? "text-success-fg" : "text-danger-fg")}>
                        <Icon icon={k.up ? TrendingUp : TrendingDown} size={13} />
                        {k.delta}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4.5 rounded-card bg-card p-4 shadow-card lg:p-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <span className="flex flex-col gap-1">
                    <span className="text-lg font-bold tracking-tight text-text-primary">{ts("chartTitle")}</span>
                    <span className="text-sm text-text-secondary">{chartCaption}</span>
                  </span>
                  <span className="flex flex-col items-end">
                    <span className="text-2xs text-text-muted">{ts("chartTotalLabel")}</span>
                    <span className="price text-2xl">{formatPrice(revenue)}</span>
                  </span>
                </div>
                {bars.length === 0 ? (
                  <span className="text-sm text-text-muted">{ts("chartEmpty")}</span>
                ) : (
                  <div className="flex h-[200px] items-end gap-1.5 sm:gap-3">
                    {bars.map((b, i) => (
                      <span key={i} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
                        <span className={cn("whitespace-nowrap text-2xs font-semibold", b.revenue > 0 ? "text-text-primary" : "text-text-muted")}>
                          {b.revenue > 0 ? formatPrice(b.revenue) : "—"}
                        </span>
                        <span
                          className={cn("w-full min-h-1 rounded-t-md rounded-b-xs", b.revenue === maxBarRevenue && b.revenue > 0 ? "bg-accent" : "bg-indigo-200")}
                          style={{ height: `${Math.max(3, (b.revenue / maxBarRevenue) * 100)}%` }}
                        />
                        <span className="max-w-full truncate text-2xs text-text-muted">{b.label}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 items-start gap-4.5 lg:grid-cols-2">
                <div className="flex flex-col gap-3.5 rounded-card bg-card p-4 shadow-card lg:p-6">
                  <span className="flex flex-col gap-1">
                    <span className="text-lg font-bold tracking-tight text-text-primary">{ts("topServicesTitle")}</span>
                    <span className="text-sm text-text-secondary">{ts("topServicesSub")}</span>
                  </span>
                  {services.length === 0 ? (
                    <span className="text-sm text-text-muted">{ts("noData")}</span>
                  ) : (
                    <div className="flex flex-col gap-3.5">
                      {services.map((s, i) => (
                        <span key={s.name} className="flex min-w-0 flex-col gap-1.5">
                          <span className="flex items-baseline justify-between gap-3">
                            <span className="truncate text-sm font-medium text-text-primary">{s.name}</span>
                            <span className="flex flex-none gap-2.5 whitespace-nowrap text-sm">
                              <span className="text-text-secondary">{s.count}×</span>
                              <span className="price">{formatPrice(s.revenue)}</span>
                            </span>
                          </span>
                          <span className="h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                            <span
                              className={cn("block h-full rounded-full", i === 0 ? "bg-accent" : "bg-indigo-200")}
                              style={{ width: `${Math.round((s.count / maxServiceCount) * 100)}%` }}
                            />
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4 rounded-card bg-card p-4 shadow-card lg:p-6">
                  <span className="flex flex-col gap-1">
                    <span className="text-lg font-bold tracking-tight text-text-primary">{ts("ratesTitle")}</span>
                    <span className="text-sm text-text-secondary">{ts("ratesSub")}</span>
                  </span>
                  {RATE_META.map((meta) => {
                    const r = rates[meta.key];
                    return (
                      <span key={meta.key} className="flex flex-col gap-1.5">
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="text-sm font-medium text-text-primary">{meta.label}</span>
                          <span className="flex items-baseline gap-2 whitespace-nowrap">
                            <span className={cn("text-lg font-bold", meta.fg)}>{String(r.pct).replace(".", ",")}%</span>
                            <span className="text-xs text-text-muted">{ts("rateCount", { count: r.count, total: r.total })}</span>
                          </span>
                        </span>
                        <span className="h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                          <span className={cn("block h-full rounded-full", meta.bar)} style={{ width: `${Math.min(100, r.pct * 6)}%` }} />
                        </span>
                        <span className="text-xs leading-relaxed text-text-muted">{meta.hint}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="overflow-hidden rounded-card bg-card shadow-card">
                <div className="flex flex-wrap items-baseline gap-2.5 border-b border-border-subtle p-4 lg:p-6">
                  <span className="text-lg font-bold tracking-tight text-text-primary">{ts("staffTableTitle")}</span>
                  <span className="text-sm text-text-muted">{rangeLabel}</span>
                </div>
                {staffRows.length === 0 ? (
                  <div className="p-8 text-center text-sm text-text-secondary">{ts("noData")}</div>
                ) : (
                  staffRows.map((r, i) => (
                    <div key={r.workerId} className="grid grid-cols-1 gap-3 border-b border-border-subtle p-4 last:border-b-0 sm:grid-cols-[minmax(0,1.6fr)_repeat(3,auto)] lg:grid-cols-[minmax(0,1.5fr)_90px_120px_110px_minmax(120px,1fr)_auto] lg:items-center lg:gap-3 lg:p-4 lg:px-6">
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-brand-subtle text-xs font-bold text-brand">
                          {r.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                        </span>
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate text-base font-semibold text-text-primary">{r.name}</span>
                          <span className="text-xs text-text-muted">{r.role}</span>
                        </span>
                      </span>
                      <span className="text-sm lg:text-right">
                        <span className="text-text-muted lg:hidden">{ts("colAppts")}: </span>
                        {r.appts}
                      </span>
                      <span className="text-sm lg:text-right">
                        <span className="text-text-muted lg:hidden">{ts("colRevenue")}: </span>
                        <span className="price">{formatPrice(r.revenue)}</span>
                      </span>
                      <span className="text-sm text-text-secondary lg:text-right">
                        <span className="text-text-muted lg:hidden">{ts("colAvg")}: </span>
                        {formatPrice(r.avg)}
                      </span>
                      <span className="flex min-w-0 flex-col gap-1.5">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="text-xs text-text-muted">{ts("colLoad")}</span>
                          <span className="text-xs font-semibold text-text-primary">{r.load}%</span>
                        </span>
                        <span className="h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                          <span className={cn("block h-full rounded-full", r.load >= 75 ? "bg-accent" : "bg-indigo-200")} style={{ width: `${r.load}%` }} />
                        </span>
                      </span>
                      <Badge variant={i === 0 && r.revenue > 0 ? "warning" : r.load >= 75 ? "success" : "neutral"} className="justify-self-start lg:justify-self-end">
                        {i === 0 && r.revenue > 0 ? ts("badgeTopRevenue") : r.load >= 75 ? ts("badgeHighLoad") : ts("badgeHasRoom")}
                      </Badge>
                    </div>
                  ))
                )}
                {staffRows.length > 0 && (
                  <div className="flex flex-wrap justify-between gap-3 bg-surface-sunken p-4 lg:px-6">
                    <span className="text-sm font-semibold text-text-primary">{ts("totalAppts", { count: totals.appts })}</span>
                    <span className="price text-sm">{formatPrice(totals.revenue)}</span>
                  </div>
                )}
              </div>

              <span className="text-xs leading-relaxed text-text-muted">{ts("footnote")}</span>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
