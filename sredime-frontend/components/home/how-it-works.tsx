import { Search, CalendarCheck, CircleCheck, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/icon";

const STEPS: { icon: LucideIcon; titleKey: string; bodyKey: string }[] = [
  { icon: Search, titleKey: "step1Title", bodyKey: "step1Body" },
  { icon: CalendarCheck, titleKey: "step2Title", bodyKey: "step2Body" },
  { icon: CircleCheck, titleKey: "step3Title", bodyKey: "step3Body" },
];

export function HowItWorks() {
  const t = useTranslations("home");

  return (
    <section id="kako-radi" className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <span className="eyebrow">{t("howItWorksEyebrow")}</span>
        <h2 className="text-xl md:text-2xl">{t("howItWorksTitle")}</h2>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <div key={step.titleKey} className="flex flex-col gap-3 rounded-card bg-card p-6 shadow-card">
            <span className="flex h-11 w-11 items-center justify-center rounded-pill bg-brand-subtle text-brand">
              <Icon icon={step.icon} size={22} />
            </span>
            <span className="eyebrow">{t("stepLabel", { n: i + 1 })}</span>
            <span className="text-lg font-bold tracking-[-0.01em]">{t(step.titleKey)}</span>
            <span className="text-sm leading-relaxed text-text-secondary">{t(step.bodyKey)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
