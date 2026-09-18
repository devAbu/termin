import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/format";
import type { BookingDetails } from "@/lib/api/bookings";
import { summarizeBookings, workerConfirmationTally } from "@/lib/api/dashboard";
import type { Worker } from "@/types/entities";

/** "Statistika" tab: headline numbers and confirmed/unconfirmed per worker; the full report lives on /statistika. */
export function StatsTab({ allBookings, workers }: { allBookings: BookingDetails[]; workers: Worker[] }) {
  const t = useTranslations("dashboard");
  const stats = summarizeBookings(allBookings);

  const kpis = [
    { label: t("statsTotalLabel"), value: String(stats.total) },
    { label: t("statsCompletedLabel"), value: String(stats.completed) },
    { label: t("statsNoShowLabel"), value: String(stats.noShows) },
    { label: t("statsRevenueLabel"), value: formatPrice(stats.revenue) },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="flex flex-col gap-1 rounded-card bg-card p-4 shadow-card">
            <span className="eyebrow">{kpi.label}</span>
            <span className="text-2xl font-bold text-text-primary">{kpi.value}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 rounded-card bg-card p-4 shadow-card">
        <span className="text-sm font-bold text-text-primary">{t("statsPerStaffTitle")}</span>
        {workers.map((w) => {
          const { confirmed, unconfirmed } = workerConfirmationTally(allBookings, w.id);
          return (
            <div key={w.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-text-primary">{w.name}</span>
              <span className="text-text-secondary">{t("confirmedCountLabel", { confirmed, unconfirmed })}</span>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-text-muted">{t("statsHint")}</span>
        <Link href="/statistika" className="text-xs font-medium text-brand hover:underline">
          {t("statsFullReportCta")}
        </Link>
      </div>
    </div>
  );
}
