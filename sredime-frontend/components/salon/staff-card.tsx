import { User } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { firstName } from "@/lib/format";
import type { Worker } from "@/types/entities";

export function StaffCard({ worker, onBook }: { worker: Worker; onBook: () => void }) {
  const t = useTranslations("salon");
  const workerFirstName = firstName(worker.name);

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-indigo-100 text-indigo-400">
          <Icon icon={User} size={20} />
        </span>
        <div className="min-w-0">
          <div className="font-bold text-text-primary">{worker.name}</div>
          <div className="text-sm text-text-secondary">{worker.position}</div>
        </div>
      </div>
      {worker.bio && <p className="text-sm leading-relaxed text-text-secondary">{worker.bio}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-text-muted">
          {t("next")}: {worker.nextSlotLabel}
        </span>
        <Button type="button" variant="secondary" size="sm" onClick={onBook}>
          {t("bookWithCta", { name: workerFirstName })}
        </Button>
      </div>
    </Card>
  );
}
