"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function HeroSearch({ cities }: { cities: string[] }) {
  const t = useTranslations("home");
  const router = useRouter();
  const [city, setCity] = useState(cities[0] ?? "");
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("grad", city);
    if (query) params.set("q", query);
    router.push(`/pretraga?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid w-full max-w-[900px] grid-cols-1 items-end gap-3 rounded-card bg-card p-4 text-left shadow-card md:grid-cols-[200px_minmax(0,1fr)_auto] md:p-5"
    >
      <label className="flex min-w-0 flex-col gap-2">
        <span className="text-sm font-medium text-text-primary">{t("cityLabel")}</span>
        <Select size="lg" value={city} onChange={(e) => setCity(e.target.value)}>
          {cities.map((c) => (
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
      <Button type="submit" variant="accent" size="lg">
        <Icon icon={Search} size={18} />
        {t("searchCta")}
      </Button>
    </form>
  );
}
