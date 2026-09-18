"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  CalendarDays,
  Check,
  CircleCheck,
  Image as ImageIcon,
  ImagePlus,
  Info,
  Mail,
  Pencil,
  Send,
  Settings,
  Store,
  Tag,
  TriangleAlert,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@/components/ui/icon";
import { Toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { initialsFromName, pluralBs } from "@/lib/format";

/** Placeholder identity until "Registracija vlasnika" (§3 u docs/PROGRESS.md) actually creates the Salon record this wizard would fill in. */
const SALON_NAME = "Novi salon";
const SALON_CITY = "Sarajevo";

const TOTAL_STEPS = 5;
const DURATIONS = [15, 20, 30, 45, 60, 90, 120];
const TIMES = ["07:00", "08:00", "08:30", "09:00", "10:00", "12:00", "14:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];
const DAYS_BS = ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak", "Subota", "Nedjelja"];
const PHOTO_CAPTIONS = ["Ulaz i izlog", "Prostor salona", "Radno mjesto", "Detalj rada", "Kabina", "Recepcija"];

type Step = 1 | 2 | 3 | 4 | 5;
type StaffStatus = "owner" | "invited" | "draft";

interface DraftService {
  id: number;
  name: string;
  price: number;
  duration: number;
}

interface DraftStaff {
  id: number;
  name: string;
  role: string;
  status: StaffStatus;
}

interface DayHours {
  day: string;
  open: boolean;
  from: string;
  to: string;
}

let nextServiceId = 1000;
let nextStaffId = 1000;

export function SalonSetupContent() {
  const t = useTranslations("salonSetup");

  const [step, setStep] = useState<Step>(1);
  const [sent, setSent] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [photoCount, setPhotoCount] = useState(3);

  const [services, setServices] = useState<DraftService[]>([
    { id: 1, name: "Šišanje i pranje", price: 25, duration: 45 },
    { id: 2, name: "Bojenje korijena", price: 60, duration: 90 },
    { id: 3, name: "Feniranje", price: 20, duration: 30 },
  ]);
  const [svcName, setSvcName] = useState("");
  const [svcPrice, setSvcPrice] = useState("");
  const [svcDuration, setSvcDuration] = useState(45);

  const [staff, setStaff] = useState<DraftStaff[]>([
    { id: 1, name: "Amina Hodžić", role: "Vlasnica, frizerka", status: "owner" },
    { id: 2, name: "Lejla Kadić", role: "Frizerka", status: "invited" },
    { id: 3, name: "Ena Šarić", role: "Pomoćnica", status: "draft" },
  ]);
  const [stName, setStName] = useState("");
  const [stRole, setStRole] = useState("");
  const [stEmail, setStEmail] = useState("");
  const [stSend, setStSend] = useState(true);

  const [hours, setHours] = useState<DayHours[]>(
    DAYS_BS.map((day, i) => ({ day, open: i < 6, from: "09:00", to: "19:00" })),
  );

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast((cur) => (cur === msg ? null : cur)), 2600);
  }

  function goTo(n: Step) {
    setStep(n);
    setSent(false);
  }

  function addService() {
    if (!svcName.trim()) return;
    setServices((cur) => [...cur, { id: nextServiceId++, name: svcName.trim(), price: Number(svcPrice) || 0, duration: svcDuration }]);
    setSvcName("");
    setSvcPrice("");
  }

  function removeService(id: number) {
    setServices((cur) => cur.filter((s) => s.id !== id));
  }

  function addStaff() {
    if (!stName.trim()) return;
    setStaff((cur) => [...cur, { id: nextStaffId++, name: stName.trim(), role: stRole.trim() || "Radnik", status: stSend ? "invited" : "draft" }]);
    setStName("");
    setStRole("");
    setStEmail("");
  }

  function removeStaff(id: number) {
    setStaff((cur) => cur.filter((s) => s.id !== id));
  }

  function inviteStaff(person: DraftStaff) {
    setStaff((cur) => cur.map((s) => (s.id === person.id ? { ...s, status: "invited" } : s)));
    flash(t("staffInvitedToast", { name: person.name }));
  }

  function setDay(index: number, patch: Partial<DayHours>) {
    setHours((cur) => cur.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  function applyMondayToAll() {
    const mon = hours[0];
    setHours((cur) => cur.map((d) => ({ ...d, open: true, from: mon.from, to: mon.to })));
  }

  const openDaysCount = hours.filter((d) => d.open).length;

  const STAFF_BADGE: Record<StaffStatus, { label: string; icon: typeof Store; tone: "success" | "info" | "neutral" }> = {
    owner: { label: t("staffBadgeOwner"), icon: Store, tone: "info" },
    invited: { label: t("staffBadgeInvited"), icon: Mail, tone: "success" },
    draft: { label: t("staffBadgeDraft"), icon: Info, tone: "neutral" },
  };

  const HEADS: Record<Step, { title: string; sub: string }> = {
    1: { title: t("headPhotosTitle"), sub: t("headPhotosSub") },
    2: { title: t("headServicesTitle"), sub: t("headServicesSub") },
    3: { title: t("headStaffTitle"), sub: t("headStaffSub") },
    4: { title: t("headHoursTitle"), sub: t("headHoursSub") },
    5: { title: t("headReviewTitle"), sub: t("headReviewSub") },
  };
  const head = sent ? { title: t("headSentTitle"), sub: t("headSentSub") } : HEADS[step];

  const STEP_LABELS = [t("stepPhotos"), t("stepServices"), t("stepStaff"), t("stepHours"), t("stepReview")];
  const cur = sent ? TOTAL_STEPS + 1 : step;

  function primaryAction() {
    if (sent) return;
    if (step < TOTAL_STEPS) {
      setStep((s) => (s + 1) as Step);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="flex min-h-full flex-col bg-surface-canvas">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-border-subtle bg-card/90 px-4 py-3 backdrop-blur-md lg:px-10">
        <Link href="/" className="text-lg font-bold tracking-tight text-text-primary">
          Sredi<span className="text-accent-hover">Me</span>
        </Link>
        <Badge variant="info">{t("topBarBadge")}</Badge>
        <div className="flex-1" />
        <span className="hidden text-sm text-text-muted lg:inline">{t("autoSaveNote")}</span>
        <Button type="button" variant="secondary" size="sm" onClick={() => flash(t("continueLaterToast"))}>
          {t("continueLater")}
        </Button>
      </div>

      <main className="mx-auto flex w-full max-w-[1000px] flex-1 flex-col gap-6 px-4 py-6 lg:px-10 lg:py-10">
        <div className="flex flex-col gap-2">
          <span className="eyebrow">
            {SALON_NAME} · {SALON_CITY}
          </span>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">{head.title}</h1>
          <p className="max-w-[640px] text-base leading-relaxed text-text-secondary">{head.sub}</p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:gap-2.5">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const done = cur > n;
            const isCurrent = cur === n;
            return (
              <span key={label} className={cn("flex min-w-0 items-center gap-1.5 sm:gap-2.5", n < TOTAL_STEPS ? "flex-1" : "flex-none")}>
                <button
                  type="button"
                  onClick={() => goTo(n as Step)}
                  className={cn(
                    "flex h-7.5 w-7.5 flex-none items-center justify-center rounded-full text-xs font-bold transition-colors",
                    done ? "bg-success-bg text-success-fg" : isCurrent ? "bg-brand text-brand-on" : "bg-surface-sunken text-text-muted",
                  )}
                >
                  {done ? <Icon icon={Check} size={15} /> : n}
                </button>
                <span className={cn("truncate text-xs font-medium", isCurrent ? "text-text-primary" : "hidden text-text-muted sm:inline")}>{label}</span>
                {n < TOTAL_STEPS && <span className={cn("h-0.5 min-w-[4px] flex-1 rounded-full", done ? "bg-brand" : "bg-border-subtle")} />}
              </span>
            );
          })}
        </div>

        {!sent && step === 1 && (
          <div className="flex flex-col gap-4 rounded-card bg-card p-4 shadow-card lg:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-lg font-bold tracking-tight text-text-primary">{t("photosCardTitle")}</span>
              <span className="text-sm text-text-muted">{t("photosCount", { count: photoCount })}</span>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3 sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))]">
              {Array.from({ length: photoCount }).map((_, i) => (
                <div
                  key={i}
                  className="relative flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-image bg-gradient-to-br from-indigo-100 to-indigo-200 p-2.5 text-center text-indigo-400"
                >
                  <Icon icon={ImageIcon} size={22} />
                  <span className="text-2xs font-medium leading-tight">{PHOTO_CAPTIONS[i % PHOTO_CAPTIONS.length]}</span>
                  {i === 0 && (
                    <span className="absolute left-2 top-2 inline-flex h-[22px] items-center rounded-full bg-brand px-2 text-2xs font-semibold text-brand-on">
                      {t("photoCoverBadge")}
                    </span>
                  )}
                  <button
                    type="button"
                    aria-label={t("photoRemoveAria")}
                    onClick={() => setPhotoCount((c) => Math.max(0, c - 1))}
                    className="absolute right-2 top-2 flex h-6.5 w-6.5 items-center justify-center rounded-full bg-card text-danger-fg shadow-card"
                  >
                    <Icon icon={X} size={14} />
                  </button>
                </div>
              ))}
              {photoCount < 10 && (
                <button
                  type="button"
                  aria-label={t("photoAddAria")}
                  onClick={() => setPhotoCount((c) => Math.min(10, c + 1))}
                  className="flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-image border border-dashed border-indigo-200 bg-card p-2.5 text-center text-brand"
                >
                  <Icon icon={ImagePlus} size={22} />
                  <span className="text-2xs font-medium leading-tight">{t("photoAddLabel", { count: photoCount })}</span>
                </button>
              )}
            </div>
            <div className="flex items-start gap-2.5 rounded-control bg-surface-sunken p-3.5">
              <Icon icon={Info} size={16} className="mt-0.5 flex-none text-icon-muted" />
              <span className="text-xs leading-relaxed text-text-secondary">{t("photosInfoNote")}</span>
            </div>
          </div>
        )}

        {!sent && step === 2 && (
          <div className="flex flex-col gap-4 rounded-card bg-card p-4 shadow-card lg:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-lg font-bold tracking-tight text-text-primary">{t("servicesCardTitle")}</span>
              <span className="text-sm text-text-muted">{pluralBs(services.length, t("servicesCountOne", { count: services.length }), t("servicesCountFew", { count: services.length }), t("servicesCountMany", { count: services.length }))}</span>
            </div>

            <div className="flex flex-col">
              {services.map((s) => (
                <div key={s.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border-subtle py-3 sm:grid-cols-[minmax(0,1fr)_100px_auto]">
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-base font-semibold text-text-primary">{s.name}</span>
                    <span className="text-sm text-text-secondary">{t("durationMinutes", { min: s.duration })}</span>
                  </span>
                  <span className="price row-start-1 justify-self-end text-base sm:col-start-2 sm:row-start-1 sm:justify-self-end">
                    {s.price} KM
                  </span>
                  <span className="col-span-2 row-start-2 flex justify-end gap-1.5 sm:col-span-1 sm:col-start-3 sm:row-start-1">
                    <button
                      type="button"
                      aria-label={t("editServiceAria")}
                      onClick={() => flash(t("editServiceToast"))}
                      className="flex h-8.5 w-8.5 items-center justify-center rounded-control border border-border-subtle bg-card text-icon-default hover:bg-brand-subtle"
                    >
                      <Icon icon={Pencil} size={16} />
                    </button>
                    <button
                      type="button"
                      aria-label={t("removeServiceAria")}
                      onClick={() => removeService(s.id)}
                      className="flex h-8.5 w-8.5 items-center justify-center rounded-control border border-border-subtle bg-card text-danger-fg hover:bg-danger-bg"
                    >
                      <Icon icon={X} size={16} />
                    </button>
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 rounded-control bg-surface-sunken p-4">
              <span className="eyebrow">{t("servicesAddTitle")}</span>
              <div className="grid grid-cols-1 items-end gap-2.5 sm:grid-cols-[minmax(0,1.6fr)_110px_120px_auto]">
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-sm font-medium text-text-primary">{t("serviceNameLabel")}</span>
                  <Input value={svcName} onChange={(e) => setSvcName(e.target.value)} placeholder={t("serviceNamePlaceholder")} />
                </label>
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-sm font-medium text-text-primary">{t("servicePriceLabel")}</span>
                  <Input value={svcPrice} onChange={(e) => setSvcPrice(e.target.value)} placeholder={t("servicePricePlaceholder")} inputMode="decimal" />
                </label>
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-xs text-text-secondary">{t("serviceDurationLabel")}</span>
                  <Select value={svcDuration} onChange={(e) => setSvcDuration(Number(e.target.value))}>
                    {DURATIONS.map((d) => (
                      <option key={d} value={d}>
                        {t("durationMinutes", { min: d })}
                      </option>
                    ))}
                  </Select>
                </label>
                <Button type="button" variant="primary" size="md" onClick={addService} disabled={!svcName.trim()}>
                  {t("addService")}
                </Button>
              </div>
            </div>
          </div>
        )}

        {!sent && step === 3 && (
          <div className="flex flex-col gap-4 rounded-card bg-card p-4 shadow-card lg:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-lg font-bold tracking-tight text-text-primary">{t("staffCardTitle")}</span>
              <span className="text-sm text-text-muted">{pluralBs(staff.length, t("staffCountOne", { count: staff.length }), t("staffCountFew", { count: staff.length }), t("staffCountMany", { count: staff.length }))}</span>
            </div>

            <div className="flex flex-col gap-3">
              {staff.map((p) => {
                const badge = STAFF_BADGE[p.status];
                return (
                  <div key={p.id} className="grid grid-cols-[48px_minmax(0,1fr)] items-center gap-3.5 rounded-control border border-border-subtle p-3.5 sm:grid-cols-[48px_minmax(0,1fr)_auto]">
                    <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-brand-subtle text-base font-bold text-brand">{initialsFromName(p.name)}</span>
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="text-base font-semibold text-text-primary">{p.name}</span>
                      <span className="text-sm text-text-secondary">{p.role}</span>
                      <Badge variant={badge.tone} className="self-start">
                        <Icon icon={badge.icon} size={12} />
                        {badge.label}
                      </Badge>
                    </span>
                    <span className="col-span-2 flex flex-wrap gap-2 sm:col-span-1 sm:justify-end">
                      {p.status === "draft" && (
                        <Button type="button" variant="secondary" size="sm" onClick={() => inviteStaff(p)}>
                          <Icon icon={UserPlus} size={14} />
                          {t("sendInviteCta")}
                        </Button>
                      )}
                      <button
                        type="button"
                        aria-label={t("removeStaffAria")}
                        onClick={() => removeStaff(p.id)}
                        className="flex h-8.5 w-8.5 items-center justify-center rounded-control border border-border-subtle bg-card text-danger-fg hover:bg-danger-bg"
                      >
                        <Icon icon={X} size={16} />
                      </button>
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 rounded-control bg-surface-sunken p-4">
              <span className="eyebrow">{t("staffAddTitle")}</span>
              <div className="grid grid-cols-1 items-end gap-2.5 sm:grid-cols-[110px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)]">
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-xs text-text-secondary">{t("staffPhotoLabel")}</span>
                  <button
                    type="button"
                    onClick={() => flash(t("staffPhotoUploadToast"))}
                    className="flex h-11 items-center justify-center gap-1.5 rounded-control border border-dashed border-indigo-200 bg-card text-sm font-medium text-brand"
                  >
                    <Icon icon={ImagePlus} size={16} />
                    {t("staffPhotoAdd")}
                  </button>
                </label>
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-sm font-medium text-text-primary">{t("staffNameLabel")}</span>
                  <Input value={stName} onChange={(e) => setStName(e.target.value)} placeholder={t("staffNamePlaceholder")} />
                </label>
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-sm font-medium text-text-primary">{t("staffRoleLabel")}</span>
                  <Input value={stRole} onChange={(e) => setStRole(e.target.value)} placeholder={t("staffRolePlaceholder")} />
                </label>
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-sm font-medium text-text-primary">{t("staffEmailLabel")}</span>
                  <Input value={stEmail} onChange={(e) => setStEmail(e.target.value)} placeholder={t("staffEmailPlaceholder")} type="email" />
                </label>
              </div>
              <label className="flex cursor-pointer items-start gap-2.5">
                <Checkbox checked={stSend} onCheckedChange={setStSend} className="mt-0.5" />
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-text-primary">{t("staffSendNowLabel")}</span>
                  <span className="text-xs leading-relaxed text-text-secondary">{t("staffSendNowDescription")}</span>
                </span>
              </label>
              <Button type="button" variant="primary" size="md" className="self-start" onClick={addStaff} disabled={!stName.trim()}>
                <Icon icon={UserPlus} size={16} />
                {t("addStaff")}
              </Button>
            </div>
          </div>
        )}

        {!sent && step === 4 && (
          <div className="flex flex-col gap-4 rounded-card bg-card p-4 shadow-card lg:p-6">
            <div className="flex flex-col gap-1">
              <span className="text-lg font-bold tracking-tight text-text-primary">{t("hoursCardTitle")}</span>
              <span className="text-sm leading-relaxed text-text-secondary">{t("hoursCardSub")}</span>
            </div>
            <div className="flex flex-col">
              {hours.map((d, i) => (
                <div key={d.day} className="grid grid-cols-1 items-center gap-3 border-b border-border-subtle py-3 sm:grid-cols-[180px_minmax(0,1fr)_auto]">
                  <label className="flex min-w-0 cursor-pointer items-center gap-2.5">
                    <Checkbox checked={d.open} onCheckedChange={(v) => setDay(i, { open: v })} />
                    <span className="font-medium text-text-primary">{d.day}</span>
                  </label>
                  {d.open ? (
                    <span className="flex min-w-0 flex-wrap items-center gap-2">
                      <Select value={d.from} onChange={(e) => setDay(i, { from: e.target.value })} className="w-[104px]">
                        {TIMES.map((tm) => (
                          <option key={tm} value={tm}>
                            {tm}
                          </option>
                        ))}
                      </Select>
                      <span className="text-sm text-text-muted">{t("hoursToLabel")}</span>
                      <Select value={d.to} onChange={(e) => setDay(i, { to: e.target.value })} className="w-[104px]">
                        {TIMES.map((tm) => (
                          <option key={tm} value={tm}>
                            {tm}
                          </option>
                        ))}
                      </Select>
                    </span>
                  ) : (
                    <span className="text-sm text-text-muted">{t("hoursClosedLabel")}</span>
                  )}
                  {i === 0 && (
                    <button type="button" onClick={applyMondayToAll} className="justify-self-start text-xs font-medium text-brand hover:underline sm:justify-self-end">
                      {t("copyMonday")}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!sent && step === 5 && (
          <div className="flex flex-col gap-4 rounded-card bg-card p-4 shadow-card lg:p-6">
            <div className="flex items-start gap-3 rounded-control bg-warning-bg p-4">
              <Icon icon={TriangleAlert} size={20} className="mt-0.5 flex-none text-warning-fg" />
              <span className="flex flex-col gap-1">
                <span className="text-base font-bold text-warning-fg">{t("reviewWarningTitle")}</span>
                <span className="text-sm leading-relaxed text-text-secondary">{t("reviewWarningBody")}</span>
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="eyebrow">{t("reviewSummaryTitle")}</span>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  {
                    icon: ImageIcon,
                    value: pluralBs(photoCount, t("summaryPhotosOne", { count: photoCount }), t("summaryPhotosFew", { count: photoCount }), t("summaryPhotosMany", { count: photoCount })),
                    label: t("summaryPhotosLabel"),
                    step: 1 as Step,
                  },
                  {
                    icon: Tag,
                    value: pluralBs(services.length, t("servicesCountOne", { count: services.length }), t("servicesCountFew", { count: services.length }), t("servicesCountMany", { count: services.length })),
                    label: t("summaryServicesLabel"),
                    step: 2 as Step,
                  },
                  {
                    icon: Users,
                    value: pluralBs(staff.length, t("staffCountOne", { count: staff.length }), t("staffCountFew", { count: staff.length }), t("staffCountMany", { count: staff.length })),
                    label: t("summaryStaffLabel"),
                    step: 3 as Step,
                  },
                  {
                    icon: CalendarDays,
                    value: pluralBs(openDaysCount, t("summaryHoursOne", { count: openDaysCount }), t("summaryHoursFew", { count: openDaysCount }), t("summaryHoursMany", { count: openDaysCount })),
                    label: t("summaryHoursLabel"),
                    step: 4 as Step,
                  },
                ].map((s) => (
                  <div key={s.label} className="flex min-w-0 items-center gap-3 rounded-control border border-border-subtle p-3.5">
                    <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-brand-subtle text-brand">
                      <Icon icon={s.icon} size={17} />
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-sm font-semibold text-text-primary">{s.value}</span>
                      <span className="text-xs text-text-secondary">{s.label}</span>
                    </span>
                    <span className="flex-1" />
                    <button type="button" onClick={() => goTo(s.step)} className="text-xs font-medium text-brand hover:underline">
                      {t("editCta")}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="eyebrow">{t("reviewNextTitle")}</span>
              {[
                { icon: Mail, label: t("nextStep1") },
                { icon: Settings, label: t("nextStep2") },
                { icon: Store, label: t("nextStep3") },
              ].map((n) => (
                <span key={n.label} className="inline-flex items-start gap-2.5 text-sm leading-relaxed text-text-secondary">
                  <Icon icon={n.icon} size={16} className="mt-0.5 flex-none text-brand" />
                  {n.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {sent && (
          <div className="flex flex-col items-center gap-3.5 rounded-card bg-card p-6 text-center shadow-card lg:p-10">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-bg text-success-fg">
              <Icon icon={CircleCheck} size={28} />
            </span>
            <span className="text-xl font-bold tracking-tight text-text-primary">{t("sentTitle")}</span>
            <span className="max-w-[460px] text-sm leading-relaxed text-text-secondary">{t("sentBody", { salon: SALON_NAME })}</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-warning-bg px-3 py-1 text-2xs font-semibold text-warning-fg">
              <Icon icon={CalendarIcon} size={13} />
              {t("sentStatusBadge")}
            </span>
            <Link
              href="/dashboard"
              onClick={() => flash(t("openDashboardToast"))}
              className="mt-1 inline-flex h-[52px] items-center gap-2 rounded-control bg-brand px-6 text-base font-medium text-brand-on hover:bg-brand-hover"
            >
              {t("openDashboard")}
              <Icon icon={ArrowRight} size={18} />
            </Link>
          </div>
        )}

        {!sent && (
          <div className="flex flex-wrap items-center gap-3">
            {step > 1 && (
              <Button type="button" variant="secondary" size="lg" onClick={() => setStep((s) => (s - 1) as Step)}>
                <Icon icon={ArrowLeft} size={16} />
                {t("backCta")}
              </Button>
            )}
            <div className="flex-1" />
            {(step === 1 || step === 3) && (
              <Button type="button" variant="ghost" size="lg" onClick={primaryAction}>
                {t("skipCta")}
              </Button>
            )}
            <Button type="button" variant={step < TOTAL_STEPS ? "primary" : "accent"} size="lg" onClick={primaryAction}>
              {step < TOTAL_STEPS ? t("continueCta") : t("submitCta")}
              <Icon icon={step < TOTAL_STEPS ? ArrowRight : Send} size={18} />
            </Button>
          </div>
        )}
      </main>

      {toast && <Toast message={toast} />}
    </div>
  );
}
