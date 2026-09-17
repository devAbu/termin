import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { StarRating } from "@/components/discovery/star-rating";

function reviewsWord(count: number, t: (key: string) => string) {
  if (count === 1) return t("reviewsOne");
  if (count >= 2 && count <= 4) return t("reviewsFew");
  return t("reviewsMany");
}

export function RatingSummary({
  rating,
  reviewCount,
  breakdown,
}: {
  rating: number;
  reviewCount: number;
  breakdown: number[];
}) {
  const t = useTranslations("salon");
  const total = breakdown.reduce((sum, n) => sum + n, 0) || 1;
  const rows = [5, 4, 3, 2, 1].map((star) => ({ star, count: breakdown[star - 1] }));

  return (
    <Card className="grid grid-cols-1 items-center gap-5 p-5 md:grid-cols-[auto_minmax(0,1fr)]">
      <div className="flex flex-col gap-1">
        <span className="text-4xl font-bold tracking-tight text-text-primary">
          {rating.toFixed(1).replace(".", ",")}
        </span>
        <StarRating rating={rating} showValue={false} />
        <span className="text-xs text-text-secondary">
          {reviewCount} {reviewsWord(reviewCount, t)}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {rows.map((row) => (
          <div key={row.star} className="flex items-center gap-2.5">
            <span className="w-3 text-right text-xs text-text-secondary">{row.star}</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunken">
              <span
                className="block h-full rounded-full"
                style={{
                  width: `${Math.round((row.count / total) * 100)}%`,
                  background: row.star === 5 ? "var(--accent)" : "var(--indigo-200)",
                }}
              />
            </span>
            <span className="w-8 text-right text-xs text-text-muted">{row.count}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
