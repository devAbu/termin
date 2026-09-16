import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/chrome/logo";

export function Footer() {
  const t = useTranslations("footer");
  const home = useTranslations("home");

  const columns = [
    {
      title: t("clientsHeading"),
      links: [
        { label: t("searchLink"), href: "/pretraga" },
        { label: t("howItWorksLink"), href: "/#kako-radi" },
        { label: t("myBookingsLink"), href: "/moji-termini" },
        { label: t("faqLink"), href: "/za-salone" },
      ],
    },
    {
      title: t("salonsHeading"),
      links: [
        { label: t("registerSalonLink"), href: "/za-salone" },
        { label: t("pricingLink"), href: "/za-salone#cjenovnik" },
        { label: t("salonSupportLink"), href: "/za-salone#podrska" },
      ],
    },
    {
      title: t("contactHeading"),
      links: [
        { label: "podrska@sredime.ba", href: "mailto:podrska@sredime.ba" },
        { label: "+387 33 000 000", href: "tel:+38733000000" },
        { label: t("termsLink"), href: "/uslovi" },
        { label: t("privacyLink"), href: "/privatnost" },
      ],
    },
  ];

  return (
    <footer className="flex flex-col gap-8 bg-surface-inverse px-6 py-10 text-white md:px-10">
      <div className="flex flex-wrap items-center justify-between gap-5 border-b border-indigo-400 pb-7">
        <div className="flex max-w-[520px] flex-col gap-1.5">
          <span className="text-2xl font-bold tracking-[-0.01em]">{home("ctaOwnerTitle")}</span>
          <span className="text-sm leading-relaxed text-indigo-200">{home("ctaOwnerBody")}</span>
        </div>
        <Button asChild variant="accent" size="lg">
          <Link href="/za-salone">
            {home("ctaOwnerButton")}
            <Icon icon={ArrowRight} size={18} />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-7 md:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
        <div className="flex flex-col gap-2.5">
          <Logo inverse />
          <span className="max-w-[280px] text-sm leading-relaxed text-indigo-200">
            {t("tagline")}
          </span>
        </div>
        {columns.map((col) => (
          <div key={col.title} className="flex flex-col gap-2.5">
            <span className="eyebrow text-indigo-200">{col.title}</span>
            <div className="flex flex-col gap-2">
              {col.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-indigo-200 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap justify-between gap-3 border-t border-indigo-400 pt-5 text-xs text-indigo-200">
        <span>{t("copyright", { year: new Date().getFullYear() })}</span>
        <span>{t("cancellationNote")}</span>
      </div>
    </footer>
  );
}
