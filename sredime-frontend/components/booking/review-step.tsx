import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { hasText, isValidEmail, isValidGuestName, isValidPhone } from "@/lib/validation";
import type { RecapRow, Step } from "./wizard-types";

export interface GuestDetails {
  name: string;
  phone: string;
  email: string;
  note: string;
  wantsReminder: boolean;
}

export function ReviewStep({
  recap,
  solo,
  details,
  onChange,
  onEdit,
}: {
  recap: RecapRow[];
  solo: boolean;
  details: GuestDetails;
  onChange: (patch: Partial<GuestDetails>) => void;
  onEdit: (step: Step) => void;
}) {
  const t = useTranslations("booking");

  function stepFor(key: RecapRow["key"]): Step {
    if (key === "service") return 0;
    if (key === "staff") return solo ? 0 : 1;
    return 2;
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-text-primary md:text-2xl">{t("reviewTitle")}</h2>
        <p className="mt-1.5 text-sm text-text-secondary">{t("reviewLead")}</p>
      </div>

      <div className="flex flex-col rounded-card bg-card p-2 shadow-card">
        {recap.map((r, i) => (
          <div key={r.key} className={cn("flex items-center gap-3 p-3.5", i < recap.length - 1 && "border-b border-border-subtle")}>
            <Icon icon={r.icon} size={16} className="flex-none text-icon-muted" />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-xs text-text-secondary">{r.label}</span>
              <span className="text-sm font-semibold text-text-primary">{r.value}</span>
            </div>
            <button
              type="button"
              onClick={() => onEdit(stepFor(r.key))}
              className="h-9 flex-none rounded-control border border-border-subtle bg-card px-3.5 text-sm font-medium text-brand"
            >
              {t("edit")}
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-card bg-card p-5 shadow-card">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text-primary">{t("clientNameLabel")}</span>
            <Input value={details.name} onChange={(e) => onChange({ name: e.target.value })} />
            {hasText(details.name) && !isValidGuestName(details.name) && <span className="text-xs text-danger-fg">{t("invalidNameHint")}</span>}
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text-primary">{t("clientPhoneLabel")}</span>
            <Input value={details.phone} onChange={(e) => onChange({ phone: e.target.value })} type="tel" />
            {hasText(details.phone) && !isValidPhone(details.phone) && <span className="text-xs text-danger-fg">{t("invalidPhoneHint")}</span>}
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text-primary">{t("clientEmailLabel")}</span>
            <Input value={details.email} onChange={(e) => onChange({ email: e.target.value })} type="email" />
            {hasText(details.email) && !isValidEmail(details.email) && <span className="text-xs text-danger-fg">{t("invalidEmailHint")}</span>}
          </label>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text-primary">{t("noteLabel")}</span>
          <Input value={details.note} onChange={(e) => onChange({ note: e.target.value })} placeholder={t("notePlaceholder")} />
        </label>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={details.wantsReminder}
            onChange={(e) => onChange({ wantsReminder: e.target.checked })}
            className="mt-0.5 h-5 w-5 flex-none accent-[var(--brand)]"
          />
          <span>
            <span className="block text-sm font-medium text-text-primary">{t("reminderLabel")}</span>
            <span className="block text-xs text-text-secondary">{t("reminderSub")}</span>
          </span>
        </label>
        <div className="flex gap-3 rounded-md bg-info-bg p-3.5 text-info-fg">
          <Icon icon={Info} size={18} className="flex-none" />
          <span className="text-sm">{t("pendingNotice")}</span>
        </div>
      </div>
    </div>
  );
}
