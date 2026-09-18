import { toDateKey } from "@/lib/date";
import { formatMinutesOfDay } from "@/lib/format";
import type { Salon, Service } from "@/types/entities";

export interface TimeSlot {
  time: string; // "HH:MM"
  taken: boolean;
}

/** Slot grid step, shared by the client wizard and the owner-side pickers. */
export const SLOT_INTERVAL_MINUTES = 30;

/** How many days ahead (starting today) the booking wizard lets a client pick from. */
export const BOOKING_WINDOW_DAYS = 14;

function parseTimeRange(range: string | null): { open: number; close: number } | null {
  if (range === null) return null;
  const [open, close] = range.split(" – ").map((part) => {
    const [h, m] = part.split(":").map(Number);
    return h * 60 + m;
  });
  return { open, close };
}

export function hoursForDate(salon: Salon, date: Date): { open: number; close: number } | null {
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  const dayLabel = day === 0 ? "Nedjelja" : day === 6 ? "Subota" : "Pon – Pet";
  const entry = salon.openingHours.find((h) => h.day === dayLabel);
  return entry ? parseTimeRange(entry.time) : null;
}

/**
 * Deterministic "already booked" pattern (stable per render — never truly
 * random) standing in for a real bookings table. ~1 in 5 slots come back taken.
 */
function isTakenSeed(key: string, workerId: number, time: string): boolean {
  const str = `${key}-${workerId}-${time}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return hash % 5 === 0;
}

/**
 * Pure slot computation for a salon+service+one-or-more-workers on one date.
 * `workerIds` with more than one entry means "bilo koji radnik" — a slot only
 * counts as taken if EVERY given worker is booked then.
 */
export function computeSlots({
  salon,
  service,
  workerIds,
  date,
  now = new Date(),
}: {
  salon: Salon;
  service: Service;
  workerIds: number[];
  date: Date;
  now?: Date;
}): TimeSlot[] {
  if (workerIds.length === 0) return [];
  const hours = hoursForDate(salon, date);
  if (!hours) return [];

  const key = toDateKey(date);
  const isToday = key === toDateKey(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const lastStart = hours.close - service.durationMinutes - service.bufferMinutes;

  const slots: TimeSlot[] = [];
  for (let t = hours.open; t <= lastStart; t += SLOT_INTERVAL_MINUTES) {
    if (isToday && t <= nowMinutes) continue;
    const time = formatMinutesOfDay(t);
    const taken = workerIds.every((id) => isTakenSeed(key, id, time));
    slots.push({ time, taken });
  }
  return slots;
}

export function countFreeSlots(args: Parameters<typeof computeSlots>[0]): number {
  return computeSlots(args).filter((s) => !s.taken).length;
}

export type DayPart = "morning" | "afternoon" | "evening";

// Minutes since midnight, [from, to).
const DAY_PARTS: { part: DayPart; from: number; to: number }[] = [
  { part: "morning", from: 0, to: 720 },
  { part: "afternoon", from: 720, to: 1020 },
  { part: "evening", from: 1020, to: 1440 },
];

/** Buckets slots into morning/afternoon/evening, dropping empty buckets. */
export function groupSlotsByDayPart(slots: TimeSlot[]): { part: DayPart; items: TimeSlot[] }[] {
  return DAY_PARTS.map(({ part, from, to }) => ({
    part,
    items: slots.filter((s) => {
      const [h, m] = s.time.split(":").map(Number);
      const minutes = h * 60 + m;
      return minutes >= from && minutes < to;
    }),
  })).filter((g) => g.items.length > 0);
}

export async function getAvailableSlots(args: Parameters<typeof computeSlots>[0]): Promise<TimeSlot[]> {
  return computeSlots(args);
}
