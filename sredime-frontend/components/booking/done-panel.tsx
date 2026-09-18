import { CalendarCheck, Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { Service, Worker } from "@/types/entities";
import type { RecapRow } from "./wizard-types";

export function DonePanel({
  recap,
  worker,
  service,
  favoriteSaved,
  alreadyFavorite,
  onSaveFavorite,
  onRestart,
}: {
  recap: RecapRow[];
  worker: Worker | null;
  service: Service | null;
  favoriteSaved: boolean;
  alreadyFavorite: boolean;
  onSaveFavorite: () => void;
  onRestart: () => void;
}) {
  const t = useTranslations("booking");

  return (
    <div className="flex flex-col gap-4 rounded-card bg-card p-6 shadow-card">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-info-bg text-info-fg">
          <Icon icon={CalendarCheck} size={22} />
        </span>
        <div>
          <h2 className="text-xl font-bold text-text-primary">{t("doneTitle")}</h2>
          <p className="mt-1 text-sm text-text-secondary">{t("doneSub")}</p>
        </div>
      </div>
      <div className="h-px bg-border-subtle" />
      <div className="flex flex-col gap-2.5">
        {recap.map((r) => (
          <div key={r.key} className="flex items-center gap-3 text-sm">
            <Icon icon={r.icon} size={16} className="flex-none text-icon-muted" />
            <span className="text-text-secondary">{r.label}</span>
            <span className="flex-1" />
            <span className="text-right font-semibold text-text-primary">{r.value}</span>
          </div>
        ))}
      </div>
      <div className="rounded-md bg-surface-sunken px-4 py-3 text-sm text-text-secondary">{t("paymentCancelNote")}</div>

      {worker && service && (favoriteSaved || !alreadyFavorite) && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-control bg-brand-subtle px-4 py-3">
          <span className="flex items-start gap-2.5 text-sm text-text-primary">
            <Icon icon={Heart} size={16} className="mt-0.5 flex-none text-brand" />
            {favoriteSaved
              ? t("favoriteSavedNote", { worker: worker.name, service: service.name })
              : t("favoriteOfferNote", { worker: worker.name, service: service.name })}
          </span>
          {!favoriteSaved && (
            <Button type="button" variant="secondary" size="sm" onClick={onSaveFavorite}>
              {t("saveFavoriteCta")}
            </Button>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="primary" size="md">
          <Link href="/moji-termini">{t("myBookings")}</Link>
        </Button>
        <Button type="button" variant="secondary" size="md" onClick={onRestart}>
          {t("bookAnother")}
        </Button>
      </div>
    </div>
  );
}
