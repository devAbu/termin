"use client";

import { useState } from "react";
import { CalendarCheck, Check, Eye, EyeOff, Globe, Apple, Info, Repeat, Store, TriangleAlert, User, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Logo } from "@/components/chrome/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@/components/ui/icon";
import { setStoredSession, type SessionRole } from "@/lib/session";

// Isti identitet kao dashboard viewer chip (components/owner/dashboard-content.tsx) za
// worker/owner, i CURRENT_CLIENT_ID (lib/api/bookings.ts, "Sanela Kovačević") za client —
// vidi PROGRESS.md §15.2.
const SESSION_NAMES: Record<SessionRole, string> = {
  client: "Sanela Kovačević",
  worker: "Lejla Hadžić",
  owner: "Selma Hodžić",
};

export function LoginContent() {
  const t = useTranslations("login");
  const router = useRouter();

  const [ident, setIdent] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast((cur) => (cur === msg ? null : cur)), 2600);
  }

  function goToPath(path: string, msg: string) {
    flash(msg);
    setTimeout(() => router.push(path), 800);
  }

  function goToBookings(msg: string) {
    goToPath("/moji-termini", msg);
  }

  function handleLogin() {
    if (!ident.trim() || !password.trim()) {
      flash(t("missingFieldsToast"));
      return;
    }
    setStoredSession({ role: "client", name: SESSION_NAMES.client });
    goToBookings(t("loginToast"));
  }

  function handleSocialLogin(msg: string) {
    setStoredSession({ role: "client", name: SESSION_NAMES.client });
    goToBookings(msg);
  }

  // DEV-ONLY: privremena brza prijava za testiranje UI-ja bez pravog auth sistema.
  // Ukloniti/zamijeniti pravim login flow-om (Sanctum token + role iz backend odgovora) prije produkcije.
  function quickLogin(role: SessionRole) {
    setStoredSession({ role, name: SESSION_NAMES[role] });
    if (role === "client") {
      goToPath("/moji-termini", t("quickLoginClientToast"));
    } else if (role === "worker") {
      goToPath("/dashboard?role=worker", t("quickLoginWorkerToast"));
    } else {
      goToPath("/dashboard?role=owner", t("quickLoginOwnerToast"));
    }
  }

  const asidePoints = [
    { icon: CalendarCheck, label: t("asidePoint1") },
    { icon: Store, label: t("asidePoint2") },
    { icon: Repeat, label: t("asidePoint3") },
  ];

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[0.85fr_1fr]">
      <div className="hidden flex-col gap-7 bg-surface-inverse p-10 text-brand-on lg:flex">
        <Logo inverse />
        <div className="flex-1" />
        <div className="flex flex-col gap-3">
          <h1 className="text-balance text-3xl leading-[1.15] font-bold tracking-tight">{t("asideTitle")}</h1>
          <p className="max-w-[340px] text-base leading-relaxed text-indigo-200">{t("asideBody")}</p>
        </div>
        <div className="flex flex-col gap-3">
          {asidePoints.map((p) => (
            <span key={p.label} className="inline-flex items-center gap-2.5 text-sm text-indigo-200">
              <Icon icon={p.icon} size={16} className="flex-none text-accent" />
              {p.label}
            </span>
          ))}
        </div>
        <div className="flex-1" />
        <span className="text-xs text-indigo-200">{t("asideFootnote")}</span>
      </div>

      <div className="flex min-w-0 flex-col p-5 sm:p-7">
        <Logo className="self-start lg:hidden" />

        <div className="flex flex-1 items-center justify-center py-6">
          <div className="flex w-full max-w-[420px] flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">{t("title")}</h1>
              <p className="text-base leading-relaxed text-text-secondary">{t("subtitle")}</p>
            </div>

            <div className="flex flex-col gap-4 rounded-card bg-card p-5 shadow-card sm:p-6">
              <label className="flex flex-col gap-1.5">
                <span className="eyebrow">{t("identLabel")}</span>
                <div className="relative flex items-center">
                  <Icon icon={User} size={18} className="pointer-events-none absolute left-3 text-icon-muted" />
                  <Input
                    value={ident}
                    onChange={(e) => setIdent(e.target.value)}
                    placeholder={t("identPlaceholder")}
                    size="lg"
                    className="pl-[38px]"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="eyebrow">{t("passwordLabel")}</span>
                  <button
                    type="button"
                    onClick={() => flash(t("forgotToast"))}
                    className="text-xs font-medium text-brand"
                  >
                    {t("forgotPassword")}
                  </button>
                </span>
                <div className="relative flex items-center">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("passwordPlaceholder")}
                    size="lg"
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? t("hidePasswordAria") : t("showPasswordAria")}
                    className="absolute right-1.5 flex h-9 w-9 items-center justify-center rounded-control text-icon-muted hover:bg-surface-sunken"
                  >
                    <Icon icon={showPassword ? EyeOff : Eye} size={18} />
                  </button>
                </div>
              </label>

              <label className="flex cursor-pointer items-center gap-2.5">
                <Checkbox checked={remember} onCheckedChange={setRemember} />
                <span className="text-sm text-text-secondary">{t("rememberMe")}</span>
              </label>

              <Button type="button" variant="primary" size="lg" onClick={handleLogin}>
                {t("submitCta")}
              </Button>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-border-subtle" />
                  <span className="text-xs text-text-muted">{t("orDivider")}</span>
                  <span className="h-px flex-1 bg-border-subtle" />
                </div>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <Button type="button" variant="secondary" size="lg" onClick={() => handleSocialLogin(t("googleToast"))}>
                    <Icon icon={Globe} size={18} />
                    {t("socialGoogle")}
                  </Button>
                  <Button type="button" variant="secondary" size="lg" onClick={() => handleSocialLogin(t("appleToast"))}>
                    <Icon icon={Apple} size={18} />
                    {t("socialApple")}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-1.5 text-sm text-text-secondary">
              <span>{t("noAccount")}</span>
              <Link href="/registracija" className="font-medium text-brand">
                {t("registerLink")}
              </Link>
            </div>

            <div className="flex items-start gap-2.5 rounded-control bg-surface-sunken px-4 py-3.5">
              <Icon icon={Info} size={16} className="mt-0.5 flex-none text-icon-muted" />
              <span className="text-xs leading-relaxed text-text-secondary">{t("infoBanner")}</span>
            </div>

            {/* DEV-ONLY: privremeni test shortcuts, bez pravog auth-a. Ukloniti prije produkcije. */}
            <div className="flex flex-col gap-3 rounded-card border border-dashed border-warning-border bg-warning-bg p-4">
              <div className="flex items-start gap-2.5">
                <Icon icon={TriangleAlert} size={16} className="mt-0.5 flex-none text-warning-fg" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-warning-fg">{t("quickLoginTitle")}</span>
                  <span className="text-xs leading-relaxed text-warning-fg/80">{t("quickLoginBody")}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Button type="button" variant="secondary" size="md" onClick={() => quickLogin("client")}>
                  <Icon icon={User} size={16} />
                  {t("quickLoginClient")}
                </Button>
                <Button type="button" variant="secondary" size="md" onClick={() => quickLogin("worker")}>
                  <Icon icon={Users} size={16} />
                  {t("quickLoginWorker")}
                </Button>
                <Button type="button" variant="secondary" size="md" onClick={() => quickLogin("owner")}>
                  <Icon icon={Store} size={16} />
                  {t("quickLoginOwner")}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 text-xs text-text-muted">
          <Link href="/uslovi" className="text-text-muted">
            {t("legalTerms")}
          </Link>
          <Link href="/privatnost" className="text-text-muted">
            {t("legalPrivacy")}
          </Link>
          <Link href="#" className="text-text-muted">
            {t("legalSupport")}
          </Link>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-surface-inverse px-4.5 py-3 text-sm font-medium text-brand-on shadow-popover">
          <Icon icon={Check} size={16} className="text-accent" />
          {toast}
        </div>
      )}
    </div>
  );
}
