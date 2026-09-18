import { useMemo } from "react";
import { Check, CircleCheck, CircleX, Repeat, TriangleAlert, UserX } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { formatEndTimeOfDay, formatPrice, formatTimeOfDay } from "@/lib/format";
import { BOOKING_STATUS_TONE } from "@/lib/booking-status";
import { bookingAmount } from "@/lib/api/booking-metrics";
import type { BookingDetails, SalonClientSummary } from "@/lib/api/bookings";
import { BOOKING_STATUS_ICON } from "@/components/owner/booking-status-icon";
import type { ActionModalType } from "./booking-action-modal";

/** What the buttons on an appointment card can do — the dashboard owns the state they change. */
export interface AppointmentActions {
  onConfirm: (bookingId: number) => void;
  onComplete: (bookingId: number) => void;
  onRequestAction: (type: ActionModalType, bookingId: number) => void;
}

function AppointmentCard({ booking: b, noShowCount, actions }: { booking: BookingDetails; noShowCount: number; actions: AppointmentActions }) {
  const t = useTranslations("dashboard");
  const tStatus = useTranslations("bookingStatus");
  const StatusIcon = BOOKING_STATUS_ICON[b.status];

  const buttons: { label: string; icon: typeof Check; variant: "primary" | "secondary" | "destructive"; onClick: () => void }[] = [];
  if (b.status === "pending") {
    buttons.push({ label: t("confirmAction"), icon: CircleCheck, variant: "primary", onClick: () => actions.onConfirm(b.id) });
  }
  if (b.status === "pending" || b.status === "confirmed") {
    buttons.push({ label: t("moveAction"), icon: Repeat, variant: "secondary", onClick: () => actions.onRequestAction("move", b.id) });
    buttons.push({ label: t("cancelAction"), icon: CircleX, variant: "destructive", onClick: () => actions.onRequestAction("cancel", b.id) });
  }
  if (b.status === "confirmed") {
    buttons.push({ label: t("completeAction"), icon: Check, variant: "secondary", onClick: () => actions.onComplete(b.id) });
    buttons.push({ label: t("noShowAction"), icon: UserX, variant: "destructive", onClick: () => actions.onRequestAction("noshow", b.id) });
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 rounded-card p-4 shadow-card sm:grid-cols-[80px_minmax(0,1fr)] md:grid-cols-[80px_minmax(0,1fr)_auto] md:items-center md:gap-4",
        b.status === "pending" ? "bg-brand-subtle" : "bg-card",
      )}
    >
      <div className="flex flex-col">
        <span className="text-sm font-bold text-text-primary">{formatTimeOfDay(b.scheduledAt)}</span>
        <span className="text-xs text-text-muted">{formatEndTimeOfDay(b.scheduledAt, b.service.durationMinutes)}</span>
      </div>
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-text-primary">{b.clientName}</span>
          <Badge variant={BOOKING_STATUS_TONE[b.status]}>
            <Icon icon={StatusIcon} size={11} />
            {tStatus(b.status)}
          </Badge>
          {b.manuallyEntered && <Badge variant="info">{t("manualBadge")}</Badge>}
        </div>
        <span className="text-sm text-text-secondary">
          {b.service.name} · {b.worker.name} · {formatPrice(bookingAmount(b))}
        </span>
        {noShowCount ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-warning-fg">
            <Icon icon={TriangleAlert} size={12} />
            {t("previousNoShows", { count: noShowCount })}
          </span>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2 md:justify-end">
        {buttons.map((a) => (
          <Button key={a.label} type="button" variant={a.variant} size="sm" onClick={a.onClick}>
            <Icon icon={a.icon} size={13} />
            {a.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

/** Vertical list of appointment cards (Kalendar and Zahtjevi tabs). */
export function AppointmentList({
  bookings,
  clients,
  actions,
}: {
  bookings: BookingDetails[];
  clients: SalonClientSummary[];
  actions: AppointmentActions;
}) {
  const noShowsByClient = useMemo(() => new Map(clients.map((c) => [c.name, c.noShowCount])), [clients]);

  return (
    <div className="flex flex-col gap-3">
      {bookings.map((b) => (
        <AppointmentCard key={b.id} booking={b} noShowCount={noShowsByClient.get(b.clientName) ?? 0} actions={actions} />
      ))}
    </div>
  );
}
