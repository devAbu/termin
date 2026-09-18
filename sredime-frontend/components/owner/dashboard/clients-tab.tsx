import { Ban, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { initialsFromName, pluralBs } from "@/lib/format";
import type { SalonClientSummary } from "@/lib/api/bookings";
import type { Role } from "@/types/dashboard";

/** "Klijenti" tab: every client of the salon with a link to their history and block / propose-block. */
export function ClientsTab({
  clients,
  role,
  onFlash,
}: {
  clients: SalonClientSummary[];
  role: Role;
  onFlash: (message: string) => void;
}) {
  const t = useTranslations("dashboard");
  const tClient = useTranslations("clientHistory");
  const isOwner = role === "owner";

  return (
    <div className="flex flex-col gap-3">
      {clients.length === 0 && <div className="rounded-card bg-card p-10 text-center shadow-card text-sm text-text-secondary">{t("noClients")}</div>}
      {clients.map((c) => (
        <div key={c.name} className="flex flex-wrap items-center gap-3 rounded-card bg-card p-4 shadow-card">
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-brand-subtle text-sm font-bold text-brand">
            {initialsFromName(c.name)}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-text-primary">{c.name}</span>
              <Badge variant={c.noShowCount > 0 ? "warning" : "success"}>{c.noShowCount > 0 ? t("riskTag") : t("regularTag")}</Badge>
            </div>
            <span className="text-sm text-text-secondary">
              {c.phone} · {c.visits} {pluralBs(c.visits, t("visitsOne"), t("visitsFew"), t("visitsMany"))}
            </span>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" asChild>
              <Link href={`/dashboard/klijenti/${encodeURIComponent(c.name)}?role=${role}`}>
                {tClient("viewHistory")}
                <Icon icon={ChevronRight} size={13} />
              </Link>
            </Button>
            <Button
              type="button"
              variant={isOwner ? "destructive" : "secondary"}
              size="sm"
              onClick={() => onFlash(isOwner ? t("blockedToast") : t("proposedToast"))}
            >
              <Icon icon={Ban} size={13} />
              {isOwner ? t("blockClient") : t("proposeBlock")}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
