import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  reviewCount,
  className,
}: {
  rating: number;
  reviewCount?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm text-text-secondary", className)}>
      <span className="inline-flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={13}
            className={rating >= i - 0.4 ? "fill-gold-400 text-gold-400" : "fill-indigo-200 text-indigo-200"}
          />
        ))}
      </span>
      <span className="font-bold text-text-primary">
        {rating.toFixed(1).replace(".", ",")}
      </span>
      {reviewCount != null && <span>({reviewCount})</span>}
    </span>
  );
}
