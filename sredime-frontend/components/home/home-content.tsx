import { Zap, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Navbar } from "@/components/chrome/navbar";
import { Footer } from "@/components/chrome/footer";
import { HeroSearch } from "@/components/home/hero-search";
import { HowItWorks } from "@/components/home/how-it-works";
import { FilterChip } from "@/components/discovery/filter-chip";
import { SalonCard } from "@/components/discovery/salon-card";
import { Icon } from "@/components/ui/icon";
import { SERVICE_CHIPS } from "@/lib/constants/categories";
import type { Salon } from "@/types/entities";

/**
 * Not async — useTranslations() uses React's `use()` hook internally, which
 * can't be called from an async Server Component (see app/[locale]/page.tsx,
 * which does the async data fetching and passes the results down as props).
 */
export function HomeContent({
  cities,
  featured,
}: {
  cities: string[];
  featured: Salon[];
}) {
  const t = useTranslations("home");

  return (
    <div className="flex min-h-full flex-col bg-surface-canvas">
      <Navbar />

      <section className="flex flex-col items-center gap-7 bg-gradient-to-b from-indigo-50 to-surface-canvas px-6 py-14 text-center md:py-16">
        <div className="flex max-w-[720px] flex-col items-center gap-3">
          <span className="inline-flex h-[30px] items-center gap-2 rounded-pill bg-card px-3.5 text-2xs font-semibold uppercase tracking-wide text-brand shadow-card">
            <Icon icon={Zap} size={14} />
            {t("eyebrow")}
          </span>
          <h1 className="text-4xl leading-tight md:text-5xl">{t("title")}</h1>
          <p className="max-w-[560px] text-base leading-relaxed text-text-secondary md:text-lg">
            {t("lead")}
          </p>
        </div>

        <HeroSearch cities={cities} />

        <div className="flex flex-wrap justify-center gap-2">
          {SERVICE_CHIPS.map((chip) => (
            <FilterChip
              key={chip.label}
              href={`/pretraga?q=${encodeURIComponent(chip.label)}`}
              icon={<Icon icon={chip.icon} size={16} />}
            >
              {chip.label}
            </FilterChip>
          ))}
        </div>
      </section>

      <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-12 px-6 py-12 md:gap-14">
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="eyebrow">{t("popularEyebrow", { city: "Sarajevu" })}</span>
              <h2 className="text-xl md:text-2xl">{t("popularTitle")}</h2>
            </div>
            <Link href="/pretraga" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand">
              {t("allSalons")}
              <Icon icon={ArrowRight} size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((salon) => (
              <SalonCard key={salon.id} salon={salon} />
            ))}
          </div>
        </section>

        <HowItWorks />
      </main>

      <Footer />
    </div>
  );
}
