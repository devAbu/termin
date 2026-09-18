"use client";

import { useState } from "react";
import { ArrowLeft, Calendar, Check, Scissors, Star, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Navbar } from "@/components/chrome/navbar";
import { Footer } from "@/components/chrome/footer";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { StarRating } from "@/components/discovery/star-rating";
import { cn } from "@/lib/utils";
import { formatMonthShort } from "@/lib/format";
import type { BookingDetails } from "@/lib/api/bookings";
import type { Review } from "@/types/entities";

const RATING_KEYS = ["rating1", "rating2", "rating3", "rating4", "rating5"] as const;
const MAX_COMMENT = 500;

export function ReviewForm({
  booking,
  existingReview,
}: {
  booking: BookingDetails;
  existingReview: Review | null;
}) {
  const t = useTranslations("review");
  const tStatus = useTranslations("bookingStatus");
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [stage, setStage] = useState<"form" | "done">("form");

  const notCompleted = booking.status !== "completed";
  const alreadyReviewed = !notCompleted && existingReview != null;
  const blocked = notCompleted || alreadyReviewed;
  const shown = hover || rating;
  const scheduled = new Date(booking.scheduledAt);
  const when = `${scheduled.getDate()}. ${formatMonthShort(scheduled)} ${scheduled.getFullYear()}, ${String(scheduled.getHours()).padStart(2, "0")}:${String(scheduled.getMinutes()).padStart(2, "0")}`;

  function submit() {
    if (rating === 0) return;
    setStage("done");
  }

  return (
    <div className="flex min-h-full flex-col bg-surface-canvas">
      <Navbar />

      <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-5 px-6 py-8 md:py-10">
        <Link
          href="/moji-termini"
          className="inline-flex items-center gap-2 self-start text-sm font-medium text-text-secondary hover:text-brand"
        >
          <Icon icon={ArrowLeft} size={16} />
          {t("backLink")}
        </Link>

        <div className="flex flex-col gap-1">
          <span className="eyebrow">{t("eyebrow")}</span>
          <h1 className="text-xl font-bold tracking-tight text-text-primary md:text-2xl">
            {booking.service.name} — {booking.salon.name}
          </h1>
          <p className="text-sm leading-relaxed text-text-secondary">{t("lead")}</p>
        </div>

        <div className="flex flex-col gap-4 rounded-card bg-card p-5 shadow-card md:p-6">
          <div className="flex items-center gap-3.5 rounded-control bg-surface-sunken p-3.5">
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-control bg-brand-subtle text-brand">
              <Icon icon={Scissors} size={20} />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-base font-semibold text-text-primary">{booking.service.name}</span>
              <span className="text-sm text-text-secondary">
                {booking.salon.name} · {booking.worker.name}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                <Icon icon={Calendar} size={13} className="text-icon-muted" />
                {when} · {tStatus(booking.status).toLowerCase()}
              </span>
            </div>
          </div>

          {alreadyReviewed && existingReview ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 rounded-control bg-warning-bg p-4">
                <Icon icon={TriangleAlert} size={20} className="mt-0.5 flex-none text-warning-fg" />
                <div className="flex flex-col gap-1">
                  <span className="text-base font-bold text-warning-fg">{t("alreadyReviewedTitle")}</span>
                  <span className="text-sm leading-relaxed text-text-secondary">{t("alreadyReviewedBody")}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 rounded-control bg-surface-sunken p-3.5">
                <StarRating rating={existingReview.rating} showValue={false} />
                {existingReview.comment && (
                  <span className="text-sm leading-relaxed text-text-secondary">{existingReview.comment}</span>
                )}
              </div>
              <Button asChild variant="secondary" size="lg">
                <Link href="/moji-termini">{t("understood")}</Link>
              </Button>
            </div>
          ) : notCompleted ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 rounded-control bg-warning-bg p-4">
                <Icon icon={TriangleAlert} size={20} className="mt-0.5 flex-none text-warning-fg" />
                <div className="flex flex-col gap-1">
                  <span className="text-base font-bold text-warning-fg">{t("blockedTitle")}</span>
                  <span className="text-sm leading-relaxed text-text-secondary">{t("blockedBody")}</span>
                </div>
              </div>
              <Button asChild variant="secondary" size="lg">
                <Link href="/moji-termini">{t("understood")}</Link>
              </Button>
            </div>
          ) : stage === "form" ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="eyebrow">{t("ratingSectionLabel")}</span>
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex gap-1.5" onMouseLeave={() => setHover(0)}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Ocjena ${i}`}
                        onClick={() => setRating(i)}
                        onMouseEnter={() => setHover(i)}
                        className="flex h-10 w-10 items-center justify-center rounded-control transition-transform active:scale-90"
                      >
                        <Icon
                          icon={Star}
                          size={30}
                          className={shown >= i ? "fill-gold-400 text-gold-400" : "fill-indigo-200 text-indigo-200"}
                        />
                      </button>
                    ))}
                  </div>
                  <span className={cn("text-sm font-medium", shown ? "text-text-primary" : "text-text-muted")}>
                    {shown ? t(RATING_KEYS[shown - 1]) : t("ratingPlaceholder")}
                  </span>
                </div>
              </div>

              <label className="flex flex-col gap-2">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="eyebrow">{t("commentLabel")}</span>
                  <span className="text-xs text-text-muted">{t("charCount", { count: comment.length })}</span>
                </span>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT))}
                  rows={4}
                  placeholder={t("commentPlaceholder")}
                  className="w-full resize-y rounded-control border border-border-subtle bg-card p-3 text-base leading-relaxed text-text-primary focus-visible:border-border-brand focus-visible:shadow-focus focus-visible:outline-none"
                />
              </label>

              <div className="flex items-start gap-2.5 rounded-control bg-surface-sunken p-3.5">
                <Icon icon={TriangleAlert} size={16} className="mt-0.5 flex-none text-icon-muted" />
                <span className="text-xs leading-relaxed text-text-secondary">{t("privacyNote")}</span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <Button asChild variant="secondary" size="lg" className="flex-1">
                  <Link href="/moji-termini">{t("notNow")}</Link>
                </Button>
                <Button type="button" variant="primary" size="lg" className="flex-[1.4]" disabled={rating === 0} onClick={submit}>
                  {t("submit")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-center gap-2.5 py-1 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success-bg text-success-fg">
                  <Icon icon={Check} size={26} />
                </span>
                <span className="text-xl font-bold tracking-tight text-text-primary">{t("doneTitle")}</span>
                <span className="max-w-[340px] text-sm leading-relaxed text-text-secondary">
                  {t("doneBody", { salon: booking.salon.name })}
                </span>
              </div>
              <div className="flex flex-col gap-2 rounded-control bg-surface-sunken p-3.5">
                <StarRating rating={rating} showValue={false} />
                {comment.trim() && <span className="text-sm leading-relaxed text-text-secondary">{comment}</span>}
              </div>
              <Button type="button" variant="primary" size="lg" onClick={() => router.push("/moji-termini")}>
                {t("close")}
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
