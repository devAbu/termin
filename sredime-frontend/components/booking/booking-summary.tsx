import { CalendarCheck, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { formatPrice } from "@/lib/format";
import type { Salon } from "@/types/entities";
import type { RecapRow } from "./wizard-types";

/** Desktop sticky sidebar ("Tvoja rezervacija") with the running recap and total. */
export function BookingSummary({
  salon,
  recap,
  timeSelected,
  total,
}: {
  salon: Salon;
  recap: RecapRow[];
  timeSelected: boolean;
  total: number;
}) {
  const t = useTranslations("booking");

  return (
    <div className="hidden flex-col gap-3 rounded-card bg-card p-6 shadow-card lg:sticky lg:top-24 lg:flex">
      <span className="eyebrow">{t("yourBooking")}</span>
      <span className="text-lg font-bold text-text-primary">{salon.name}</span>
      <span className="text-xs text-text-secondary">{salon.address}</span>
      <div className="h-px bg-border-subtle" />
      {recap.map((r) => (
        <div key={r.key} className="flex items-start gap-2.5 text-sm">
          <Icon icon={r.icon} size={16} className="mt-0.5 flex-none text-icon-muted" />
          <span className={r.key === "time" && !timeSelected ? "text-text-secondary" : "text-text-primary"}>{r.value}</span>
        </div>
      ))}
      <div className="h-px bg-border-subtle" />
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-text-secondary">{t("total")}</span>
        <span className="text-2xl font-bold text-text-primary">{formatPrice(total)}</span>
      </div>
      <span className="text-xs text-text-secondary">{t("paymentCancelNote")}</span>
    </div>
  );
}

/** Mobile sticky bottom bar: running total + one-line summary + Next/Confirm. */
export function MobileBookingBar({
  total,
  line,
  isLastStep,
  canNext,
  onNext,
}: {
  total: number;
  line: string;
  isLastStep: boolean;
  canNext: boolean;
  onNext: () => void;
}) {
  const t = useTranslations("booking");

  return (
    <div className="sticky bottom-0 z-10 flex items-center gap-3 border-t border-border-subtle bg-white/86 px-4 py-3 shadow-inset-line backdrop-blur-sticky md:hidden">
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-lg font-bold leading-tight text-text-primary">{formatPrice(total)}</span>
        <span className="truncate text-xs text-text-secondary">{line}</span>
      </div>
      <Button type="button" variant="accent" size="lg" disabled={!canNext} onClick={onNext} className="flex-none">
        {isLastStep ? t("confirm") : t("next")}
        <Icon icon={isLastStep ? CalendarCheck : ArrowRight} size={18} />
      </Button>
    </div>
  );
}
