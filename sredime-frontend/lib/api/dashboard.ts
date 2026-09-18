import { pickBookingsForDate, type BookingDetails } from "@/lib/api/bookings";
import { hoursForDate, SLOT_INTERVAL_MINUTES } from "@/lib/api/availability";
import { completedRevenue, countNoShows } from "@/lib/api/booking-metrics";
import { busyMinutes } from "@/lib/api/statistics";
import { addDays, startOfDay, toLocalIso } from "@/lib/date";
import { formatMinutesOfDay } from "@/lib/format";
import type { Salon, Service } from "@/types/entities";

/** Pure helpers behind the owner/worker "Salon dashboard" — no React/DOM, so the mobile app can reuse them. */

/** "Pomjeri" proposes at most this many slots, looking this many days ahead (today included). */
const MAX_MOVE_SLOTS = 4;
const MOVE_WINDOW_DAYS = 7;
/** Fixture bookings + per-booking edits (status/time) + bookings added this session, earliest first. */
export function mergeBookings(
  bookings: BookingDetails[],
  overrides: Record<number, Partial<BookingDetails>>,
  extra: BookingDetails[],
): BookingDetails[] {
  const merged = bookings.map((b) => (overrides[b.id] ? { ...b, ...overrides[b.id] } : b));
  return [...merged, ...extra].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
}

/** Fixture services + per-service edits made this session. */
export function mergeServices(services: Service[], overrides: Record<number, Partial<Service>>): Service[] {
  return services.map((s) => (overrides[s.id] ? { ...s, ...overrides[s.id] } : s));
}

/** Booked minutes as a share of opening hours (0–100), or `null` when the salon is closed that day. `bookings` = the day's bookings. */
export function dayFullnessPercent(bookings: BookingDetails[], hours: { open: number; close: number } | null): number | null {
  if (!hours) return null;
  const span = hours.close - hours.open;
  return Math.min(100, Math.round((busyMinutes(bookings) / span) * 100));
}

export interface DashboardStats {
  total: number;
  completed: number;
  noShows: number;
  revenue: number;
}

/** "Statistika" tab headline numbers over all bookings. */
export function summarizeBookings(bookings: BookingDetails[]): DashboardStats {
  return {
    total: bookings.length,
    completed: bookings.filter((b) => b.status === "completed").length,
    noShows: countNoShows(bookings),
    revenue: completedRevenue(bookings),
  };
}

/** "Statistika" tab per-worker line: confirmed = confirmed or completed, unconfirmed = still pending. */
export function workerConfirmationTally(bookings: BookingDetails[], workerId: number): { confirmed: number; unconfirmed: number } {
  const forWorker = bookings.filter((b) => b.worker.id === workerId);
  return {
    confirmed: forWorker.filter((b) => b.status === "completed" || b.status === "confirmed").length,
    unconfirmed: forWorker.filter((b) => b.status === "pending").length,
  };
}

export interface MoveSlot {
  date: Date;
  time: string;
  /** Zone-less local ISO, see `toLocalIso`. */
  iso: string;
}

interface BusyRange {
  start: number;
  end: number;
}

/**
 * Minute ranges (since midnight) `workerId` is occupied on `date` per real bookings — each from its start
 * through its service duration PLUS that service's own `bufferMinutes` (cleanup/prep time before the next
 * client). `excludeBookingId` = a booking being moved, which must not block itself.
 */
export function busyRangesForWorkerOnDay(bookings: BookingDetails[], workerId: number, date: Date, excludeBookingId?: number): BusyRange[] {
  const forWorker = bookings.filter((b) => b.id !== excludeBookingId && b.worker.id === workerId);
  return pickBookingsForDate(forWorker, date).map((b) => {
    const bd = new Date(b.scheduledAt);
    const start = bd.getHours() * 60 + bd.getMinutes();
    return { start, end: start + b.service.durationMinutes + b.service.bufferMinutes };
  });
}

/** Does a `need`-minute appointment starting at `startMinute` overlap any busy range? */
function overlapsBusy(busy: BusyRange[], startMinute: number, need: number): boolean {
  return busy.some((r) => startMinute < r.end && startMinute + need > r.start);
}

export interface OwnerSlot {
  time: string;
  taken: boolean;
}

/**
 * Owner-side time grid for "Novi termin": every slot inside opening hours (today: only future ones),
 * `taken` when it overlaps a real booking of that worker. Real bookings, not the pseudo-random
 * stand-in used by the client wizard (`computeSlots`).
 */
export function computeOwnerSlots({
  salon,
  service,
  workerId,
  date,
  existingBookings,
  now = new Date(),
}: {
  salon: Salon;
  service: Pick<Service, "durationMinutes" | "bufferMinutes">;
  workerId: number;
  date: Date;
  existingBookings: BookingDetails[];
  now?: Date;
}): OwnerSlot[] {
  const hours = hoursForDate(salon, date);
  if (!hours) return [];
  const need = service.durationMinutes + service.bufferMinutes;
  const busy = busyRangesForWorkerOnDay(existingBookings, workerId, date);
  const isToday = date.toDateString() === now.toDateString();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const slots: OwnerSlot[] = [];
  for (let t = hours.open; t + need <= hours.close; t += SLOT_INTERVAL_MINUTES) {
    if (isToday && t <= nowMinutes) continue;
    slots.push({ time: formatMinutesOfDay(t), taken: overlapsBusy(busy, t, need) });
  }
  return slots;
}

/**
 * "Pomjeri" — first free slots for `booking`'s worker (the booking itself doesn't block), scanning
 * the next days from `today` inside opening hours.
 */
export function findMoveSlots({
  salon,
  booking,
  allBookings,
  today = new Date(),
}: {
  salon: Salon;
  booking: BookingDetails;
  allBookings: BookingDetails[];
  today?: Date;
}): MoveSlot[] {
  const need = booking.service.durationMinutes + booking.service.bufferMinutes;
  const out: MoveSlot[] = [];
  for (let dayOff = 0; dayOff < MOVE_WINDOW_DAYS && out.length < MAX_MOVE_SLOTS; dayOff++) {
    const d = addDays(startOfDay(today), dayOff);
    const hours = hoursForDate(salon, d);
    if (!hours) continue;
    const busy = busyRangesForWorkerOnDay(allBookings, booking.worker.id, d, booking.id);
    for (let t = hours.open; t + need <= hours.close && out.length < MAX_MOVE_SLOTS; t += SLOT_INTERVAL_MINUTES) {
      if (overlapsBusy(busy, t, need)) continue;
      const time = formatMinutesOfDay(t);
      out.push({ date: d, time, iso: toLocalIso(d, time) });
    }
  }
  return out;
}

/** Booking entered by hand from the dashboard ("Novi termin") — confirmed straight away, `manuallyEntered`. */
export function buildManualBooking({
  id,
  salon,
  service,
  worker,
  clientName,
  clientPhone,
  date,
  time,
}: {
  id: number;
  salon: Salon;
  service: Service;
  worker: { id: number; name: string };
  clientName: string;
  clientPhone: string;
  date: Date;
  time: string;
}): BookingDetails {
  return {
    id,
    clientId: null,
    clientName,
    clientPhone,
    status: "confirmed",
    scheduledAt: toLocalIso(date, time),
    manuallyEntered: true,
    salon: { id: salon.id, name: salon.name, slug: salon.slug, address: salon.address },
    service: {
      id: service.id,
      name: service.name,
      durationMinutes: service.durationMinutes,
      bufferMinutes: service.bufferMinutes,
      price: service.price,
      discountPercent: service.discountPercent,
    },
    worker: { id: worker.id, name: worker.name },
  };
}
