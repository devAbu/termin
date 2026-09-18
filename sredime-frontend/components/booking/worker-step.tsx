import { Check, Heart, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { firstName, initialsFromName } from "@/lib/format";
import type { Worker } from "@/types/entities";

export function WorkerStep({
  workers,
  eligibleWorkers,
  workerChoice,
  favoriteWorkerId,
  lastUsedWorkerId,
  showFavoriteCard,
  onPick,
  onRevealAll,
}: {
  workers: Worker[];
  eligibleWorkers: Worker[];
  workerChoice: number | "any" | null;
  favoriteWorkerId: number | null;
  lastUsedWorkerId: number | null;
  showFavoriteCard: boolean;
  onPick: (choice: number | "any") => void;
  onRevealAll: () => void;
}) {
  const t = useTranslations("booking");
  const favWorker = showFavoriteCard ? workers.find((w) => w.id === favoriteWorkerId) : undefined;
  const lastUsedWorkerName = firstName(workers.find((w) => w.id === lastUsedWorkerId)?.name ?? "");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-text-primary md:text-2xl">{t("staffTitle")}</h2>
        <p className="mt-1.5 text-sm text-text-secondary">{t("staffLead")}</p>
      </div>

      {showFavoriteCard ? (
        favWorker && (
          <div className="flex flex-col items-center gap-3 rounded-card bg-card p-6 text-center shadow-card">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-danger-bg px-3 py-1 text-2xs font-semibold text-danger-fg">
              <Icon icon={Heart} size={12} />
              {t("staffFavoriteBadge")}
            </span>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-base font-bold text-indigo-400">
              {initialsFromName(favWorker.name)}
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-base font-bold text-text-primary">{favWorker.name}</span>
              <span className="text-sm text-text-secondary">{favWorker.position}</span>
            </span>
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              <Button type="button" variant="accent" size="md" onClick={() => onPick(favWorker.id)}>
                {t("staffContinueWith", { name: firstName(favWorker.name) })}
              </Button>
              <Button type="button" variant="secondary" size="md" onClick={onRevealAll}>
                {t("staffChangeWorker")}
              </Button>
            </div>
          </div>
        )
      ) : (
        <>
          {!favoriteWorkerId && lastUsedWorkerId != null && (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-pill bg-brand-subtle px-3 py-1.5 text-xs font-medium text-brand">
              <Icon icon={Check} size={13} />
              {t("staffSuggestedNote", { name: lastUsedWorkerName })}
            </span>
          )}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
            <button
              type="button"
              onClick={() => onPick("any")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-card p-4 text-center shadow-card",
                workerChoice === "any" ? "bg-brand-subtle ring-1 ring-inset ring-indigo-200" : "bg-card",
              )}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-sunken text-icon-muted">
                <Icon icon={User} size={20} />
              </span>
              <span className="text-sm font-bold text-text-primary">{t("staffAnyName")}</span>
              <span className="text-xs text-text-secondary">{t("staffAnyRole")}</span>
            </button>
            {eligibleWorkers.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => onPick(w.id)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-card p-4 text-center shadow-card",
                  workerChoice === w.id ? "bg-brand-subtle ring-1 ring-inset ring-indigo-200" : "bg-card",
                )}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-400">
                  {initialsFromName(w.name)}
                </span>
                <span className="text-sm font-bold text-text-primary">{w.name}</span>
                <span className="text-xs text-text-secondary">{w.position}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
