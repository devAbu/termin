"use client";

import { useState } from "react";
import { ArrowRight, Camera, Check, Lock, Mail, Store, TriangleAlert, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/chrome/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@/components/ui/icon";
import type { Salon } from "@/types/entities";

/**
 * No real invitation store/backend yet (docs/PROGRESS.md §3 — `worker_invitations` token
 * flow is unbuilt). This identity is a stand-in for "whoever the owner invited" until a
 * real token resolves to a real invited User + Salon.
 */
const INVITEE = { name: "Ajla Zukić", email: "ajla@primjer.ba" };
const OWNER_NAME = "Selma Hodžić";

type Stage = "form" | "done" | "expired";

export function WorkerInviteContent({ salon, token }: { salon: Salon; token: string }) {
  const t = useTranslations("workerInvite");

  const [stage, setStage] = useState<Stage>(token.toLowerCase() === "isteklo" ? "expired" : "form");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [bio, setBio] = useState("");
  const [terms, setTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requested, setRequested] = useState(false);

  function handleSubmit() {
    if (!password || !confirmPassword) {
      setError(t("passwordMismatchToast"));
      return;
    }
    if (password.length < 8) {
      setError(t("passwordTooShortToast"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("passwordMismatchToast"));
      return;
    }
    if (!terms) {
      setError(t("termsRequiredToast"));
      return;
    }
    setError(null);
    setStage("done");
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[0.85fr_1fr]">
      <div className="hidden flex-col gap-7 bg-surface-inverse p-10 text-brand-on lg:flex">
        <Logo inverse />
        <div className="flex-1" />
        <div className="flex flex-col gap-3">
          <h1 className="text-balance text-3xl leading-[1.15] font-bold tracking-tight">
            {t("asideTitle", { salon: salon.name })}
          </h1>
          <p className="max-w-[340px] text-base leading-relaxed text-indigo-200">{t("asideBody")}</p>
        </div>
        <div className="flex flex-col gap-3">
          {(["asidePoint1", "asidePoint2", "asidePoint3"] as const).map((key) => (
            <span key={key} className="inline-flex items-start gap-2.5 text-sm leading-relaxed text-indigo-200">
              <Icon icon={Check} size={16} className="mt-0.5 flex-none text-accent" />
              {t(key)}
            </span>
          ))}
        </div>
        <div className="flex-1" />
        <span className="text-xs text-indigo-200">{t("asideSentBy", { name: OWNER_NAME })}</span>
      </div>

      <div className="flex min-w-0 flex-col p-5 sm:p-7">
        <Logo className="self-start lg:hidden" />

        <div className="flex flex-1 items-center justify-center py-6">
          <div className="flex w-full max-w-[440px] flex-col gap-4.5">
            <div className="flex items-center gap-3.5 rounded-card bg-card p-4 shadow-card">
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-control bg-brand-subtle text-brand">
                <Icon icon={Store} size={24} />
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="eyebrow">{t("joiningLabel")}</span>
                <span className="text-lg font-bold tracking-tight text-text-primary">{salon.name}</span>
                <span className="text-sm text-text-secondary">{salon.address}</span>
              </div>
            </div>

            {stage === "form" && (
              <div className="flex flex-col gap-4.5">
                <div className="flex flex-col gap-1.5">
                  <h1 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">{t("formTitle")}</h1>
                  <p className="text-base leading-relaxed text-text-secondary">{t("formLead")}</p>
                </div>

                <div className="flex flex-col gap-4 rounded-card bg-card p-5 shadow-card sm:p-6">
                  <div className="flex flex-col gap-2.5">
                    <span className="flex flex-col gap-1.5">
                      <span className="eyebrow">{t("lockedNameLabel")}</span>
                      <span className="flex h-[var(--control-height-lg)] items-center gap-2.5 rounded-control bg-surface-sunken px-3 text-base text-text-secondary">
                        <Icon icon={User} size={18} className="flex-none text-icon-muted" />
                        <span className="min-w-0 flex-1 truncate">{INVITEE.name}</span>
                        <Icon icon={Lock} size={15} className="flex-none text-icon-muted" />
                      </span>
                    </span>
                    <span className="flex flex-col gap-1.5">
                      <span className="eyebrow">{t("lockedEmailLabel")}</span>
                      <span className="flex h-[var(--control-height-lg)] items-center gap-2.5 rounded-control bg-surface-sunken px-3 text-base text-text-secondary">
                        <Icon icon={Mail} size={18} className="flex-none text-icon-muted" />
                        <span className="min-w-0 flex-1 truncate">{INVITEE.email}</span>
                        <Icon icon={Lock} size={15} className="flex-none text-icon-muted" />
                      </span>
                    </span>
                  </div>

                  <label className="flex flex-col gap-1.5">
                    <span className="eyebrow">{t("passwordLabel")}</span>
                    <Input type="password" size="lg" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("passwordPlaceholder")} />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="eyebrow">{t("confirmPasswordLabel")}</span>
                    <Input type="password" size="lg" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t("confirmPasswordPlaceholder")} />
                  </label>

                  <div className="flex items-center gap-3.5">
                    <span className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-brand-subtle text-base font-bold text-brand">
                      {INVITEE.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                    </span>
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <Button type="button" variant="secondary" size="sm" className="w-fit border-dashed">
                        <Icon icon={Camera} size={15} />
                        {t("addPhoto")}
                      </Button>
                      <span className="text-xs leading-relaxed text-text-muted">{t("addPhotoNote")}</span>
                    </div>
                  </div>

                  <label className="flex flex-col gap-1.5">
                    <span className="eyebrow">{t("bioLabel")}</span>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      placeholder={t("bioPlaceholder")}
                      className="w-full resize-y rounded-control border border-border-subtle bg-card px-3 py-2.5 text-base leading-relaxed text-text-primary placeholder:text-text-muted focus-visible:border-border-brand focus-visible:shadow-focus focus-visible:outline-none"
                    />
                  </label>

                  <label className="flex cursor-pointer items-start gap-2.5">
                    <Checkbox checked={terms} onCheckedChange={setTerms} className="mt-0.5" />
                    <span className="text-sm leading-relaxed text-text-secondary">{t("termsLabel")}</span>
                  </label>

                  {error && (
                    <span className="flex items-start gap-2 text-sm text-danger-fg">
                      <Icon icon={TriangleAlert} size={15} className="mt-0.5 flex-none" />
                      {error}
                    </span>
                  )}

                  <Button type="button" variant="primary" size="lg" onClick={handleSubmit}>
                    {t("submitCta")}
                    <Icon icon={ArrowRight} size={18} />
                  </Button>
                </div>

                <div className="flex items-start gap-2.5 rounded-control bg-surface-sunken px-4 py-3.5">
                  <Icon icon={Lock} size={16} className="mt-0.5 flex-none text-icon-muted" />
                  <span className="text-xs leading-relaxed text-text-secondary">{t("scopeNote", { salon: salon.name })}</span>
                </div>
              </div>
            )}

            {stage === "done" && (
              <div className="flex flex-col items-center gap-3 rounded-card bg-card p-6 text-center shadow-card sm:p-8">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-bg text-success-fg">
                  <Icon icon={Check} size={28} />
                </span>
                <span className="text-xl font-bold tracking-tight text-text-primary">{t("doneTitle", { salon: salon.name })}</span>
                <p className="max-w-[340px] text-sm leading-relaxed text-text-secondary">{t("doneBody")}</p>
                <Button asChild variant="primary" size="lg" className="mt-1">
                  <Link href="/dashboard">
                    {t("openCalendar")}
                    <Icon icon={ArrowRight} size={18} />
                  </Link>
                </Button>
              </div>
            )}

            {stage === "expired" && (
              <div className="flex flex-col items-center gap-3 rounded-card bg-card p-6 text-center shadow-card sm:p-8">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-warning-bg text-warning-fg">
                  <Icon icon={TriangleAlert} size={28} />
                </span>
                <span className="text-xl font-bold tracking-tight text-text-primary">{t("expiredTitle")}</span>
                <p className="max-w-[340px] text-sm leading-relaxed text-text-secondary">{t("expiredBody")}</p>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="mt-1"
                  disabled={requested}
                  onClick={() => setRequested(true)}
                >
                  {requested ? t("requestNewToast") : t("requestNewCta")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
