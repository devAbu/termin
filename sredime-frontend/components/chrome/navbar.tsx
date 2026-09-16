import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/chrome/logo";

export function Navbar() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-20 flex min-h-[72px] items-center gap-3 border-b border-transparent bg-white/86 px-6 py-2 backdrop-blur-sticky shadow-inset-line">
      <Logo />
      <div className="flex-1" />
      <nav className="hidden items-center gap-6 md:flex">
        <Link href="/pretraga" className="text-sm font-medium text-text-secondary hover:text-brand">
          {t("search")}
        </Link>
        <Link href="/moji-termini" className="text-sm font-medium text-text-secondary hover:text-brand">
          {t("myBookings")}
        </Link>
        <Link href="/za-salone" className="text-sm font-medium text-text-secondary hover:text-brand">
          {t("forSalons")}
        </Link>
      </nav>
      <Button asChild variant="secondary" size="sm">
        <Link href="/prijava">{t("login")}</Link>
      </Button>
      <Button asChild variant="primary" size="sm" className="hidden md:inline-flex">
        <Link href="/registracija">{t("register")}</Link>
      </Button>
    </header>
  );
}
