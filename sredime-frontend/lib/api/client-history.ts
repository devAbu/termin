import type { BookingDetails } from "@/lib/api/bookings";
import { completedRevenue, countNoShows } from "@/lib/api/booking-metrics";
import type { BookingStatus } from "@/types/entities";

/** Spec default (docs/specifikacija.md §3.2) — configurable per salon in a real backend, fixed here like dashboard's 30-day no-show KPI. */
export const NO_SHOW_THRESHOLD = 3;
export const NO_SHOW_WINDOW_DAYS = 90;

export type HistoryFilter = "all" | "completed" | "cancelled" | "no_show";

/** Statuses each history filter shows — "cancelled" merges both cancellation kinds (same grouping as the design). */
const FILTER_STATUSES: Record<HistoryFilter, BookingStatus[] | null> = {
  all: null,
  completed: ["completed"],
  cancelled: ["cancelled_by_client", "cancelled_by_salon"],
  no_show: ["no_show"],
};

export function sortNewestFirst(bookings: BookingDetails[]): BookingDetails[] {
  return bookings.slice().sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
}

export function filterHistory(bookings: BookingDetails[], filter: HistoryFilter): BookingDetails[] {
  const statuses = FILTER_STATUSES[filter];
  return statuses ? bookings.filter((b) => statuses.includes(b.status)) : bookings;
}

export interface ClientHistorySummary {
  completedCount: number;
  totalRevenue: number;
  lastCompletedAt: string | null;
  firstBookingAt: string | null;
  noShowsInWindow: number;
  thresholdReached: boolean;
}

/** KPI numbers for the "Klijent historija" header — `bookingsNewestFirst` must already be sorted newest-first (see `sortNewestFirst`). */
export function summarizeClientHistory(bookingsNewestFirst: BookingDetails[], now: Date): ClientHistorySummary {
  const completed = bookingsNewestFirst.filter((b) => b.status === "completed");
  const noShowsInWindow = countNoShows(bookingsNewestFirst, { now, days: NO_SHOW_WINDOW_DAYS });
  return {
    completedCount: completed.length,
    totalRevenue: completedRevenue(bookingsNewestFirst),
    lastCompletedAt: completed[0]?.scheduledAt ?? null,
    firstBookingAt: bookingsNewestFirst.length ? bookingsNewestFirst[bookingsNewestFirst.length - 1].scheduledAt : null,
    noShowsInWindow,
    thresholdReached: noShowsInWindow >= NO_SHOW_THRESHOLD,
  };
}
