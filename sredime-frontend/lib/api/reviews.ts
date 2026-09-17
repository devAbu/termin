import type { Review } from "@/types/entities";
import reviewsFixture from "@/lib/mock-data/reviews.json";

/** Mock data-access layer — see lib/api/salons.ts for the swap-to-real-API convention. */

export type ReviewSort = "newest" | "rating";

function all(): Review[] {
  return reviewsFixture as Review[];
}

export async function getReviewsBySalon(salonId: number, sort: ReviewSort = "newest"): Promise<Review[]> {
  const list = all().filter((r) => r.salonId === salonId);
  if (sort === "rating") return list.slice().sort((a, b) => b.rating - a.rating);
  return list.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getReviewedBookingIds(): Promise<Set<number>> {
  return new Set(all().map((r) => r.bookingId));
}

export async function getReviewByBookingId(bookingId: number): Promise<Review | null> {
  return all().find((r) => r.bookingId === bookingId) ?? null;
}
