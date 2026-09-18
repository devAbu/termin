/** Local-time calendar helpers (all "day" logic here is local wall-clock, never UTC — see docs/PROGRESS.md §16.1 Bug A). */

export function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

/** `count` consecutive local days starting at the start of `from`'s day (default: today). */
export function buildDayWindow(count: number, from: Date = new Date()): Date[] {
  const base = startOfDay(from);
  return Array.from({ length: count }, (_, i) => addDays(base, i));
}

/** Local "YYYY-MM-DD" of a date. */
export function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Zone-less local ISO string, "2026-09-18T09:30:00". Deliberately NOT toISOString(), which converts to UTC and shifts the hour. */
export function toLocalIso(date: Date, time: string): string {
  return `${toDateKey(date)}T${time}:00`;
}
