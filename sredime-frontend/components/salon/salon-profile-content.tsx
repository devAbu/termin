"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  CircleCheck,
  Clock,
  CreditCard,
  Image as ImageIcon,
  MapPin,
  Share2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Navbar } from "@/components/chrome/navbar";
import { Footer } from "@/components/chrome/footer";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { FilterChip } from "@/components/discovery/filter-chip";
import { StarRating } from "@/components/discovery/star-rating";
import { ServiceRow } from "@/components/salon/service-row";
import { StaffCard } from "@/components/salon/staff-card";
import { ReviewCard } from "@/components/salon/review-card";
import { RatingSummary } from "@/components/salon/rating-summary";
import { CATEGORY_META } from "@/lib/constants/categories";
import { groupServices } from "@/lib/api/services";
import { formatPrice } from "@/lib/format";
import type { Review, Salon, Service, Worker } from "@/types/entities";

type Tab = "usluge" | "radnici" | "recenzije";
type ReviewSort = "newest" | "rating";

const GALLERY_CAPTIONS = [
  "Interijer",
  "Radni prostor",
  "Rad — boja",
  "Rad — šišanje",
  "Ulaz",
  "Detalj",
  "Recepcija",
  "Proizvodi",
  "Tim",
  "Stolica",
];

const REVIEWS_PAGE_SIZE = 3;

function PlaceholderTile({ caption, className }: { caption: string; className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1.5 rounded-card bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-400 ${className ?? ""}`}
    >
      <Icon icon={ImageIcon} size={20} />
      <span className="text-2xs font-semibold uppercase tracking-wide">{caption}</span>
    </div>
  );
}

export function SalonProfileContent({
  salon,
  workers,
  services,
  reviews,
  initialTab = "usluge",
}: {
  salon: Salon;
  workers: Worker[];
  services: Service[];
  reviews: Review[];
  initialTab?: Tab;
}) {
  const t = useTranslations("salon");
  const category = CATEGORY_META[salon.category];

  const [tab, setTab] = useState<Tab>(initialTab);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [reviewSort, setReviewSort] = useState<ReviewSort>("newest");
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const serviceGroups = useMemo(() => groupServices(services), [services]);
  const sortedReviews = useMemo(() => {
    if (reviewSort === "rating") return reviews.slice().sort((a, b) => b.rating - a.rating);
    return reviews.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reviews, reviewSort]);
  const visibleReviews = showAllReviews ? sortedReviews : sortedReviews.slice(0, REVIEWS_PAGE_SIZE);

  const bookHref = `/saloni/${salon.slug}/zakazi`;
  const bookServiceHref = (serviceId: number) => `${bookHref}?usluga=${serviceId}`;
  const bookWorkerHref = (workerId: number) => `${bookHref}?radnik=${workerId}`;

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // clipboard access can be denied by the browser — button label just won't flip
    }
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 1800);
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "usluge", label: t("tabServices") },
    { id: "radnici", label: t("tabStaff") },
    { id: "recenzije", label: t("tabReviews") },
  ];

  return (
    <div className="flex min-h-full flex-col bg-surface-canvas">
      <Navbar />

      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-6 pb-28 pt-8 md:gap-7 md:pb-12 md:pt-10">
        <Link
          href="/pretraga"
          className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-text-secondary hover:text-brand md:hidden"
        >
          <Icon icon={ArrowLeft} size={16} />
          {t("backLink")}
        </Link>

        <nav className="hidden flex-wrap items-center gap-2 text-xs text-text-secondary md:flex">
          <Link href="/" className="hover:text-brand">
            {t("crumbHome")}
          </Link>
          <Icon icon={ChevronRight} size={12} className="text-icon-muted" />
          <Link href={`/pretraga?grad=${encodeURIComponent(salon.city)}`} className="hover:text-brand">
            {salon.city}
          </Link>
          <Icon icon={ChevronRight} size={12} className="text-icon-muted" />
          <Link href={`/pretraga?kategorija=${salon.category}`} className="hover:text-brand">
            {category.pluralLabel}
          </Link>
          <Icon icon={ChevronRight} size={12} className="text-icon-muted" />
          <span className="font-medium text-text-primary">{salon.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-3 md:h-[260px] md:grid-cols-[2fr_1fr] lg:h-[320px]">
          <div className="relative h-[200px] md:h-full">
            <PlaceholderTile caption={t("galleryMainCaption")} className="h-full w-full" />
            <button
              type="button"
              onClick={() => setGalleryOpen((v) => !v)}
              className="absolute bottom-3 right-3 inline-flex h-8 items-center gap-1.5 rounded-pill bg-card px-3.5 text-xs font-medium text-text-primary shadow-card"
            >
              <Icon icon={ImageIcon} size={14} />
              {galleryOpen ? t("galleryHide") : t("galleryShowAll", { count: GALLERY_CAPTIONS.length })}
            </button>
          </div>
          <div className="hidden grid-rows-2 gap-3 md:grid">
            <PlaceholderTile caption="Interijer" />
            <PlaceholderTile caption="Rad — boja" />
          </div>
        </div>

        {galleryOpen && (
          <div className="flex flex-col gap-3 rounded-card bg-card p-5 shadow-card">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <span className="text-base font-bold text-text-primary">{t("galleryTitle")}</span>
              <span className="text-xs text-text-secondary">
                {t("galleryMax", { count: GALLERY_CAPTIONS.length })}
              </span>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2.5">
              {GALLERY_CAPTIONS.map((caption, i) => (
                <PlaceholderTile key={caption} caption={`${i + 1}. ${caption}`} className="aspect-[4/3]" />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
          <div className="flex min-w-0 flex-col gap-6 md:gap-7">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl leading-tight md:text-4xl">{salon.name}</h1>
                <span
                  className={`inline-flex h-[26px] items-center gap-1.5 rounded-pill px-3 text-2xs font-semibold ${
                    salon.nextSlotIsToday ? "bg-success-bg text-success-fg" : "bg-warning-bg text-warning-fg"
                  }`}
                >
                  <Icon icon={CircleCheck} size={13} />
                  {salon.nextSlotIsToday ? t("statusFreeToday") : t("statusBusyToday")}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                <button type="button" onClick={() => setTab("recenzije")} className="hover:text-brand">
                  <StarRating rating={salon.rating} reviewCount={salon.reviewCount} />
                </button>
                <span className="inline-flex items-center gap-1.5">
                  <Icon icon={category.icon} size={15} className="text-icon-muted" />
                  {category.label}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon icon={MapPin} size={15} className="text-icon-muted" />
                  {salon.address}
                </span>
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex h-[30px] items-center gap-1.5 rounded-control border border-border-subtle bg-card px-3 text-xs font-medium text-brand"
                >
                  <Icon icon={shareCopied ? CircleCheck : Share2} size={14} />
                  {shareCopied ? t("shareCopied") : t("share")}
                </button>
              </div>
              <p className="max-w-[620px] text-base leading-relaxed text-text-secondary">{salon.description}</p>
            </div>

            <div className="flex gap-5 overflow-x-auto shadow-inset-line">
              {tabs.map((tabDef) => (
                <button
                  key={tabDef.id}
                  type="button"
                  onClick={() => setTab(tabDef.id)}
                  className={`-mb-px whitespace-nowrap border-b-2 pb-3 text-base ${
                    tab === tabDef.id
                      ? "border-brand font-bold text-text-primary"
                      : "border-transparent font-medium text-text-secondary"
                  }`}
                >
                  {tabDef.label}
                </button>
              ))}
            </div>

            {tab === "usluge" && (
              <div className="flex flex-col gap-6">
                {serviceGroups.map((group) => (
                  <div key={group.groupLabel} className="flex flex-col gap-2">
                    <span className="eyebrow">{group.groupLabel}</span>
                    <div className="divide-y divide-border-subtle rounded-card bg-card px-4 shadow-card">
                      {group.items.map((service) => (
                        <ServiceRow
                          key={service.id}
                          service={service}
                          onBook={() => {
                            window.location.href = bookServiceHref(service.id);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                <p className="text-sm text-text-secondary">{t("servicesNote")}</p>
              </div>
            )}

            {tab === "radnici" && (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
                {workers.map((worker) => (
                  <StaffCard
                    key={worker.id}
                    worker={worker}
                    onBook={() => {
                      window.location.href = bookWorkerHref(worker.id);
                    }}
                  />
                ))}
              </div>
            )}

            {tab === "recenzije" && (
              <div className="flex flex-col gap-4">
                {reviews.length > 0 ? (
                  <>
                    <RatingSummary rating={salon.rating} reviewCount={salon.reviewCount} breakdown={salon.ratingBreakdown} />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-sm text-text-secondary">{t("reviewsHint")}</span>
                      <div className="flex gap-1.5">
                        {(["newest", "rating"] as ReviewSort[]).map((s) => (
                          <FilterChip
                            key={s}
                            active={reviewSort === s}
                            onClick={() => setReviewSort(s)}
                            className="h-[34px] px-3 text-xs"
                          >
                            {s === "newest" ? t("sortNewest") : t("sortTopRated")}
                          </FilterChip>
                        ))}
                      </div>
                    </div>
                    {visibleReviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                    {sortedReviews.length > visibleReviews.length && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="md"
                        className="self-start"
                        onClick={() => setShowAllReviews(true)}
                      >
                        {t("showMoreReviews")}
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2.5 rounded-card bg-card p-8 text-center shadow-card">
                    <span className="text-base font-bold text-text-primary">{t("noReviewsTitle")}</span>
                    <span className="max-w-[360px] text-sm text-text-secondary">{t("noReviewsBody")}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="hidden flex-col gap-4 lg:sticky lg:top-24 lg:flex">
            <div className="flex flex-col gap-4 rounded-card bg-card p-6 shadow-card">
              <div>
                <span className="eyebrow">{t("firstFreeSlot")}</span>
                <div className="mt-1 text-2xl font-bold text-text-primary">{salon.nextSlotLabel}</div>
              </div>
              <Button asChild variant="accent" size="lg">
                <Link href={bookHref}>{t("bookNow")}</Link>
              </Button>
              <span className="text-center text-xs text-text-secondary">
                {t("servicesFromCaption", { price: formatPrice(salon.priceFrom) })}
              </span>
              <div className="h-px bg-border-subtle" />
              <div className="flex flex-col gap-2">
                <span className="text-sm font-bold text-text-primary">{t("openingHoursTitle")}</span>
                {salon.openingHours.map((h, i) => (
                  <div key={h.day} className="flex justify-between gap-3 text-sm">
                    <span className={i === 0 ? "font-semibold text-text-primary" : "text-text-secondary"}>{h.day}</span>
                    <span className={h.time === null ? "text-text-muted" : "font-medium text-text-primary"}>
                      {h.time ?? t("hoursClosed")}
                    </span>
                  </div>
                ))}
              </div>
              <div className="h-px bg-border-subtle" />
              <div className="flex flex-col gap-2 text-sm text-text-secondary">
                <span className="inline-flex items-center gap-2">
                  <Icon icon={CreditCard} size={16} className="text-icon-muted" />
                  {t("paymentOnSite")}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Icon icon={CircleCheck} size={16} className="text-success-fg" />
                  {t("cancellationFree")}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-card bg-card p-4 shadow-card">
              <PlaceholderTile caption={t("locationCaption")} className="h-[120px]" />
              <span className="text-sm text-text-secondary">{salon.address}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-card bg-card p-5 shadow-card lg:hidden">
          <span className="text-sm font-bold text-text-primary">{t("openingHoursTitle")}</span>
          {salon.openingHours.map((h, i) => (
            <div key={h.day} className="flex justify-between gap-3 text-sm">
              <span className={i === 0 ? "font-semibold text-text-primary" : "text-text-secondary"}>{h.day}</span>
              <span className={h.time === null ? "text-text-muted" : "font-medium text-text-primary"}>
                {h.time ?? t("hoursClosed")}
              </span>
            </div>
          ))}
          <div className="h-px bg-border-subtle" />
          <span className="inline-flex items-center gap-2 text-sm text-text-secondary">
            <Icon icon={CircleCheck} size={16} className="text-success-fg" />
            {t("cancellationFree")}
          </span>
        </div>
      </main>

      <div className="sticky bottom-0 z-10 flex items-center gap-3 border-t border-border-subtle bg-white/86 px-4 py-3 shadow-inset-line backdrop-blur-sticky lg:hidden">
        <div className="flex min-w-0 flex-col">
          <span className="text-sm font-bold text-text-primary">
            {t("servicesFromShort", { price: formatPrice(salon.priceFrom) })}
          </span>
          <span className="text-xs text-text-secondary">{salon.nextSlotLabel}</span>
        </div>
        <Button asChild variant="accent" size="lg" className="flex-1">
          <Link href={bookHref}>
            <Icon icon={Clock} size={18} />
            {t("bookNow")}
          </Link>
        </Button>
      </div>

      <Footer />
    </div>
  );
}
