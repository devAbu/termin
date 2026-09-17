import type { Metadata } from "next";
import { MyBookingsContent } from "@/components/client/my-bookings-content";
import { getUpcomingBookings, getBookingHistory, CURRENT_CLIENT_ID } from "@/lib/api/bookings";
import { getReviewedBookingIds } from "@/lib/api/reviews";

export const metadata: Metadata = {
  title: "Moji termini | SrediMe",
};

export default async function MyBookingsPage() {
  const [upcoming, history, reviewedBookingIds] = await Promise.all([
    getUpcomingBookings(CURRENT_CLIENT_ID),
    getBookingHistory(CURRENT_CLIENT_ID),
    getReviewedBookingIds(),
  ]);

  return (
    <MyBookingsContent upcoming={upcoming} history={history} reviewedBookingIds={Array.from(reviewedBookingIds)} />
  );
}
