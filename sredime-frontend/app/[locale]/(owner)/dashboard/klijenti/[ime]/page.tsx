import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClientHistoryContent } from "@/components/owner/client-history-content";
import { getSalonById } from "@/lib/api/salons";
import { getWorkersBySalon } from "@/lib/api/workers";
import { getServicesBySalon } from "@/lib/api/services";
import { getSalonBookings, getClientBookingsForSalon, pickPendingBookings, CURRENT_SALON_ID } from "@/lib/api/bookings";
import { getClientNotes } from "@/lib/api/client-notes";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ime: string }>;
}): Promise<Metadata> {
  const { ime } = await params;
  return { title: `${decodeURIComponent(ime)} | SrediMe` };
}

export default async function ClientHistoryPage({
  params,
}: {
  params: Promise<{ ime: string }>;
}) {
  const { ime } = await params;
  const clientName = decodeURIComponent(ime);

  const salon = await getSalonById(CURRENT_SALON_ID);
  if (!salon) notFound();

  const [workers, services, allSalonBookings, notes] = await Promise.all([
    getWorkersBySalon(salon.id),
    getServicesBySalon(salon.id),
    getSalonBookings(salon.id),
    getClientNotes(salon.id, clientName),
  ]);

  const clientBookings = getClientBookingsForSalon(allSalonBookings, clientName);
  if (clientBookings.length === 0) notFound();

  return (
    <ClientHistoryContent
      salon={salon}
      workers={workers}
      services={services}
      clientName={clientName}
      clientPhone={clientBookings[0].clientPhone}
      bookings={clientBookings}
      allSalonBookings={allSalonBookings}
      initialNotes={notes}
      pendingCount={pickPendingBookings(allSalonBookings).length}
    />
  );
}
