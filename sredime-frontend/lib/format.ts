/**
 * Formatting helpers per design/README.md content rules: prices "35 KM"
 * (space before suffix, no symbol, no trailing .00), percentages with comma
 * decimal ("6,3%"), thousands with a period ("1.240 KM").
 */

/**
 * Formats manually rather than via `toLocaleString("bs-BA", ...)` — Node's
 * ICU data (server) and the browser's (client) can disagree on the "bs-BA"
 * decimal separator, which desyncs SSR/hydration for any non-integer price.
 */
export function formatPrice(amount: string | number, currency = "KM"): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  const rounded = Math.round(value * 100) / 100;
  const hasFraction = Math.round(rounded * 100) % 100 !== 0;
  const [intPart, fracPart] = rounded.toFixed(hasFraction ? 2 : 0).split(".");
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const formatted = hasFraction ? `${withThousands},${fracPart}` : withThousands;
  return `${formatted} ${currency}`;
}

/**
 * `Service.price` is always the base/original price (docs/database.md). A discount
 * is subtracted FROM it — it never means "price is already discounted" (e.g. 35 KM
 * + 20% popust = 28 KM klijentu, not 35 KM already being the discounted amount).
 * Use this everywhere a booking/service amount is charged, summed, or displayed as
 * "what the client pays" — never read `.price` directly when `discountPercent` is
 * also in scope.
 */
export function getEffectivePrice(price: string | number, discountPercent?: number | null): number {
  const base = typeof price === "string" ? Number(price) : price;
  if (!discountPercent) return base;
  return base * (1 - discountPercent / 100);
}

/** Bosnian 3-way plural: 1 → one, 2–4 → few, 0/5+ → many (e.g. "posjeta"/"posjete"/"posjeta"). */
export function pluralBs(count: number, one: string, few: string, many: string): string {
  return count === 1 ? one : count >= 2 && count <= 4 ? few : many;
}

/** "850 m" under 1km, "1,2 km" otherwise — matches frontend.md's "1.2 km" example, comma decimal per design/README.md. */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  const rounded = Math.round(km * 10) / 10;
  return `${rounded.toString().replace(".", ",")} km`;
}

export function formatPercent(value: number): string {
  return `${value.toLocaleString("bs-BA", { maximumFractionDigits: 1 })}%`;
}

/** "prije 3 dana" / "prije 2 sedmice" / "prije 4 mjeseca" — for review timestamps (createdAt is UTC). */
export function formatRelativeDate(iso: string, now: Date = new Date()): string {
  const diffDays = Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000);
  if (diffDays <= 0) return "danas";
  if (diffDays === 1) return "juče";
  if (diffDays < 7) return `prije ${diffDays} dana`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? "prije sedmicu dana" : `prije ${weeks} sedmice`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `prije ${months} ${months === 1 ? "mjesec" : months <= 4 ? "mjeseca" : "mjeseci"}`;
  }
  const years = Math.floor(diffDays / 365);
  return `prije ${years} ${years === 1 ? "godinu" : years <= 4 ? "godine" : "godina"}`;
}

const MONTHS_BS = [
  "januar", "februar", "mart", "april", "maj", "juni",
  "juli", "avgust", "septembar", "oktobar", "novembar", "decembar",
];
const WEEKDAYS_BS = ["nedjelja", "ponedjeljak", "utorak", "srijeda", "četvrtak", "petak", "subota"];

function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

/** "danas, 14. oktobar" / "sutra, 15. oktobar" / "srijeda, 21. oktobar" (design/README.md: lowercase months). */
export function formatDayLabel(date: Date, today: Date = new Date()): string {
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const datePart = `${date.getDate()}. ${MONTHS_BS[date.getMonth()]}`;
  if (isSameDay(date, today)) return `danas, ${datePart}`;
  if (isSameDay(date, tomorrow)) return `sutra, ${datePart}`;
  return `${WEEKDAYS_BS[date.getDay()]}, ${datePart}`;
}

/** 3-letter weekday abbreviation for the day-strip ("pon", "uto", "sri" ...). */
export function formatWeekdayShort(date: Date): string {
  return WEEKDAYS_BS[date.getDay()].slice(0, 3);
}

/** 3-letter month abbreviation ("okt", "avg", "sep" ...). */
export function formatMonthShort(date: Date): string {
  return MONTHS_BS[date.getMonth()].slice(0, 3);
}

const MONTHS_BS_GENITIVE = [
  "januara", "februara", "marta", "aprila", "maja", "juna",
  "jula", "avgusta", "septembra", "oktobra", "novembra", "decembra",
];

/** Genitive month for "član od {mjesec} {godina}" — nominative doesn't fit after "od". */
export function formatMonthGenitive(date: Date): string {
  return MONTHS_BS_GENITIVE[date.getMonth()];
}
