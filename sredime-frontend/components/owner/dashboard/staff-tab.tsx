import { Info, Repeat, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { initialsFromName, pluralBs } from "@/lib/format";
import type { TeamMember } from "@/types/dashboard";
import type { Worker } from "@/types/entities";
import { TEAM_BADGE } from "./team-badge";

/** "Radnici" tab: team list with invite status, "can block clients" toggle and (re)send invite. */
export function StaffTab({
  team,
  workers,
  canBlockOverrides,
  isOwner,
  onToggleCanBlock,
  onInviteNew,
  onResendInvite,
}: {
  team: TeamMember[];
  workers: Worker[];
  canBlockOverrides: Record<number, boolean>;
  isOwner: boolean;
  onToggleCanBlock: (workerId: number, canBlock: boolean) => void;
  onInviteNew: () => void;
  onResendInvite: (member: TeamMember) => void;
}) {
  const t = useTranslations("dashboard");
  const tInvite = useTranslations("workerInvite");
  const pendingInvites = team.filter((m) => m.status === "invited").length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-2.5 rounded-control bg-brand-subtle px-4 py-3.5">
        <Icon icon={Info} size={16} className="mt-0.5 flex-none text-brand" />
        <span className="text-sm leading-relaxed text-text-secondary">{tInvite("infoBanner")}</span>
      </div>

      <div className="overflow-hidden rounded-card bg-card shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 shadow-inset-line">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-base font-bold text-text-primary">{tInvite("teamTitle")}</span>
            <span className="text-sm text-text-muted">
              {tInvite("teamMeta", {
                count: team.length,
                word: pluralBs(team.length, tInvite("peopleOne"), tInvite("peopleFew"), tInvite("peopleMany")),
                pending: pendingInvites,
              })}
            </span>
          </div>
          {isOwner && (
            <Button type="button" size="sm" onClick={onInviteNew}>
              <Icon icon={UserPlus} size={15} />
              {t("inviteWorker")}
            </Button>
          )}
        </div>
        <div className="flex flex-col divide-y divide-border-subtle">
          {team.map((m) => {
            const badge = TEAM_BADGE[m.status];
            const canBlockOn = m.workerId != null ? (canBlockOverrides[m.workerId] ?? workers.find((w) => w.id === m.workerId)?.canBlockClients) : undefined;
            return (
              <div
                key={m.id}
                className="grid grid-cols-[44px_minmax(0,1fr)] items-center gap-x-3.5 gap-y-2.5 p-4 sm:grid-cols-[44px_minmax(0,1fr)_auto_auto] sm:gap-3.5"
              >
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-brand-subtle text-sm font-bold text-brand">
                  {initialsFromName(m.name)}
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-bold text-text-primary">{m.name}</span>
                  <span className="truncate text-sm text-text-secondary">
                    {m.role ?? t("ownerRole")} · {m.contact}
                  </span>
                </span>
                <Badge variant={badge.tone} className="w-fit">
                  <Icon icon={badge.icon} size={11} />
                  {tInvite(badge.labelKey)}
                </Badge>
                <span className="col-span-2 flex flex-wrap gap-2 sm:col-span-1 sm:justify-end">
                  {m.workerId != null && isOwner && (
                    <button
                      type="button"
                      onClick={() => onToggleCanBlock(m.workerId!, !canBlockOn)}
                      className={cn(
                        "h-9 rounded-control px-3 text-xs font-semibold",
                        canBlockOn ? "bg-brand-subtle text-brand" : "border border-border-subtle bg-card text-text-secondary",
                      )}
                    >
                      {canBlockOn ? t("canBlockOn") : t("canBlockOff")}
                    </button>
                  )}
                  {(m.status === "invited" || m.status === "draft") && isOwner && (
                    <Button type="button" variant="secondary" size="sm" onClick={() => onResendInvite(m)}>
                      <Icon icon={m.status === "invited" ? Repeat : UserPlus} size={14} />
                      {m.status === "invited" ? tInvite("resendCta") : tInvite("sendCta")}
                    </Button>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
