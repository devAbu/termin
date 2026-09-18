"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Send, ShieldQuestion, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Icon } from "@/components/ui/icon";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { hasText, isValidContact, isWorkerInviteValid } from "@/lib/validation";

export const WORKER_ROLES = ["Frizer / frizerka", "Barber", "Kozmetičar / kozmetičarka", "Manikir / pedikir", "Pomoćno osoblje"];

function generateInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${part()}-${part()}`;
}

export interface InvitePayload {
  name: string;
  contact: string;
  role: string;
  code: string;
}

export function InviteWorkerModal({
  mode,
  initialName = "",
  initialContact = "",
  initialRole = WORKER_ROLES[0],
  onClose,
  onSent,
}: {
  mode: "new" | "resend";
  initialName?: string;
  initialContact?: string;
  initialRole?: string;
  onClose: () => void;
  onSent: (payload: InvitePayload) => void;
}) {
  const t = useTranslations("workerInvite");

  const [stage, setStage] = useState<"form" | "sent">(mode === "resend" ? "sent" : "form");
  const [name, setName] = useState(initialName);
  const [contact, setContact] = useState(initialContact);
  const [role, setRole] = useState(initialRole);
  const [code, setCode] = useState(generateInviteCode);
  const [copied, setCopied] = useState(false);
  const sentTo = contact || initialContact;
  const inviteLink = `sredime.ba/pozivnica/${code}`;

  useEffect(() => {
    if (mode === "resend") {
      onSent({ name: initialName, contact: initialContact, role: initialRole, code });
    }
    // Fire once on mount for a resend — a fresh modal instance per click, so this never repeats.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSend() {
    const newCode = generateInviteCode();
    setCode(newCode);
    setStage("sent");
    onSent({ name: name.trim() || initialName, contact: contact.trim() || initialContact, role, code: newCode });
  }

  function copyLink() {
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <ModalOverlay>
      <div className="flex max-h-[92vh] w-full max-w-[480px] flex-col gap-4 overflow-y-auto rounded-modal bg-card p-6 shadow-modal">
        <div className="flex items-start gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-xl font-bold tracking-tight text-text-primary">
              {stage === "sent" ? t("sentTitle") : t("modalTitle")}
            </span>
            <span className="text-sm leading-relaxed text-text-secondary">
              {stage === "sent" ? t("sentSub") : t("modalSub")}
            </span>
          </div>
          <div className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            aria-label={t("closeAria")}
            className="flex h-8 w-8 flex-none items-center justify-center rounded-control bg-surface-sunken text-icon-default"
          >
            <Icon icon={X} size={16} />
          </button>
        </div>

        {stage === "form" && (
          <div className="flex flex-col gap-3.5">
            <label className="flex flex-col gap-1.5">
              <span className="eyebrow">{t("nameLabel")}</span>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("namePlaceholder")} size="lg" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="eyebrow">{t("contactLabel")}</span>
              <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder={t("contactPlaceholder")} size="lg" />
              <span className="text-xs text-text-muted">{t("contactHint")}</span>
              {hasText(contact) && !isValidContact(contact) && <span className="text-xs text-danger-fg">{t("invalidContactHint")}</span>}
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="eyebrow">{t("roleLabel")}</span>
              <Select value={role} onChange={(e) => setRole(e.target.value)} size="lg">
                {WORKER_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </label>
            <div className="flex items-start gap-2.5 rounded-control bg-surface-sunken px-3.5 py-3">
              <Icon icon={ShieldQuestion} size={16} className="mt-0.5 flex-none text-icon-muted" />
              <span className="text-xs leading-relaxed text-text-secondary">{t("roleNote")}</span>
            </div>
          </div>
        )}

        {stage === "sent" && (
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center gap-2.5 rounded-control bg-success-bg px-3.5 py-3 text-success-fg">
              <Icon icon={Check} size={18} className="flex-none" />
              <span className="text-sm font-medium">{t("sentBanner", { contact: sentTo || t("contactLabel") })}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="eyebrow">{t("linkLabel")}</span>
              <div className="flex items-center gap-2">
                <span className="h-[var(--control-height-lg)] flex-1 min-w-0 truncate rounded-control border border-border-subtle bg-surface-sunken px-3 font-mono text-sm leading-[var(--control-height-lg)] text-text-secondary">
                  {inviteLink}
                </span>
                <Button type="button" variant="secondary" size="lg" onClick={copyLink} className="flex-none">
                  <Icon icon={copied ? Check : Copy} size={15} />
                  {copied ? t("copied") : t("copy")}
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="eyebrow">{t("codeLabel")}</span>
              <span className="inline-flex h-11 w-fit items-center rounded-control bg-brand-subtle px-4.5 font-mono text-xl font-bold tracking-[0.12em] text-brand">
                {code}
              </span>
              <span className="text-xs leading-relaxed text-text-muted">{t("codeNote")}</span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2.5">
          {stage === "form" ? (
            <>
              <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={onClose}>
                {t("cancel")}
              </Button>
              <Button type="button" variant="primary" size="lg" className="flex-[1.5]" disabled={!isWorkerInviteValid({ name, contact })} onClick={handleSend}>
                {t("send")}
                <Icon icon={Send} size={16} />
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={() => {
                  setName("");
                  setContact("");
                  setRole(WORKER_ROLES[0]);
                  setStage("form");
                }}
              >
                {t("inviteAnother")}
              </Button>
              <Button type="button" variant="primary" size="lg" className="flex-[1.5]" onClick={onClose}>
                {t("done")}
                <Icon icon={Check} size={16} />
              </Button>
            </>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
}
