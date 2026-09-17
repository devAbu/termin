import type { BookingStatus } from "@/types/entities";
import bookingsFixture from "@/lib/mock-data/bookings.json";
import { getSalonById } from "@/lib/api/salons";
import { getWorkerById } from "@/lib/api/workers";
import { getServiceById } from "@/lib/api/services";

/**
 * `scheduledAt` is nominally "UTC ISO 8601" per docs/database.md, but there is
 * no real UTC<->BiH conversion pipeline yet (backend is paused). The fixture
 * deliberately omits the "Z" suffix (e.g. "2026-09-21T14:30:00") so `Date`
 * parses it as local wall-clock time everywhere it's read — with a "Z" the
 * browser applies its own UTC offset on top of the intended BiH time and the
 * displayed hour drifts (caught during this session: 14:30 rendered as
 * 16:30). Revisit once the backend actually stores/converts real UTC.
 */

/** No auth yet (§3 u docs/PROGRESS.md) — svi client-facing ekrani gledaju istog mock klijenta. */
export const CURRENT_CLIENT_ID = 1;

/** No auth yet — salon dashboard je uvijek "Studio Lux" (id 1) dok vlasnik/radnik login ne postoji. */
export const CURRENT_SALON_ID = 1;

interface RawBooking {
  id: number;
  clientId: number | null;
  clientName: string;
  clientPhone: string;
  salonId: number;
  workerId: number;
  serviceId: number;
  scheduledAt: string;
  status: BookingStatus;
  manuallyEntered: boolean;
}

export interface BookingDetails {
  id: number;
  clientId: number | null;
  clientName: string;
  clientPhone: string;
  status: BookingStatus;
  scheduledAt: string;
  manuallyEntered: boolean;
  salon: { id: number; name: string; slug: string; address: string };
  service: { id: number; name: string; durationMinutes: number; bufferMinutes: number; price: string; discountPercent: number | null };
  worker: { id: number; name: string };
}

function all(): RawBooking[] {
  return bookingsFixture as RawBooking[];
}

async function withDetails(b: RawBooking): Promise<BookingDetails | null> {
  const [salon, service, worker] = await Promise.all([
    getSalonById(b.salonId),
    getServiceById(b.serviceId),
    getWorkerById(b.workerId),
  ]);
  if (!salon || !service || !worker) return null;
  return {
    id: b.id,
    clientId: b.clientId,
    clientName: b.clientName,
    clientPhone: b.clientPhone,
    status: b.status,
    scheduledAt: b.scheduledAt,
    manuallyEntered: b.manuallyEntered,
    salon: { id: salon.id, name: salon.name, slug: salon.slug, address: salon.address },
    service: { id: service.id, name: service.name, durationMinutes: service.durationMinutes, bufferMinutes: service.bufferMinutes, price: service.price, discountPercent: service.discountPercent },
    worker: { id: worker.id, name: worker.name },
  };
}

const UNRESOLVED_STATUSES: BookingStatus[] = ["pending", "confirmed"];

async function withDetailsAll(rows: RawBooking[]): Promise<BookingDetails[]> {
  const resolved = await Promise.all(rows.map(withDetails));
  return resolved.filter((b): b is BookingDetails => b !== null);
}

export async function getUpcomingBookings(clientId: number): Promise<BookingDetails[]> {
  const now = new Date();
  const rows = all().filter(
    (b) => b.clientId === clientId && UNRESOLVED_STATUSES.includes(b.status) && new Date(b.scheduledAt) >= now,
  );
  const details = await withDetailsAll(rows);
  return details.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
}

export async function getBookingById(id: number, clientId: number): Promise<BookingDetails | null> {
  const row = all().find((b) => b.id === id && b.clientId === clientId);
  return row ? withDetails(row) : null;
}

export async function getBookingHistory(clientId: number): Promise<BookingDetails[]> {
  const now = new Date();
  const rows = all().filter(
    (b) => b.clientId === clientId && (!UNRESOLVED_STATUSES.includes(b.status) || new Date(b.scheduledAt) < now),
  );
  const details = await withDetailsAll(rows);
  return details.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
}

/** Dashboard — every booking for the salon, any date/status, earliest first. Filtering (by day, by
 * pending, by client) happens client-side via the pure helpers below, same pattern as `filterSalons`. */
export async function getSalonBookings(salonId: number): Promise<BookingDetails[]> {
  const rows = all().filter((b) => b.salonId === salonId);
  const details = await withDetailsAll(rows);
  return details.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
}

function isSameCalendarDay(iso: string, date: Date): boolean {
  const d = new Date(iso);
  return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate();
}

/** Dashboard "Kalendar" tab — bookings on one calendar day, earliest first. */
export function pickBookingsForDate(bookings: BookingDetails[], date: Date): BookingDetails[] {
  return bookings.filter((b) => isSameCalendarDay(b.scheduledAt, date));
}

/** Dashboard "Zahtjevi" tab — pending bookings across all dates, soonest first. */
export function pickPendingBookings(bookings: BookingDetails[]): BookingDetails[] {
  return bookings.filter((b) => b.status === "pending");
}

/** Klijent historija — one client's bookings at one salon, most recent first (`bookings` is already salon-scoped, e.g. from `getSalonBookings`). */
export function getClientBookingsForSalon(bookings: BookingDetails[], clientName: string): BookingDetails[] {
  return bookings
    .filter((b) => b.clientName === clientName)
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
}

export interface SalonClientSummary {
  name: string;
  phone: string;
  visits: number;
  lastVisitAt: string;
  noShowCount: number;
}

/** Dashboard "Klijenti" tab — every distinct client who has booked at this salon, aggregated from real bookings. */
export function summarizeClients(bookings: BookingDetails[]): SalonClientSummary[] {
  const byName = new Map<string, BookingDetails[]>();
  for (const b of bookings) {
    const list = byName.get(b.clientName) ?? [];
    list.push(b);
    byName.set(b.clientName, list);
  }
  return Array.from(byName.values())
    .map((list) => {
      const sorted = list.slice().sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
      return {
        name: sorted[0].clientName,
        phone: sorted[0].clientPhone,
        visits: sorted.length,
        lastVisitAt: sorted[0].scheduledAt,
        noShowCount: sorted.filter((b) => b.status === "no_show").length,
      };
    })
    .sort((a, b) => new Date(b.lastVisitAt).getTime() - new Date(a.lastVisitAt).getTime());
}
