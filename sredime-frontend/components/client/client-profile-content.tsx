"use client";

import { useRef, useState } from "react";
import { Check, Lock, Mail, Phone, Search, User as UserIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Navbar } from "@/components/chrome/navbar";
import { Footer } from "@/components/chrome/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { formatMonthGenitive } from "@/lib/format";
import type { User } from "@/types/entities";

export function ClientProfileContent({ user }: { user: User }) {
  const t = useTranslations("clientProfile");

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone ?? "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [notifReminder, setNotifReminder] = useState(true);
  const [notifChanges, setNotifChanges] = useState(true);

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function flash(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }

  function saveProfile() {
    flash(t("savedToast"));
  }

  function discardProfile() {
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone ?? "");
    flash(t("discardedToast"));
  }

  function changePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      flash(t("passwordMismatchToast"));
      return;
    }
    if (newPassword.length < 8) {
      flash(t("passwordTooShortToast"));
      return;
    }
    if (newPassword !== confirmPassword) {
      flash(t("passwordMismatchToast"));
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    flash(t("passwordChangedToast"));
  }

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const joined = new Date(user.createdAt);

  return (
    <div className="relative flex min-h-full flex-col bg-surface-canvas">
      <Navbar />

      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-6 py-8 md:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-brand text-xl font-bold text-primary-foreground md:h-16 md:w-16 md:text-2xl">
              {initials}
            </span>
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-bold tracking-tight text-text-primary md:text-3xl">{name}</h1>
              <span className="text-sm text-text-secondary">
                {t("memberSince", { role: t("roleClient"), date: `${formatMonthGenitive(joined)} ${joined.getFullYear()}` })}
              </span>
            </div>
          </div>
          <Button asChild variant="accent" size="md">
            <Link href="/pretraga">
              <Icon icon={Search} size={16} />
              {t("newBooking")}
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-4 rounded-card bg-card p-5 shadow-card md:p-6">
            <div className="flex flex-col gap-1">
              <span className="text-lg font-bold tracking-tight text-text-primary">{t("personalTitle")}</span>
              <span className="text-sm leading-relaxed text-text-secondary">{t("personalLead")}</span>
            </div>
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
              <label className="flex flex-col gap-1.5 md:col-span-2">
                <span className="text-sm font-medium text-text-primary">{t("nameLabel")}</span>
                <span className="relative flex items-center">
                  <Icon icon={UserIcon} size={16} className="pointer-events-none absolute left-3 text-icon-muted" />
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("namePlaceholder")} className="pl-9" />
                </span>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-text-primary">{t("emailLabel")}</span>
                <span className="relative flex items-center">
                  <Icon icon={Mail} size={16} className="pointer-events-none absolute left-3 text-icon-muted" />
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder={t("emailPlaceholder")} className="pl-9" />
                </span>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-text-primary">{t("phoneLabel")}</span>
                <span className="relative flex items-center">
                  <Icon icon={Phone} size={16} className="pointer-events-none absolute left-3 text-icon-muted" />
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder={t("phonePlaceholder")} className="pl-9" />
                </span>
              </label>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Button type="button" variant="primary" size="md" onClick={saveProfile}>
                <Icon icon={Check} size={16} />
                {t("saveChanges")}
              </Button>
              <Button type="button" variant="secondary" size="md" onClick={discardProfile}>
                {t("discardChanges")}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 rounded-card bg-card p-5 shadow-card md:p-6">
              <div className="flex flex-col gap-1">
                <span className="text-lg font-bold tracking-tight text-text-primary">{t("passwordTitle")}</span>
                <span className="text-sm leading-relaxed text-text-secondary">{t("passwordLead")}</span>
              </div>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-text-primary">{t("currentPasswordLabel")}</span>
                <span className="relative flex items-center">
                  <Icon icon={Lock} size={16} className="pointer-events-none absolute left-3 text-icon-muted" />
                  <Input
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    type="password"
                    placeholder={t("currentPasswordPlaceholder")}
                    className="pl-9"
                  />
                </span>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-text-primary">{t("newPasswordLabel")}</span>
                <span className="relative flex items-center">
                  <Icon icon={Lock} size={16} className="pointer-events-none absolute left-3 text-icon-muted" />
                  <Input
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    type="password"
                    placeholder={t("newPasswordPlaceholder")}
                    className="pl-9"
                  />
                </span>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-text-primary">{t("confirmPasswordLabel")}</span>
                <span className="relative flex items-center">
                  <Icon icon={Lock} size={16} className="pointer-events-none absolute left-3 text-icon-muted" />
                  <Input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type="password"
                    placeholder={t("confirmPasswordPlaceholder")}
                    className="pl-9"
                  />
                </span>
              </label>
              <Button type="button" variant="secondary" size="md" className="self-start" onClick={changePassword}>
                <Icon icon={Lock} size={16} />
                {t("changePassword")}
              </Button>
            </div>

            <div className="flex flex-col gap-3.5 rounded-card bg-card p-5 shadow-card md:p-6">
              <span className="text-lg font-bold tracking-tight text-text-primary">{t("notificationsTitle")}</span>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={notifReminder}
                  onChange={(e) => setNotifReminder(e.target.checked)}
                  className="mt-0.5 h-5 w-5 flex-none accent-[var(--brand)]"
                />
                <span>
                  <span className="block text-sm font-medium text-text-primary">{t("notifReminderLabel")}</span>
                  <span className="block text-xs text-text-secondary">{t("notifReminderHint")}</span>
                </span>
              </label>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={notifChanges}
                  onChange={(e) => setNotifChanges(e.target.checked)}
                  className="mt-0.5 h-5 w-5 flex-none accent-[var(--brand)]"
                />
                <span>
                  <span className="block text-sm font-medium text-text-primary">{t("notifChangesLabel")}</span>
                  <span className="block text-xs text-text-secondary">{t("notifChangesHint")}</span>
                </span>
              </label>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-surface-inverse px-4.5 py-3 text-sm font-medium text-brand-on shadow-popover">
          <Icon icon={Check} size={16} className="text-accent" />
          {toast}
        </div>
      )}
    </div>
  );
}
