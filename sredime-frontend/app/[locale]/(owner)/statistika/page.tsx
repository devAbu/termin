import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StatisticsContent } from "@/components/owner/statistics-content";
import { getSalonById } from "@/lib/api/salons";
import { getWorkersBySalon } from "@/lib/api/workers";
import { getSalonBookings, pickPendingBookings, CURRENT_SALON_ID } from "@/lib/api/bookings";

export const metadata: Metadata = {
  title: "Statistika | SrediMe",
};

export default async function StatisticsPage() {
  const salon = await getSalonById(CURRENT_SALON_ID);
  if (!salon) notFound();

  const [workers, bookings] = await Promise.all([getWorkersBySalon(salon.id), getSalonBookings(salon.id)]);

  return <StatisticsContent salon={salon} workers={workers} bookings={bookings} pendingCount={pickPendingBookings(bookings).length} />;
}
