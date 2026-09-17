import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import type { Service } from "@/types/entities";

export function ServiceRow({ service, onBook }: { service: Service; onBook: () => void }) {
  const t = useTranslations("salon");
  const oldPrice = service.discountPercent
    ? Number(service.price) / (1 - service.discountPercent / 100)
    : null;

  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="font-bold text-text-primary">{service.name}</span>
        <span className="text-sm text-text-secondary">{service.durationMinutes} min</span>
      </div>
      <div className="flex flex-none items-center gap-3">
        <div className="flex flex-col items-end">
          {oldPrice && (
            <span className="text-xs text-text-muted line-through">{formatPrice(oldPrice)}</span>
          )}
          <span className="price text-base">{formatPrice(service.price)}</span>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={onBook}>
          {t("bookCta")}
        </Button>
      </div>
    </div>
  );
}
