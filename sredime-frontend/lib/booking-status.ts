/** Booking-status-derived display mappings — kept separate from lib/format.ts (text formatting only). */

import type { BookingStatus } from "@/types/entities";

export type BookingStatusTone = "success" | "danger" | "warning" | "info" | "neutral";

/** Canonical booking-status badge color, shared by client and owner/worker views alike. */
export const BOOKING_STATUS_TONE: Record<BookingStatus, BookingStatusTone> = {
  pending: "warning",
  confirmed: "success",
  completed: "neutral",
  cancelled_by_client: "neutral",
  cancelled_by_salon: "danger",
  no_show: "danger",
};
