import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { getSalonBySlug } from "@/lib/api/salons";
import { getWorkersBySalon } from "@/lib/api/workers";
import { getServicesBySalon } from "@/lib/api/services";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const salon = await getSalonBySlug(slug);
  if (!salon) return {};
  return { title: `Zakaži termin — ${salon.name} | SrediMe` };
}

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ usluga?: string; radnik?: string }>;
}) {
  const { slug } = await params;
  const { usluga, radnik } = await searchParams;
  const salon = await getSalonBySlug(slug);
  if (!salon) notFound();

  const [workers, services] = await Promise.all([
    getWorkersBySalon(salon.id),
    getServicesBySalon(salon.id),
  ]);

  const initialServiceId = usluga ? services.find((s) => s.id === Number(usluga))?.id : undefined;
  const initialWorkerId = radnik ? workers.find((w) => w.id === Number(radnik))?.id : undefined;

  return (
    <BookingWizard
      salon={salon}
      services={services}
      workers={workers}
      initialServiceId={initialServiceId}
      initialWorkerId={initialWorkerId}
    />
  );
}
