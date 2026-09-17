import { CircleCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { StarRating } from "@/components/discovery/star-rating";
import { formatRelativeDate } from "@/lib/format";
import type { Review } from "@/types/entities";

export function ReviewCard({ review }: { review: Review }) {
  const t = useTranslations("salon");

  return (
    <Card className="flex flex-col gap-2 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <StarRating rating={review.rating} />
        <span className="text-sm font-bold text-text-primary">{review.clientName}</span>
        <span className="text-xs text-text-muted">{formatRelativeDate(review.createdAt)}</span>
        <Badge variant="success">
          <Icon icon={CircleCheck} size={12} />
          {t("verifiedBadge")}
        </Badge>
      </div>
      {review.comment && <p className="text-sm leading-relaxed text-text-secondary">{review.comment}</p>}
      <span className="text-xs text-text-muted">
        {review.serviceName} · {review.workerName}
      </span>
    </Card>
  );
}
