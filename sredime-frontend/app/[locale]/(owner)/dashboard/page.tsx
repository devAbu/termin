import type { Metadata } from "next";
import { DashboardContent } from "@/components/owner/dashboard-content";
import type { Page, Role } from "@/types/dashboard";
import { getSalonById } from "@/lib/api/salons";
import { getWorkersBySalon } from "@/lib/api/workers";
import { getServicesBySalon } from "@/lib/api/services";
import { getSalonBookings, CURRENT_SALON_ID } from "@/lib/api/bookings";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Salon dashboard | SrediMe",
};

const VALID_TABS: Page[] = ["kalendar", "zahtjevi", "klijenti", "usluge", "radnici", "vrijeme", "statistika"];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; role?: string }>;
}) {
  const { tab, role } = await searchParams;
  const salon = await getSalonById(CURRENT_SALON_ID);
  if (!salon) notFound();

  const [workers, services, bookings] = await Promise.all([
    getWorkersBySalon(salon.id),
    getServicesBySalon(salon.id),
    getSalonBookings(salon.id),
  ]);

  const initialPage = VALID_TABS.includes(tab as Page) ? (tab as Page) : "kalendar";
  const initialRole: Role = role === "worker" ? "worker" : "owner";

  return (
    <DashboardContent
      salon={salon}
      workers={workers}
      services={services}
      bookings={bookings}
      initialPage={initialPage}
      initialRole={initialRole}
    />
  );
}
