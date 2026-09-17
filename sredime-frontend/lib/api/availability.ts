import type { Salon, Service } from "@/types/entities";

export interface TimeSlot {
  time: string; // "HH:MM"
  taken: boolean;
}

const SLOT_INTERVAL_MINUTES = 30;

function parseTimeRange(range: string): { open: number; close: number } | null {
  if (range === "Zatvoreno") return null;
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

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
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

  const key = dateKey(date);
  const isToday = key === dateKey(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const lastStart = hours.close - service.durationMinutes - service.bufferMinutes;

  const slots: TimeSlot[] = [];
  for (let t = hours.open; t <= lastStart; t += SLOT_INTERVAL_MINUTES) {
    if (isToday && t <= nowMinutes) continue;
    const time = `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
    const taken = workerIds.every((id) => isTakenSeed(key, id, time));
    slots.push({ time, taken });
  }
  return slots;
}

export function countFreeSlots(args: Parameters<typeof computeSlots>[0]): number {
  return computeSlots(args).filter((s) => !s.taken).length;
}

export async function getAvailableSlots(args: Parameters<typeof computeSlots>[0]): Promise<TimeSlot[]> {
  return computeSlots(args);
}
