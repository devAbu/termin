import type { BookingDetails } from "@/lib/api/bookings";
import { getEffectivePrice } from "@/lib/format";

/** What the client pays for one booking — base price minus the service discount. */
export function bookingAmount(b: BookingDetails): number {
  return getEffectivePrice(b.service.price, b.service.discountPercent);
}

/** Revenue = sum of `bookingAmount` over COMPLETED bookings only (docs: only "obavljeni termini" count as prihod). */
export function completedRevenue(bookings: BookingDetails[]): number {
  return bookings.filter((b) => b.status === "completed").reduce((sum, b) => sum + bookingAmount(b), 0);
}

/** No-show count; with `window`, only no-shows in the last `window.days` days up to `window.now`. */
export function countNoShows(bookings: BookingDetails[], window?: { now: Date; days: number }): number {
  const cutoff = window ? window.now.getTime() - window.days * 86_400_000 : null;
  return bookings.filter((b) => b.status === "no_show" && (cutoff === null || new Date(b.scheduledAt).getTime() >= cutoff)).length;
}
