import { CircleCheck, Calendar, MapPin, Image as ImageIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { StarRating } from "@/components/discovery/star-rating";
import { Icon } from "@/components/ui/icon";
import { CATEGORY_META } from "@/lib/constants/categories";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import type { Salon } from "@/types/entities";

export function SalonCard({ salon }: { salon: Salon }) {
  const t = useTranslations("home");
  const category = CATEGORY_META[salon.category];

  return (
    <Link href={`/saloni/${salon.slug}`} className="block">
      <Card interactive className="flex h-full flex-col overflow-hidden">
        <div className="relative flex aspect-[16/10] flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-400">
          <Icon icon={ImageIcon} size={22} />
          <span className="text-2xs font-medium">{salon.photoCaption}</span>
          <span
            className={cn(
              "absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-2xs font-semibold",
              salon.nextSlotIsToday
                ? "bg-success-bg text-success-fg"
                : "bg-card text-text-secondary",
            )}
          >
            <Icon icon={salon.nextSlotIsToday ? CircleCheck : Calendar} size={13} />
            {salon.nextSlotIsToday ? t("slotToday") : t("slotTomorrow")}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2.5 p-4">
          <div className="flex flex-col gap-1">
            <span className="text-lg font-bold tracking-[-0.01em] text-text-primary">
              {salon.name}
            </span>
            <StarRating rating={salon.rating} reviewCount={salon.reviewCount} />
          </div>
          <div className="flex flex-col gap-1.5 text-sm text-text-secondary">
            <span className="inline-flex items-center gap-1.5">
              <Icon icon={category.icon} size={14} className="shrink-0 text-icon-muted" />
              {category.label}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon icon={MapPin} size={14} className="shrink-0 text-icon-muted" />
              {salon.address}
            </span>
          </div>
          <div className="flex-1" />
          <div className="h-px bg-border-subtle" />
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-2xs text-text-muted">{t("servicesFrom")}</span>
              <span className="price text-lg">{formatPrice(salon.priceFrom)}</span>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-right text-sm font-medium",
                salon.nextSlotIsToday ? "text-success-fg" : "text-text-secondary",
              )}
            >
              <Icon icon={Calendar} size={15} />
              {salon.nextSlotLabel}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
