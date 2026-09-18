import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { Step } from "./wizard-types";

/** Desktop numbered stepper + mobile progress bar shown above the wizard steps. */
export function WizardStepper({
  labels,
  stepIndexes,
  currentLabelIndex,
  reached,
  onGo,
}: {
  labels: string[];
  stepIndexes: number[];
  currentLabelIndex: number;
  reached: Step;
  onGo: (step: Step) => void;
}) {
  const t = useTranslations("booking");

  return (
    <>
      <div className="hidden items-center gap-3 rounded-card bg-card p-4 shadow-card md:flex">
        {labels.map((label, i) => {
          const isDone = i < currentLabelIndex;
          const isActive = i === currentLabelIndex;
          return (
            <div key={label} className="flex flex-1 items-center gap-3 last:flex-none">
              <button
                type="button"
                onClick={() => stepIndexes[i] <= reached && onGo(stepIndexes[i] as Step)}
                className="flex items-center gap-2.5"
              >
                <span
                  className={cn(
                    "flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-bold",
                    isDone || isActive ? "bg-brand text-primary-foreground" : "bg-surface-sunken text-text-muted",
                  )}
                >
                  {isDone ? <Icon icon={Check} size={14} /> : i + 1}
                </span>
                <span
                  className={cn(
                    "text-sm whitespace-nowrap",
                    isActive ? "font-semibold text-text-primary" : isDone ? "font-medium text-brand" : "font-medium text-text-muted",
                  )}
                >
                  {label}
                </span>
              </button>
              {i < labels.length - 1 && <span className={cn("h-px flex-1", i < currentLabelIndex ? "bg-brand" : "bg-border-subtle")} />}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 md:hidden">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-semibold text-text-primary">{t("stepLabel", { n: currentLabelIndex + 1, label: labels[currentLabelIndex] })}</span>
          <span className="text-xs text-text-secondary">{t("stepCount", { n: currentLabelIndex + 1, total: labels.length })}</span>
        </div>
        <div className="flex gap-1">
          {labels.map((label, i) => (
            <span key={label} className={cn("h-1 flex-1 rounded-full", i <= currentLabelIndex ? "bg-brand" : "bg-border-subtle")} />
          ))}
        </div>
      </div>
    </>
  );
}
