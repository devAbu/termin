import type { FavoriteServiceWorker } from "@/types/entities";
import type { BookingDetails } from "@/lib/api/bookings";
import favoritesFixture from "@/lib/mock-data/favorites.json";

/** Mock data-access layer — see lib/api/salons.ts for the swap-to-real-API convention. */

function all(): FavoriteServiceWorker[] {
  return favoritesFixture as FavoriteServiceWorker[];
}

export async function getFavoritesForClientSalon(clientId: number, salonId: number): Promise<FavoriteServiceWorker[]> {
  return all().filter((f) => f.clientId === clientId && f.salonId === salonId);
}

/** Booking wizard step 2, state 3 — favorite set for this client+salon+service (docs/frontend.md). */
export function pickFavoriteWorkerId(favorites: FavoriteServiceWorker[], serviceId: number): number | null {
  return favorites.find((f) => f.serviceId === serviceId)?.workerId ?? null;
}

/**
 * Booking wizard step 2, state 2 — no favorite, but the client has booked this exact service at
 * this salon before: soft-preselect whichever worker did the most recent one. `bookings` should
 * already be scoped to this client+salon (docs/database.md: derived from Booking, no extra table).
 */
export function pickLastUsedWorkerId(bookings: BookingDetails[], serviceId: number): number | null {
  const matches = bookings
    .filter((b) => b.service.id === serviceId)
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  return matches[0]?.worker.id ?? null;
}

/**
 * Worker to pre-select once a service is picked: the favorite for that service, else the last-used
 * one — but only if that worker is still eligible (assigned to the service). `null` = nothing preselected.
 */
export function pickPreselectedWorkerId(
  favorites: FavoriteServiceWorker[],
  bookings: BookingDetails[],
  serviceId: number,
  eligibleWorkerIds: number[],
): number | null {
  const favorite = pickFavoriteWorkerId(favorites, serviceId);
  if (favorite != null && eligibleWorkerIds.includes(favorite)) return favorite;
  const lastUsed = pickLastUsedWorkerId(bookings, serviceId);
  if (lastUsed != null && eligibleWorkerIds.includes(lastUsed)) return lastUsed;
  return null;
}
