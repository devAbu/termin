"use client";

import { useState } from "react";
import {
  Apple,
  ArrowRight,
  Bell,
  CalendarCheck,
  CalendarClock,
  Check,
  ChevronLeft,
  Globe,
  Mail,
  Send,
  Settings,
  Store,
  TriangleAlert,
  User,
  UserPlus,
  UserX,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Logo } from "@/components/chrome/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { CATEGORY_META, CITIES } from "@/lib/constants/categories";

type Role = "klijent" | "vlasnik";
type OwnerStep = 1 | 2 | 3;

const CATEGORIES = Object.values(CATEGORY_META).map((c) => c.label);

export function RegistrationContent() {
  const t = useTranslations("registration");
  const router = useRouter();

  const [role, setRole] = useState<Role>("klijent");
  const [step, setStep] = useState<OwnerStep>(1);
  const [done, setDone] = useState(false);
  const [terms, setTerms] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const [ime, setIme] = useState("");
  const [kontakt, setKontakt] = useState("");
  const [lozinka, setLozinka] = useState("");
  const [salon, setSalon] = useState("");
  const [adresa, setAdresa] = useState("");
  const [grad, setGrad] = useState(CITIES[0]);
  const [kat, setKat] = useState(CATEGORIES[0]);
  const [telefon, setTelefon] = useState("");

  const isOwner = role === "vlasnik";
  const isDone = isOwner && done;

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast((cur) => (cur === msg ? null : cur)), 2600);
  }

  function selectRole(r: Role) {
    setRole(r);
    setStep(1);
    setDone(false);
  }

  function requireAccountFields() {
    if (!ime.trim() || !kontakt.trim() || !lozinka.trim()) {
      flash(t("missingFieldsToast"));
      return false;
    }
    if (lozinka.length < 8) {
      flash(t("passwordTooShortToast"));
      return false;
    }
    return true;
  }

  function handleClientSubmit() {
    if (!requireAccountFields()) return;
    if (!terms) {
      flash(t("termsRequiredToast"));
      return;
    }
    flash(t("clientDoneToast"));
    setTimeout(() => router.push("/pretraga"), 800);
  }

  function handleOwnerStep1Continue() {
    if (!requireAccountFields()) return;
    setStep(2);
  }

  function handleOwnerStep2Continue() {
    if (!salon.trim() || !adresa.trim() || !telefon.trim()) {
      flash(t("missingFieldsToast"));
      return;
    }
    setStep(3);
  }

  function handleOwnerSubmit() {
    if (!terms) {
      flash(t("termsRequiredToast"));
      return;
    }
    setDone(true);
  }

  function handleGoToDashboard() {
    flash(t("ownerDoneToast"));
    setTimeout(() => router.push("/postavljanje-salona"), 800);
  }

  const clientAside = {
    title: t("clientAsideTitle"),
    body: t("clientAsideBody"),
    points: [
      { icon: CalendarCheck, label: t("clientAsidePoint1") },
      { icon: Bell, label: t("clientAsidePoint2") },
      { icon: UserPlus, label: t("clientAsidePoint3") },
    ],
  };
  const ownerAside = {
    title: t("ownerAsideTitle"),
    body: t("ownerAsideBody"),
    points: [
      { icon: CalendarClock, label: t("ownerAsidePoint1") },
      { icon: UserX, label: t("ownerAsidePoint2") },
      { icon: UserPlus, label: t("ownerAsidePoint3") },
    ],
  };
  const aside = isOwner ? ownerAside : clientAside;

  const WIZARD_LABELS = [t("wizardStep1"), t("wizardStep2"), t("wizardStep3")];

  const head = isDone
    ? { title: t("doneTitle"), sub: t("doneSub") }
    : isOwner
      ? { title: t("ownerTitle"), sub: [t("ownerSubStep1"), t("ownerSubStep2"), t("ownerSubStep3")][step - 1] }
      : { title: t("clientTitle"), sub: t("clientSub") };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[0.85fr_1fr]">
      <div className="hidden flex-col gap-7 bg-surface-inverse p-10 text-brand-on lg:flex">
        <Logo inverse />
        <div className="flex-1" />
        <div className="flex flex-col gap-3">
          <h1 className="text-balance text-3xl leading-[1.15] font-bold tracking-tight">{aside.title}</h1>
          <p className="max-w-[340px] text-base leading-relaxed text-indigo-200">{aside.body}</p>
        </div>
        <div className="flex flex-col gap-3">
          {aside.points.map((p) => (
            <span key={p.label} className="inline-flex items-start gap-2.5 text-sm leading-relaxed text-indigo-200">
              <Icon icon={p.icon} size={16} className="mt-0.5 flex-none text-accent" />
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
          <div className={cn("flex w-full flex-col gap-5", isOwner ? "max-w-[520px]" : "max-w-[440px]")}>
            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">{head.title}</h1>
              <p className="text-base leading-relaxed text-text-secondary">{head.sub}</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 rounded-control bg-surface-sunken p-1">
              {([
                { id: "klijent" as const, label: t("roleClient"), icon: User },
                { id: "vlasnik" as const, label: t("roleOwner"), icon: Store },
              ]).map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => selectRole(r.id)}
                  className={cn(
                    "inline-flex h-10 items-center justify-center gap-2 rounded-[10px] text-sm transition-[background-color,color,box-shadow] duration-fast ease-standard",
                    role === r.id ? "bg-card font-semibold text-brand shadow-card" : "bg-transparent font-medium text-text-secondary",
                  )}
                >
                  <Icon icon={r.icon} size={16} />
                  {r.label}
                </button>
              ))}
            </div>

            {isOwner && (
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                {WIZARD_LABELS.map((label, i) => {
                  const n = i + 1;
                  const cur = step === n && !done;
                  const stepDone = done || step > n;
                  return (
                    <span key={label} className="flex min-w-0 flex-1 items-center gap-1.5 last:flex-none sm:gap-2.5">
                      <span
                        className={cn(
                          "flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-bold",
                          stepDone ? "bg-success-bg text-success-fg" : cur ? "bg-brand text-brand-on" : "bg-surface-sunken text-text-muted",
                        )}
                      >
                        {stepDone ? <Icon icon={Check} size={14} /> : n}
                      </span>
                      {(cur || i === WIZARD_LABELS.length - 1) && (
                        <span className={cn("hidden text-xs font-medium whitespace-nowrap sm:inline", cur ? "text-text-primary" : "text-text-muted")}>
                          {label}
                        </span>
                      )}
                      {i < WIZARD_LABELS.length - 1 && (
                        <span className={cn("h-0.5 min-w-3 flex-1 rounded-full", stepDone ? "bg-brand" : "bg-border-subtle")} />
                      )}
                    </span>
                  );
                })}
              </div>
            )}

            <div className="flex flex-col gap-4 rounded-card bg-card p-5 shadow-card sm:p-6">
              {!isDone && !isOwner && (
                <div className="grid grid-cols-1 gap-3.5">
                  <label className="flex flex-col gap-1.5">
                    <span className="eyebrow">{t("nameLabel")}</span>
                    <Input value={ime} onChange={(e) => setIme(e.target.value)} placeholder={t("clientNamePlaceholder")} size="lg" />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="eyebrow">{t("contactLabel")}</span>
                    <Input value={kontakt} onChange={(e) => setKontakt(e.target.value)} placeholder={t("contactPlaceholder")} size="lg" />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="eyebrow">{t("passwordLabel")}</span>
                    <Input type="password" value={lozinka} onChange={(e) => setLozinka(e.target.value)} placeholder={t("passwordPlaceholder")} size="lg" />
                  </label>
                </div>
              )}

              {!isDone && isOwner && step === 1 && (
                <div className="grid grid-cols-1 gap-3.5">
                  <label className="flex flex-col gap-1.5">
                    <span className="eyebrow">{t("nameLabel")}</span>
                    <Input value={ime} onChange={(e) => setIme(e.target.value)} placeholder={t("ownerNamePlaceholder")} size="lg" />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="eyebrow">{t("ownerEmailLabel")}</span>
                    <Input value={kontakt} onChange={(e) => setKontakt(e.target.value)} placeholder={t("ownerEmailPlaceholder")} size="lg" />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="eyebrow">{t("passwordLabel")}</span>
                    <Input type="password" value={lozinka} onChange={(e) => setLozinka(e.target.value)} placeholder={t("passwordPlaceholder")} size="lg" />
                  </label>
                </div>
              )}

              {!isDone && isOwner && step === 2 && (
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5 sm:col-span-2">
                    <span className="eyebrow">{t("salonNameLabel")}</span>
                    <Input value={salon} onChange={(e) => setSalon(e.target.value)} placeholder={t("salonNamePlaceholder")} size="lg" />
                  </label>
                  <label className="flex flex-col gap-1.5 sm:col-span-2">
                    <span className="eyebrow">{t("addressLabel")}</span>
                    <Input value={adresa} onChange={(e) => setAdresa(e.target.value)} placeholder={t("addressPlaceholder")} size="lg" />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="eyebrow">{t("cityLabel")}</span>
                    <Select value={grad} onChange={(e) => setGrad(e.target.value)} size="lg">
                      {CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </Select>
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="eyebrow">{t("categoryLabel")}</span>
                    <Select value={kat} onChange={(e) => setKat(e.target.value)} size="lg">
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </Select>
                  </label>
                  <label className="flex flex-col gap-1.5 sm:col-span-2">
                    <span className="eyebrow">{t("salonPhoneLabel")}</span>
                    <Input value={telefon} onChange={(e) => setTelefon(e.target.value)} placeholder={t("salonPhonePlaceholder")} size="lg" />
                    <span className="text-xs text-text-muted">{t("salonPhoneHint")}</span>
                  </label>
                </div>
              )}

              {!isDone && isOwner && step === 3 && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3 rounded-control bg-warning-bg p-4">
                    <Icon icon={TriangleAlert} size={20} className="mt-0.5 flex-none text-warning-fg" />
                    <span className="flex flex-col gap-1">
                      <span className="text-base font-bold text-warning-fg">{t("verifyBannerTitle")}</span>
                      <span className="text-sm leading-relaxed text-text-secondary">{t("verifyBannerBody")}</span>
                    </span>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <span className="eyebrow">{t("summaryTitle")}</span>
                    <div className="flex flex-col">
                      {[
                        { k: t("summaryOwnerLabel"), v: ime || "—" },
                        { k: t("summaryEmailLabel"), v: kontakt || "—" },
                        { k: t("summarySalonLabel"), v: salon || "—" },
                        { k: t("summaryAddressLabel"), v: `${adresa || "—"}, ${grad}` },
                        { k: t("summaryCategoryLabel"), v: kat },
                      ].map((row) => (
                        <span key={row.k} className="flex justify-between gap-4 border-b border-border-subtle py-2.5 text-sm last:border-0">
                          <span className="text-text-secondary">{row.k}</span>
                          <span className="text-right font-medium text-text-primary">{row.v}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="eyebrow">{t("nextStepsTitle")}</span>
                    {([
                      { icon: Mail, label: t("nextStep1") },
                      { icon: Settings, label: t("nextStep2") },
                      { icon: Store, label: t("nextStep3") },
                    ] satisfies { icon: LucideIcon; label: string }[]).map((n) => (
                      <span key={n.label} className="inline-flex items-start gap-2.5 text-sm leading-relaxed text-text-secondary">
                        <Icon icon={n.icon} size={16} className="mt-0.5 flex-none text-brand" />
                        {n.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {isDone && (
                <div className="flex flex-col items-center gap-3 py-3 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-bg text-success-fg">
                    <Icon icon={Check} size={28} />
                  </span>
                  <span className="text-xl font-bold tracking-tight text-text-primary">{t("doneTitle")}</span>
                  <p className="max-w-[380px] text-sm leading-relaxed text-text-secondary">{t("doneBody")}</p>
                </div>
              )}

              {!isDone && !isOwner && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="h-px flex-1 bg-border-subtle" />
                    <span className="text-xs text-text-muted">{t("orDivider")}</span>
                    <span className="h-px flex-1 bg-border-subtle" />
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <Button type="button" variant="secondary" size="lg" onClick={() => flash(t("socialToast"))}>
                      <Icon icon={Globe} size={18} />
                      {t("socialGoogle")}
                    </Button>
                    <Button type="button" variant="secondary" size="lg" onClick={() => flash(t("socialToast"))}>
                      <Icon icon={Apple} size={18} />
                      {t("socialApple")}
                    </Button>
                  </div>
                </div>
              )}

              {!isDone && (!isOwner || step === 3) && (
                <label className="flex cursor-pointer items-start gap-2.5">
                  <Checkbox checked={terms} onCheckedChange={setTerms} className="mt-0.5" />
                  <span className="text-sm leading-relaxed text-text-secondary">{t("termsLabel")}</span>
                </label>
              )}

              <div className="flex flex-wrap gap-2.5">
                {isOwner && !done && step > 1 && (
                  <Button type="button" variant="secondary" size="lg" onClick={() => setStep((s) => (s > 1 ? ((s - 1) as OwnerStep) : s))}>
                    <Icon icon={ChevronLeft} size={16} />
                    {t("back")}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  onClick={
                    isDone
                      ? handleGoToDashboard
                      : !isOwner
                        ? handleClientSubmit
                        : step === 1
                          ? handleOwnerStep1Continue
                          : step === 2
                            ? handleOwnerStep2Continue
                            : handleOwnerSubmit
                  }
                >
                  {isDone ? t("goDashboard") : !isOwner ? t("submitClient") : step < 3 ? t("continueCta") : t("submitForReview")}
                  <Icon icon={isDone ? ArrowRight : !isOwner ? ArrowRight : step < 3 ? ArrowRight : Send} size={18} />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-1.5 text-sm text-text-secondary">
              {isDone ? (
                <>
                  <span>{t("supportQuestion")}</span>
                  <Link href="#" className="font-medium text-brand">
                    {t("contactSupportLink")}
                  </Link>
                </>
              ) : (
                <>
                  <span>{t("alreadyHaveAccount")}</span>
                  <Link href="/prijava" className="font-medium text-brand">
                    {t("loginLink")}
                  </Link>
                </>
              )}
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
