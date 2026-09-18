import type { Salon, Worker } from "@/types/entities";
import type { BookingDetails } from "@/lib/api/bookings";
import { hoursForDate } from "@/lib/api/availability";
import { addDays, startOfDay } from "@/lib/date";
import { bookingAmount, completedRevenue, countNoShows } from "@/lib/api/booking-metrics";
import { formatWeekdayShort } from "@/lib/format";

export type StatsPeriod = "today" | "week" | "month" | "custom";

export interface DateRange {
  start: Date; // inclusive
  end: Date; // exclusive
}

export interface StatsBar {
  label: string;
  revenue: number;
  completedCount: number;
}

/** Bookings that occupy a calendar slot — everything except the two cancelled statuses (matches the dashboard's day-fullness rule). */
const OCCUPYING_STATUSES = new Set(["pending", "confirmed", "completed", "no_show"]);

function inRange(iso: string, start: Date, end: Date): boolean {
  const t = new Date(iso).getTime();
  return t >= start.getTime() && t < end.getTime();
}

/** "dd.mm.yyyy" → Date, or null if unparseable — the "Raspon" custom date inputs. */
export function parseBsDate(value: string): Date | null {
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(value.trim());
  if (!m) return null;
  const [, d, mo, y] = m;
  const date = new Date(Number(y), Number(mo) - 1, Number(d));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Resolves a period selector to a concrete [start, end) range. `null` for "custom" with unparseable/inverted dates. */
export function getStatsRange(period: StatsPeriod, now: Date, custom?: { from: string; to: string }): DateRange | null {
  const today = startOfDay(now);
  if (period === "today") return { start: today, end: addDays(today, 1) };
  if (period === "week") return { start: addDays(today, -6), end: addDays(today, 1) };
  if (period === "month") return { start: addDays(today, -29), end: addDays(today, 1) };
  const from = custom ? parseBsDate(custom.from) : null;
  const to = custom ? parseBsDate(custom.to) : null;
  if (!from || !to || from > to) return null;
  return { start: startOfDay(from), end: addDays(startOfDay(to), 1) };
}

/** Same-length window immediately before `range`, for trend deltas. */
export function getPreviousRange(range: DateRange): DateRange {
  const spanMs = range.end.getTime() - range.start.getTime();
  return { start: new Date(range.start.getTime() - spanMs), end: new Date(range.start.getTime()) };
}

export function filterBookingsInRange(bookings: BookingDetails[], range: DateRange, workerId?: number | null): BookingDetails[] {
  return bookings.filter((b) => {
    if (!inRange(b.scheduledAt, range.start, range.end)) return false;
    if (workerId && b.worker.id !== workerId) return false;
    return true;
  });
}

function bucketBar(label: string, bookings: BookingDetails[], start: Date, end: Date): StatsBar {
  const completed = bookings.filter((b) => b.status === "completed" && inRange(b.scheduledAt, start, end));
  return {
    label,
    revenue: completedRevenue(completed),
    completedCount: completed.length,
  };
}

/** Revenue-per-bucket bars: hourly for a same-day range, daily up to 14 days, weekly beyond that. */
export function buildRevenueBars(bookings: BookingDetails[], range: DateRange, salon: Salon): StatsBar[] {
  const spanDays = Math.round((range.end.getTime() - range.start.getTime()) / 86_400_000);

  if (spanDays <= 1) {
    const hours = hoursForDate(salon, range.start);
    if (!hours) return [];
    const bars: StatsBar[] = [];
    for (let h = Math.floor(hours.open / 60); h < Math.ceil(hours.close / 60); h++) {
      const hStart = new Date(range.start);
      hStart.setHours(h, 0, 0, 0);
      const hEnd = new Date(hStart);
      hEnd.setHours(h + 1, 0, 0, 0);
      bars.push(bucketBar(`${h}h`, bookings, hStart, hEnd));
    }
    return bars;
  }

  if (spanDays <= 14) {
    const bars: StatsBar[] = [];
    for (let i = 0; i < spanDays; i++) {
      const dStart = addDays(range.start, i);
      const dEnd = addDays(dStart, 1);
      bars.push(bucketBar(`${formatWeekdayShort(dStart)} ${dStart.getDate()}.${dStart.getMonth() + 1}.`, bookings, dStart, dEnd));
    }
    return bars;
  }

  const bars: StatsBar[] = [];
  for (let offset = 0; offset < spanDays; offset += 7) {
    const wStart = addDays(range.start, offset);
    const wEnd = addDays(wStart, Math.min(7, spanDays - offset));
    const wLastDay = addDays(wEnd, -1);
    bars.push(bucketBar(`${wStart.getDate()}.${wStart.getMonth() + 1}.–${wLastDay.getDate()}.${wLastDay.getMonth() + 1}.`, bookings, wStart, wEnd));
  }
  return bars;
}

/** Total open-calendar minutes across every worker in `range` — the denominator for "popunjenost". Ignores per-worker schedules (not modeled yet, same simplification as the dashboard). */
export function capacityMinutes(salon: Salon, workerCount: number, range: DateRange): number {
  const spanDays = Math.round((range.end.getTime() - range.start.getTime()) / 86_400_000);
  let total = 0;
  for (let i = 0; i < spanDays; i++) {
    const hours = hoursForDate(salon, addDays(range.start, i));
    if (hours) total += (hours.close - hours.open) * workerCount;
  }
  return total;
}

export function busyMinutes(bookings: BookingDetails[]): number {
  return bookings.filter((b) => OCCUPYING_STATUSES.has(b.status)).reduce((sum, b) => sum + b.service.durationMinutes, 0);
}

export interface ServiceStat {
  name: string;
  count: number;
  revenue: number;
}

/** Top completed services by booking count within the (already filtered) range. */
export function topServicesByCount(bookings: BookingDetails[], limit = 5): ServiceStat[] {
  const byName = new Map<string, ServiceStat>();
  for (const b of bookings) {
    if (b.status !== "completed") continue;
    const cur = byName.get(b.service.name) ?? { name: b.service.name, count: 0, revenue: 0 };
    cur.count += 1;
    cur.revenue += bookingAmount(b);
    byName.set(b.service.name, cur);
  }
  return Array.from(byName.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export interface RateStat {
  count: number;
  total: number;
  pct: number;
}

export function rateBreakdown(bookings: BookingDetails[]): { cancelled: RateStat; noShow: RateStat } {
  const total = bookings.length;
  const cancelledCount = bookings.filter((b) => b.status === "cancelled_by_client" || b.status === "cancelled_by_salon").length;
  const noShowCount = countNoShows(bookings);
  const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 1000) / 10);
  return {
    cancelled: { count: cancelledCount, total, pct: pct(cancelledCount) },
    noShow: { count: noShowCount, total, pct: pct(noShowCount) },
  };
}

export interface StaffStatRow {
  workerId: number;
  name: string;
  role: string;
  appts: number;
  revenue: number;
  avg: number;
  load: number;
}

/** Per-worker report row for `range` — `bookings` should already be range-filtered (and NOT staff-filtered, so every worker gets their own row). */
export function staffStatsRows(bookings: BookingDetails[], workers: Worker[], salon: Salon, range: DateRange): StaffStatRow[] {
  const cap = capacityMinutes(salon, 1, range);
  return workers.map((w) => {
    const forWorker = bookings.filter((b) => b.worker.id === w.id);
    const completed = forWorker.filter((b) => b.status === "completed");
    const revenue = completedRevenue(completed);
    const busy = busyMinutes(forWorker);
    return {
      workerId: w.id,
      name: w.name,
      role: w.position,
      appts: completed.length,
      revenue,
      avg: completed.length ? Math.round(revenue / completed.length) : 0,
      load: cap > 0 ? Math.min(100, Math.round((busy / cap) * 100)) : 0,
    };
  });
}
