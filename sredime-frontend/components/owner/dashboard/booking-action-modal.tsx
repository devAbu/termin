import { useMemo, useState } from "react";
import { CircleX, Repeat, UserX } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { cn } from "@/lib/utils";
import { formatTimeOfDay, formatWeekdayShort } from "@/lib/format";
import { findMoveSlots } from "@/lib/api/dashboard";
import type { BookingDetails } from "@/lib/api/bookings";
import type { BookingStatus, Salon } from "@/types/entities";

export type ActionModalType = "move" | "cancel" | "noshow";

/**
 * Confirmation dialog for Pomjeri / Otkaži / Nije se pojavio. Mounted only while open, so the picked
 * "move" slot starts at the first one every time the dialog opens (no stale index from a previous booking).
 */
export function BookingActionModal({
  type,
  booking,
  salon,
  allBookings,
  onDismiss,
  onMove,
  onSetStatus,
}: {
  type: ActionModalType;
  booking: BookingDetails;
  salon: Salon;
  allBookings: BookingDetails[];
  onDismiss: () => void;
  onMove: (bookingId: number, newIso: string) => void;
  onSetStatus: (bookingId: number, status: BookingStatus, toast: string) => void;
}) {
  const t = useTranslations("dashboard");
  const [moveChoice, setMoveChoice] = useState(0);
  const moveSlots = useMemo(() => findMoveSlots({ salon, booking, allBookings }), [salon, booking, allBookings]);

  return (
    <ModalOverlay className="p-5">
      <div className="flex w-full max-w-[420px] flex-col gap-4 rounded-modal bg-card p-6 shadow-modal">
        <span
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full",
            type === "move" ? "bg-brand-subtle text-brand" : "bg-danger-bg text-danger-fg",
          )}
        >
          <Icon icon={type === "move" ? Repeat : type === "cancel" ? CircleX : UserX} size={22} />
        </span>
        <div className="flex flex-col gap-1.5">
          <span className="text-xl font-bold tracking-tight text-text-primary">
            {type === "move" ? t("moveTitle") : type === "cancel" ? t("cancelTitle") : t("noShowTitle")}
          </span>
          <span className="text-sm text-text-secondary">
            {booking.clientName} · {formatTimeOfDay(booking.scheduledAt)}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-text-secondary">
          {type === "move" ? t("moveNote") : type === "cancel" ? t("cancelNote") : t("noShowNote")}
        </p>
        {type === "move" && (
          <div className="flex flex-col gap-2">
            {moveSlots.length === 0 ? (
              <span className="text-sm text-text-muted">{t("moveNoSlots")}</span>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {moveSlots.map((s, i) => (
                  <button
                    key={s.iso}
                    type="button"
                    onClick={() => setMoveChoice(i)}
                    className={cn(
                      "rounded-control px-3 py-2 text-sm font-medium",
                      moveChoice === i ? "bg-brand text-primary-foreground" : "border border-border-subtle bg-card text-text-primary",
                    )}
                  >
                    {formatWeekdayShort(s.date)} {s.date.getDate()}., {s.time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="flex gap-2.5">
          <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={onDismiss}>
            {t("dismiss")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="lg"
            className="flex-1"
            disabled={type === "move" && (moveSlots.length === 0 || moveChoice >= moveSlots.length)}
            onClick={() => {
              if (type === "move") onMove(booking.id, moveSlots[moveChoice].iso);
              else if (type === "cancel") onSetStatus(booking.id, "cancelled_by_salon", t("cancelledToast"));
              else onSetStatus(booking.id, "no_show", t("noShowToast"));
            }}
          >
            {type === "move" ? t("moveCta") : type === "cancel" ? t("cancelCta") : t("noShowCta")}
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
}
