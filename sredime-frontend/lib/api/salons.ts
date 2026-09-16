import type { Salon } from "@/types/entities";
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

export async function searchSalons(opts: {
  city?: string;
  query?: string;
  category?: string;
  onlyAvailableToday?: boolean;
}): Promise<SalonListItem[]> {
  const q = (opts.query ?? "").trim().toLowerCase();
  return all().filter((s) => {
    if (opts.city && s.city !== opts.city) return false;
    if (opts.category && s.category !== opts.category) return false;
    if (opts.onlyAvailableToday && !s.nextSlotIsToday) return false;
    if (q && !s.name.toLowerCase().includes(q) && !s.city.toLowerCase().includes(q)) {
      return false;
    }
    return true;
  });
}

export async function getSalonBySlug(slug: string): Promise<SalonListItem | null> {
  return all().find((s) => s.slug === slug) ?? null;
}

export async function getCities(): Promise<string[]> {
  return Array.from(new Set(all().map((s) => s.city)));
}
