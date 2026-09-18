"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/chrome/logo";
import { clearStoredSession, getStoredSession, type StoredSession } from "@/lib/session";
import { firstName, initialsFromName } from "@/lib/format";

export function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [session, setSession] = useState<StoredSession | null>(null);

  // Re-read on every route change too — each route is a separate *-content.tsx
  // that mounts its own <Navbar/> (no shared layout), so this also covers the
  // initial mount right after a quick-login redirect.
  useEffect(() => {
    setMenuOpen(false);
    setSession(getStoredSession());
  }, [pathname]);

  function handleLogout() {
    clearStoredSession();
    setSession(null);
    setMenuOpen(false);
  }

  const links = [
    { href: "/pretraga", label: t("search") },
    { href: "/moji-termini", label: t("myBookings") },
    { href: "/za-salone", label: t("forSalons") },
  ];

  return (
    <header className="sticky top-0 z-20 flex min-h-[72px] items-center gap-3 border-b border-transparent bg-white/86 px-6 py-2 backdrop-blur-sticky shadow-inset-line">
      <Logo />
      <div className="flex-1" />
      <nav className="hidden items-center gap-6 md:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-medium text-text-secondary hover:text-brand"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {session ? (
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-brand-subtle text-sm font-bold text-brand">
            {initialsFromName(session.name)}
          </span>
          <span className="hidden text-sm font-medium text-text-primary sm:inline">
            {firstName(session.name)}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="hidden md:inline-flex"
            onClick={handleLogout}
          >
            {t("logout")}
          </Button>
        </div>
      ) : (
        <>
          <Button asChild variant="secondary" size="sm">
            <Link href="/prijava">{t("login")}</Link>
          </Button>
          <Button asChild variant="primary" size="sm" className="hidden md:inline-flex">
            <Link href="/registracija">{t("register")}</Link>
          </Button>
        </>
      )}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <Icon icon={menuOpen ? X : Menu} />
      </Button>

      {menuOpen && (
        <nav className="absolute inset-x-0 top-full flex flex-col gap-1 border-b border-border-subtle bg-white p-3 shadow-card md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-control px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-brand-subtle hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
          {session ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-control px-3 py-2.5 text-left text-sm font-medium text-brand hover:bg-brand-subtle"
            >
              {t("logout")}
            </button>
          ) : (
            <Link
              href="/registracija"
              className="rounded-control px-3 py-2.5 text-sm font-medium text-brand hover:bg-brand-subtle"
            >
              {t("register")}
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
