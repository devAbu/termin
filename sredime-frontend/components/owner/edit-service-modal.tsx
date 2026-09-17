"use client";

import { useState } from "react";
import { Percent, Save, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@/components/ui/icon";
import { formatPrice, getEffectivePrice } from "@/lib/format";
import type { Service } from "@/types/entities";

export function EditServiceModal({
  service,
  onClose,
  onSave,
}: {
  service: Service;
  onClose: () => void;
  onSave: (id: number, changes: Partial<Service>) => void;
}) {
  const t = useTranslations("dashboard");

  const [name, setName] = useState(service.name);
  const [price, setPrice] = useState(service.price);
  const [durationMinutes, setDurationMinutes] = useState(String(service.durationMinutes));
  const [bufferMinutes, setBufferMinutes] = useState(String(service.bufferMinutes));
  const [discountOn, setDiscountOn] = useState(service.discountPercent != null);
  const [discountPercent, setDiscountPercent] = useState(String(service.discountPercent ?? 20));
  const [error, setError] = useState<string | null>(null);

  const priceNum = Number(price);
  const discountNum = Number(discountPercent);
  const finalPrice = discountOn && priceNum > 0 && discountNum > 0 ? getEffectivePrice(priceNum, discountNum) : null;

  function handleSave() {
    if (!name.trim()) {
      setError(t("serviceNameRequiredToast"));
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setError(t("servicePriceInvalidToast"));
      return;
    }
    if (discountOn && (!Number.isFinite(discountNum) || discountNum < 1 || discountNum > 90)) {
      setError(t("discountPercentInvalidToast"));
      return;
    }
    setError(null);
    onSave(service.id, {
      name: name.trim(),
      price: priceNum.toFixed(2),
      durationMinutes: Number(durationMinutes) || service.durationMinutes,
      bufferMinutes: Number(bufferMinutes) || 0,
      discountPercent: discountOn ? discountNum : null,
    });
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[var(--overlay-scrim)] p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-[440px] flex-col gap-4 overflow-y-auto rounded-modal bg-card p-6 shadow-modal">
        <div className="flex items-start gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-xl font-bold tracking-tight text-text-primary">{t("editServiceModalTitle")}</span>
            <span className="text-sm text-text-secondary">{t("editServiceModalSub")}</span>
          </div>
          <div className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            aria-label={t("dismiss")}
            className="flex h-8 w-8 flex-none items-center justify-center rounded-control bg-surface-sunken text-icon-default"
          >
            <Icon icon={X} size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5">
            <span className="eyebrow">{t("serviceNameLabel")}</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} size="lg" />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="eyebrow">{t("servicePriceLabel")}</span>
              <Input type="number" min="0" step="0.5" value={price} onChange={(e) => setPrice(e.target.value)} size="lg" />
              {discountOn && <span className="text-xs text-text-muted">{t("discountPriceHint")}</span>}
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="eyebrow">{t("serviceDurationMinLabel")}</span>
              <Input type="number" min="5" step="5" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} size="lg" />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="eyebrow">{t("serviceBufferMinLabel")}</span>
            <Input type="number" min="0" step="5" value={bufferMinutes} onChange={(e) => setBufferMinutes(e.target.value)} size="lg" />
          </label>

          <label className="flex cursor-pointer items-center gap-2.5">
            <Checkbox checked={discountOn} onCheckedChange={setDiscountOn} />
            <span className="text-sm font-medium text-text-primary">{t("discountToggleLabel")}</span>
          </label>

          {discountOn && (
            <div className="flex flex-col gap-2.5 rounded-control bg-surface-sunken p-3.5">
              <label className="flex flex-col gap-1.5">
                <span className="eyebrow">{t("discountPercentLabel")}</span>
                <div className="relative flex items-center">
                  <Input type="number" min="1" max="90" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} size="lg" className="pr-9" />
                  <Icon icon={Percent} size={16} className="pointer-events-none absolute right-3 text-icon-muted" />
                </div>
              </label>
              {finalPrice != null && (
                <span className="flex items-center gap-2 text-sm">
                  <span className="text-text-muted">{t("discountPreviewLabel")}:</span>
                  <span className="text-text-muted line-through">{formatPrice(priceNum)}</span>
                  <span className="font-bold text-brand">{formatPrice(finalPrice)}</span>
                </span>
              )}
            </div>
          )}

          {error && <span className="text-sm text-danger-fg">{error}</span>}
        </div>

        <div className="flex gap-2.5">
          <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={onClose}>
            {t("dismiss")}
          </Button>
          <Button type="button" variant="primary" size="lg" className="flex-[1.4]" onClick={handleSave}>
            <Icon icon={Save} size={16} />
            {t("saveServiceCta")}
          </Button>
        </div>
      </div>
    </div>
  );
}
