import type { Salon, SalonCategory } from "@/types/entities";
import salonsFixture from "@/lib/mock-data/salons.json";

/**
 * Mock data-access layer. Every function here has the same signature/return
 * shape the real `/api/v1/saloni` endpoints will have (docs/backend.md) —
 * swapping the body for a `fetch` call is the only change needed once the
 * backend exists. Never import lib/mock-data/*.json directly from a
 * component — always go through these functions.
 */

export type SalonListItem = Salon;

function all(): SalonListItem[] {
  return salonsFixture as SalonListItem[];
}

export async function getFeaturedSalons(opts?: {
  city?: string;
  limit?: number;
}): Promise<SalonListItem[]> {
  const city = opts?.city;
  const limit = opts?.limit ?? 4;
  const list = all().filter((s) => (city ? s.city === city : true));
  return list
    .slice()
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

export type SalonSort = "recommended" | "rating" | "price";

/** "Slobodno sada" — next slot is today and starts within the next 3h (or up to 30min ago). */
function isAvailableNow(salon: SalonListItem): boolean {
  if (!salon.nextSlotIsToday) return false;
  const match = salon.nextSlotLabel.match(/(\d{1,2}):(\d{2})/);
  if (!match) return false;
  const now = new Date();
  const slot = new Date(now);
  slot.setHours(Number(match[1]), Number(match[2]), 0, 0);
  const diffMinutes = (slot.getTime() - now.getTime()) / 60_000;
  return diffMinutes >= -30 && diffMinutes <= 180;
}

export interface SalonSearchOpts {
  city?: string;
  query?: string;
  category?: SalonCategory;
  onlyAvailableToday?: boolean;
  onlyAvailableNow?: boolean;
  minRating?: number;
  maxPrice?: number;
  sort?: SalonSort;
}

/**
 * Pure, synchronous filter — used directly by the search screen (client-side
 * refiltering as the user toggles chips) and by `searchSalons` below (the
 * async wrapper mirroring the real endpoint contract).
 */
export function filterSalons(list: SalonListItem[], opts: SalonSearchOpts): SalonListItem[] {
  const q = (opts.query ?? "").trim().toLowerCase();
  let result = list.filter((s) => {
    if (opts.city && s.city !== opts.city) return false;
    if (opts.category && s.category !== opts.category) return false;
    if (opts.onlyAvailableToday && !s.nextSlotIsToday) return false;
    if (opts.onlyAvailableNow && !isAvailableNow(s)) return false;
    if (opts.minRating && s.rating < opts.minRating) return false;
    if (opts.maxPrice && Number(s.priceFrom) > opts.maxPrice) return false;
    if (
      q &&
      !s.name.toLowerCase().includes(q) &&
      !s.city.toLowerCase().includes(q) &&
      !s.description.toLowerCase().includes(q)
    ) {
      return false;
    }
    return true;
  });

  if (opts.sort === "rating") result = result.slice().sort((a, b) => b.rating - a.rating);
  if (opts.sort === "price") result = result.slice().sort((a, b) => Number(a.priceFrom) - Number(b.priceFrom));

  return result;
}

export async function searchSalons(opts: SalonSearchOpts): Promise<SalonListItem[]> {
  return filterSalons(all(), opts);
}

export async function getSalonBySlug(slug: string): Promise<SalonListItem | null> {
  return all().find((s) => s.slug === slug) ?? null;
}

export async function getSalonById(id: number): Promise<SalonListItem | null> {
  return all().find((s) => s.id === id) ?? null;
}

export async function getCities(): Promise<string[]> {
  return Array.from(new Set(all().map((s) => s.city)));
}
