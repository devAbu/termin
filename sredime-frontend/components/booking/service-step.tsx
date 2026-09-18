import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { formatPrice, getEffectivePrice } from "@/lib/format";
import type { Service } from "@/types/entities";

export function ServiceStep({
  services,
  serviceId,
  onPick,
}: {
  services: Service[];
  serviceId: number | null;
  onPick: (id: number) => void;
}) {
  const t = useTranslations("booking");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-text-primary md:text-2xl">{t("serviceTitle")}</h2>
        <p className="mt-1.5 text-sm text-text-secondary">{t("serviceLead")}</p>
      </div>
      <div className="flex flex-col gap-1 rounded-card bg-card p-2 shadow-card">
        {services.map((s) => {
          const selected = s.id === serviceId;
          const finalPrice = getEffectivePrice(s.price, s.discountPercent);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onPick(s.id)}
              className={cn(
                "flex items-center justify-between gap-4 rounded-control p-3.5 text-left transition-colors",
                selected ? "bg-brand-subtle" : "hover:bg-surface-sunken",
              )}
            >
              <div className="flex min-w-0 flex-col gap-1">
                <span className="font-bold text-text-primary">{s.name}</span>
                <span className="text-sm text-text-secondary">{s.durationMinutes} min</span>
              </div>
              <div className="flex flex-none items-center gap-3">
                <div className="flex flex-col items-end">
                  {s.discountPercent != null && <span className="text-xs text-text-muted line-through">{formatPrice(s.price)}</span>}
                  <span className="price text-base">{formatPrice(finalPrice)}</span>
                </div>
                <span
                  className={cn(
                    "inline-flex h-9 items-center rounded-control px-3.5 text-sm font-medium",
                    selected ? "bg-brand text-primary-foreground" : "border border-border-subtle bg-card text-brand",
                  )}
                >
                  {selected ? t("serviceSelected") : t("serviceSelect")}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
