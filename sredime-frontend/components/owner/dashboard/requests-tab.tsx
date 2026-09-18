import { useTranslations } from "next-intl";
import type { BookingDetails, SalonClientSummary } from "@/lib/api/bookings";
import { AppointmentList, type AppointmentActions } from "./appointment-card";

/** "Zahtjevi" tab: every pending booking across all dates. */
export function RequestsTab({
  pending,
  clients,
  actions,
}: {
  pending: BookingDetails[];
  clients: SalonClientSummary[];
  actions: AppointmentActions;
}) {
  const t = useTranslations("dashboard");

  return pending.length === 0 ? (
    <div className="rounded-card bg-card p-10 text-center shadow-card text-sm text-text-secondary">{t("noPending")}</div>
  ) : (
    <AppointmentList bookings={pending} clients={clients} actions={actions} />
  );
}
