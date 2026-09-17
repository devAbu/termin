"use client";

import { useMemo, useState } from "react";
import { Search, Sparkles, SearchX } from "lucide-react";
import { useTranslations } from "next-intl";
import { Navbar } from "@/components/chrome/navbar";
import { Footer } from "@/components/chrome/footer";
import { FilterChip } from "@/components/discovery/filter-chip";
import { SalonCard } from "@/components/discovery/salon-card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { CATEGORY_META, CITIES } from "@/lib/constants/categories";
import { filterSalons, type SalonSort } from "@/lib/api/salons";
import type { Salon, SalonCategory } from "@/types/entities";

const PAGE_SIZE = 6;

const CATEGORY_OPTIONS: { id: SalonCategory | "sve"; icon: typeof Sparkles }[] = [
  { id: "sve", icon: Sparkles },
  ...(Object.keys(CATEGORY_META) as SalonCategory[]).map((id) => ({
    id,
    icon: CATEGORY_META[id].icon,
  })),
];

export function SearchContent({
  salons,
  initialCity,
  initialQuery,
  initialCategory,
}: {
  salons: Salon[];
  initialCity: string;
  initialQuery: string;
  initialCategory?: string;
}) {
  const t = useTranslations("search");

  const [city, setCity] = useState(initialCity);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<SalonCategory | "sve">(
    initialCategory && initialCategory in CATEGORY_META ? (initialCategory as SalonCategory) : "sve",
  );
  const [today, setToday] = useState(false);
  const [now, setNow] = useState(false);
  const [topRated, setTopRated] = useState(false);
  const [cheap, setCheap] = useState(false);
  const [sort, setSort] = useState<SalonSort>("recommended");
  const [showAll, setShowAll] = useState(false);

  const filterKey = `${city}|${query}|${category}|${today}|${now}|${topRated}|${cheap}|${sort}`;
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  if (filterKey !== lastFilterKey) {
    setLastFilterKey(filterKey);
    setShowAll(false);
  }

  const results = useMemo(
    () =>
      filterSalons(salons, {
        city: city || undefined,
        query,
        category: category === "sve" ? undefined : category,
        onlyAvailableToday: today || undefined,
        onlyAvailableNow: now || undefined,
        minRating: topRated ? 4.5 : undefined,
        maxPrice: cheap ? 20 : undefined,
        sort,
      }),
    [salons, city, query, category, today, now, topRated, cheap, sort],
  );

  const anyFilterActive = category !== "sve" || today || now || topRated || cheap || query.trim() !== "";

  function clearFilters() {
    setCategory("sve");
    setToday(false);
    setNow(false);
    setTopRated(false);
    setCheap(false);
    setQuery("");
  }

  const visible = showAll ? results : results.slice(0, PAGE_SIZE);
  const cityLabel = city || t("allCitiesLower");
  const resultLabel =
    results.length === 0
      ? t("noResults")
      : `${results.length} ${results.length === 1 ? t("resultsSalon") : t("resultsSalonPlural")} · ${cityLabel}`;

  const filterDefs = [
    { key: "today" as const, label: t("filterToday"), on: today, toggle: () => setToday((v) => !v) },
    { key: "now" as const, label: t("filterNow"), on: now, toggle: () => setNow((v) => !v) },
    { key: "topRated" as const, label: t("filterTopRated"), on: topRated, toggle: () => setTopRated((v) => !v) },
    { key: "cheap" as const, label: t("filterCheap"), on: cheap, toggle: () => setCheap((v) => !v) },
  ];

  const sortDefs: { id: SalonSort; label: string }[] = [
    { id: "recommended", label: t("sortRecommended") },
    { id: "rating", label: t("sortRating") },
    { id: "price", label: t("sortPrice") },
  ];

  return (
    <div className="flex min-h-full flex-col bg-surface-canvas">
      <Navbar />

      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-6 py-10 md:gap-7 md:py-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl leading-tight md:text-4xl">{t("title")}</h1>
          <p className="max-w-[560px] text-base text-text-secondary md:text-lg">{t("lead")}</p>
        </div>

        <div className="grid grid-cols-1 items-end gap-3 rounded-card bg-card p-4 shadow-card md:grid-cols-[200px_minmax(0,1fr)_auto] md:p-5">
          <label className="flex min-w-0 flex-col gap-2">
            <span className="text-sm font-medium text-text-primary">{t("cityLabel")}</span>
            <Select size="lg" value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">{t("allCities")}</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </label>
          <label className="flex min-w-0 flex-col gap-2">
            <span className="text-sm font-medium text-text-primary">{t("queryLabel")}</span>
            <span className="relative flex items-center">
              <Icon icon={Search} size={18} className="pointer-events-none absolute left-3 text-icon-muted" />
              <Input
                size="lg"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("queryPlaceholder")}
                className="pl-[38px]"
              />
            </span>
          </label>
          <Button type="button" variant="accent" size="lg" onClick={() => setShowAll(false)}>
            <Icon icon={Search} size={18} />
            {t("searchCta")}
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {CATEGORY_OPTIONS.map((opt) => (
            <FilterChip
              key={opt.id}
              icon={<Icon icon={opt.icon} size={16} />}
              active={category === opt.id}
              onClick={() => setCategory(opt.id)}
              className="flex-none"
            >
              {opt.id === "sve" ? t("allCategories") : CATEGORY_META[opt.id].label}
            </FilterChip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filterDefs.map((f) => (
            <FilterChip key={f.key} active={f.on} onClick={f.toggle} className="flex-none">
              {f.label}
            </FilterChip>
          ))}
          {anyFilterActive && (
            <button
              type="button"
              onClick={clearFilters}
              className="h-[34px] rounded-pill px-3 text-xs font-medium text-brand underline"
            >
              {t("clearFilters")}
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <span className="text-base font-bold text-text-primary">{resultLabel}</span>
          <div className="flex gap-1.5">
            {sortDefs.map((s) => (
              <FilterChip key={s.id} active={sort === s.id} onClick={() => setSort(s.id)} className="h-8 flex-none px-3.5 text-xs">
                {s.label}
              </FilterChip>
            ))}
          </div>
        </div>

        {results.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-card bg-card p-10 text-center shadow-card">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-sunken text-icon-muted">
              <Icon icon={SearchX} size={22} />
            </span>
            <span className="text-base font-bold text-text-primary">{t("emptyTitle")}</span>
            <span className="max-w-[360px] text-sm text-text-secondary">{t("emptyBody")}</span>
            <Button type="button" variant="secondary" size="md" onClick={clearFilters}>
              {t("clearFilters")}
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 md:gap-5">
              {visible.map((salon) => (
                <SalonCard key={salon.id} salon={salon} />
              ))}
            </div>
            <div className="flex flex-col items-center gap-2 py-2">
              {results.length > visible.length && (
                <Button type="button" variant="secondary" size="md" onClick={() => setShowAll(true)}>
                  {t("showMore")}
                </Button>
              )}
              <span className="text-xs text-text-muted">{t("comingSoonNote")}</span>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
