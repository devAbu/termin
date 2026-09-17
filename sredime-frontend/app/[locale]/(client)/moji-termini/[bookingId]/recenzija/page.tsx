import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReviewForm } from "@/components/client/review-form";
import { getBookingById, CURRENT_CLIENT_ID } from "@/lib/api/bookings";
import { getReviewByBookingId } from "@/lib/api/reviews";

export const metadata: Metadata = {
  title: "Recenzija | SrediMe",
};

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const booking = await getBookingById(Number(bookingId), CURRENT_CLIENT_ID);
  if (!booking) notFound();

  const existingReview = await getReviewByBookingId(booking.id);

  return <ReviewForm booking={booking} existingReview={existingReview} />;
}
