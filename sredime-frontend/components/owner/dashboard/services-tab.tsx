import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { formatPrice, getEffectivePrice } from "@/lib/format";
import type { Service } from "@/types/entities";

/** "Usluge" tab: price list with discounts; the owner can edit a service. */
export function ServicesTab({
  services,
  isOwner,
  onEdit,
}: {
  services: Service[];
  isOwner: boolean;
  onEdit: (service: Service) => void;
}) {
  const t = useTranslations("dashboard");

  return (
    <div className="flex flex-col divide-y divide-border-subtle rounded-card bg-card shadow-card">
      {services.map((s) => (
        <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex flex-col gap-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-text-primary">{s.name}</span>
              {s.discountPercent != null && <Badge variant="warning">{t("discountBadge", { percent: s.discountPercent })}</Badge>}
            </div>
            <span className="text-sm text-text-secondary">
              {t("durationLabel", { dur: s.durationMinutes })} · {t("bufferLabel", { buffer: s.bufferMinutes })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              {s.discountPercent != null && <span className="text-xs text-text-muted line-through">{formatPrice(s.price)}</span>}
              <span className="price text-base">{formatPrice(getEffectivePrice(s.price, s.discountPercent))}</span>
            </div>
            {isOwner && (
              <Button type="button" variant="secondary" size="sm" onClick={() => onEdit(s)}>
                <Icon icon={Pencil} size={13} />
                {t("editService")}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
