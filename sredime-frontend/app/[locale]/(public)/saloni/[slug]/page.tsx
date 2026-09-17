import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SalonProfileContent } from "@/components/salon/salon-profile-content";
import { getSalonBySlug } from "@/lib/api/salons";
import { getWorkersBySalon } from "@/lib/api/workers";
import { getServicesBySalon } from "@/lib/api/services";
import { getReviewsBySalon } from "@/lib/api/reviews";
import { CATEGORY_META } from "@/lib/constants/categories";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const salon = await getSalonBySlug(slug);
  if (!salon) return {};

  const categoryLabel = CATEGORY_META[salon.category].label.toLowerCase();
  const title = `${salon.name} — ${categoryLabel}, ${salon.address} | SrediMe`;
  const description = `Zakaži termin u ${salon.name}, ${salon.city}. Cjenovnik, radno vrijeme i slobodni termini. Ocjena ${salon.rating.toFixed(1).replace(".", ",")} (${salon.reviewCount} recenzija).`;

  return { title, description };
}

export default async function SalonProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { slug } = await params;
  const { tab } = await searchParams;
  const salon = await getSalonBySlug(slug);
  if (!salon) notFound();

  const [workers, services, reviews] = await Promise.all([
    getWorkersBySalon(salon.id),
    getServicesBySalon(salon.id),
    getReviewsBySalon(salon.id),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    name: salon.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: salon.address,
      addressLocality: salon.city,
      addressCountry: salon.countryCode,
    },
    aggregateRating:
      salon.reviewCount > 0
        ? { "@type": "AggregateRating", ratingValue: salon.rating, reviewCount: salon.reviewCount }
        : undefined,
    openingHoursSpecification: salon.openingHours
      .filter((h) => h.time !== "Zatvoreno")
      .map((h) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: h.day, description: h.time })),
    makesOffer: services.map((s) => ({
      "@type": "Offer",
      name: s.name,
      price: s.price,
      priceCurrency: s.currency,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SalonProfileContent
        salon={salon}
        workers={workers}
        services={services}
        reviews={reviews}
        initialTab={tab === "radnici" || tab === "recenzije" ? tab : "usluge"}
      />
    </>
  );
}
