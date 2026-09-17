"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CalendarCheck,
  Check,
  Clock,
  Info,
  Scissors,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Navbar } from "@/components/chrome/navbar";
import { Footer } from "@/components/chrome/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { formatPrice, formatDayLabel, formatWeekdayShort } from "@/lib/format";
import { computeSlots, countFreeSlots } from "@/lib/api/availability";
import type { Salon, Service, Worker } from "@/types/entities";

type Step = 0 | 1 | 2 | 3;
const DAY_WINDOW = 14;

function freeWord(n: number, t: (key: string) => string) {
  if (n === 1) return t("freeOne");
  if (n >= 2 && n <= 4) return t("freeFew");
  return t("freeMany");
}

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function BookingWizard({
  salon,
  services,
  workers,
  initialServiceId,
  initialWorkerId,
}: {
  salon: Salon;
  services: Service[];
  workers: Worker[];
  initialServiceId?: number;
  initialWorkerId?: number;
}) {
  const t = useTranslations("booking");
  const solo = workers.length === 1;

  const [serviceId, setServiceId] = useState<number | null>(initialServiceId ?? null);
  const [workerChoice, setWorkerChoice] = useState<number | "any" | null>(initialWorkerId ?? null);
  const [step, setStep] = useState<Step>(() => {
    if (!initialServiceId) return 0;
    if (solo) return 2;
    return initialWorkerId ? 2 : 1;
  });
  const [reached, setReached] = useState<Step>(step);
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [wantsReminder, setWantsReminder] = useState(true);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [done, setDone] = useState(false);

  const service = services.find((s) => s.id === serviceId) ?? null;
  const eligibleWorkers = service ? workers.filter((w) => service.workerIds.includes(w.id)) : workers;
  const worker = workerChoice && workerChoice !== "any" ? workers.find((w) => w.id === workerChoice) ?? null : null;
  const activeWorkerIds = useMemo(
    () => (workerChoice === "any" ? eligibleWorkers.map((w) => w.id) : worker ? [worker.id] : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- eligibleWorkers/worker are derived fresh each render from stable ids
    [workerChoice, service?.id, worker?.id],
  );

  function go(next: Step) {
    setStep(next);
    setReached((r) => (r > next ? r : next) as Step);
  }

  function pickService(id: number) {
    setServiceId(id);
    if (workerChoice != null) go(2);
    else go(solo ? 2 : 1);
  }

  function pickWorker(choice: number | "any") {
    setWorkerChoice(choice);
    go(2);
  }

  function pickSlot(date: Date, time: string) {
    setSelectedDate(startOfDay(date));
    setSelectedTime(time);
    go(3);
  }

  const days = useMemo(() => {
    const list: Date[] = [];
    const base = startOfDay(new Date());
    for (let i = 0; i < DAY_WINDOW; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      list.push(d);
    }
    return list;
  }, []);

  const slots = useMemo(
    () => (service && activeWorkerIds.length ? computeSlots({ salon, service, workerIds: activeWorkerIds, date: selectedDate }) : []),
    [salon, service, activeWorkerIds, selectedDate],
  );
  const freeSlots = slots.filter((s) => !s.taken);
  const firstFreeSlot = freeSlots[0] ?? null;

  const firstFreeDay = useMemo(() => {
    if (!service || !activeWorkerIds.length) return null;
    for (const d of days) {
      if (countFreeSlots({ salon, service, workerIds: activeWorkerIds, date: d }) > 0) return d;
    }
    return null;
  }, [salon, service, activeWorkerIds, days]);

  const groups = useMemo(() => {
    const parts: { label: string; from: number; to: number }[] = [
      { label: "Jutro", from: 0, to: 720 },
      { label: "Popodne", from: 720, to: 1020 },
      { label: "Veče", from: 1020, to: 1440 },
    ];
    return parts
      .map((p) => ({
        label: p.label,
        items: slots.filter((s) => {
          const [h, m] = s.time.split(":").map(Number);
          const minutes = h * 60 + m;
          return minutes >= p.from && minutes < p.to;
        }),
      }))
      .filter((g) => g.items.length > 0);
  }, [slots]);

  const labels = solo ? [t("stepService"), t("stepTime"), t("stepReview")] : [t("stepService"), t("stepStaff"), t("stepTime"), t("stepReview")];
  const stepIndexes = solo ? [0, 2, 3] : [0, 1, 2, 3];
  const currentLabelIndex = done ? labels.length : stepIndexes.indexOf(step);

  const canNext = step === 0 ? !!serviceId : step === 1 ? !!workerChoice : step === 2 ? !!selectedTime : !!(clientName.trim() && clientPhone.trim() && clientEmail.trim());

  function handleNext() {
    if (!canNext) return;
    if (step === 3) {
      setDone(true);
      return;
    }
    if (step === 2) go(3);
    else if (step === 0) go(solo ? 2 : 1);
    else if (step === 1) go(2);
  }

  function handleBack() {
    if (step === 3) go(2);
    else if (step === 2) go(solo ? 0 : 1);
    else if (step === 1) go(0);
  }

  function restart() {
    setStep(0);
    setReached(0);
    setServiceId(null);
    setWorkerChoice(null);
    setSelectedTime(null);
    setDone(false);
  }

  const timeStr = selectedTime ? `${formatDayLabel(selectedDate)}, ${selectedTime}` : t("recapTimeUnset");
  const recap = service
    ? [
        { icon: Scissors, label: t("recapService"), value: service.name },
        {
          icon: User,
          label: t("recapStaff"),
          value: solo && worker ? t("recapStaffSolo", { name: worker.name }) : worker ? worker.name : t("recapStaffAny"),
        },
        { icon: Calendar, label: t("recapTime"), value: timeStr },
        { icon: Clock, label: t("recapDuration"), value: `${service.durationMinutes} min` },
      ]
    : [];

  const barLine = step === 2 && !selectedTime ? t("barLinePickTime") : service ? `${service.name} · ${selectedTime ? `${formatDayLabel(selectedDate)}, ${selectedTime}` : `${service.durationMinutes} min`}` : "";

  return (
    <div className="flex min-h-full flex-col bg-surface-canvas">
      <Navbar />

      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-6 pb-28 pt-6 md:gap-7 md:pb-12">
        <div className="flex items-center gap-3">
          <Link
            href={done ? "/" : `/saloni/${salon.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-brand"
          >
            <Icon icon={ArrowLeft} size={16} />
            {t("backToSalon", { name: salon.name })}
          </Link>
        </div>

        {!done && (
          <div className="hidden items-center gap-3 rounded-card bg-card p-4 shadow-card md:flex">
            {labels.map((label, i) => {
              const isDone = i < currentLabelIndex;
              const isActive = i === currentLabelIndex;
              return (
                <div key={label} className="flex flex-1 items-center gap-3 last:flex-none">
                  <button
                    type="button"
                    onClick={() => stepIndexes[i] <= reached && go(stepIndexes[i] as Step)}
                    className="flex items-center gap-2.5"
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-bold",
                        isDone || isActive ? "bg-brand text-primary-foreground" : "bg-surface-sunken text-text-muted",
                      )}
                    >
                      {isDone ? <Icon icon={Check} size={14} /> : i + 1}
                    </span>
                    <span
                      className={cn(
                        "text-sm whitespace-nowrap",
                        isActive ? "font-semibold text-text-primary" : isDone ? "font-medium text-brand" : "font-medium text-text-muted",
                      )}
                    >
                      {label}
                    </span>
                  </button>
                  {i < labels.length - 1 && <span className={cn("h-px flex-1", i < currentLabelIndex ? "bg-brand" : "bg-border-subtle")} />}
                </div>
              );
            })}
          </div>
        )}

        {!done && (
          <div className="flex flex-col gap-2 md:hidden">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-semibold text-text-primary">{t("stepLabel", { n: currentLabelIndex + 1, label: labels[currentLabelIndex] })}</span>
              <span className="text-xs text-text-secondary">{t("stepCount", { n: currentLabelIndex + 1, total: labels.length })}</span>
            </div>
            <div className="flex gap-1">
              {labels.map((label, i) => (
                <span
                  key={label}
                  className={cn("h-1 flex-1 rounded-full", i <= currentLabelIndex ? "bg-brand" : "bg-border-subtle")}
                />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex min-w-0 flex-col gap-5">
            {done ? (
              <div className="flex flex-col gap-4 rounded-card bg-card p-6 shadow-card">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-info-bg text-info-fg">
                    <Icon icon={CalendarCheck} size={22} />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">{t("doneTitle")}</h2>
                    <p className="mt-1 text-sm text-text-secondary">{t("doneSub")}</p>
                  </div>
                </div>
                <div className="h-px bg-border-subtle" />
                <div className="flex flex-col gap-2.5">
                  {recap.map((r) => (
                    <div key={r.label} className="flex items-center gap-3 text-sm">
                      <Icon icon={r.icon} size={16} className="flex-none text-icon-muted" />
                      <span className="text-text-secondary">{r.label}</span>
                      <span className="flex-1" />
                      <span className="text-right font-semibold text-text-primary">{r.value}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-md bg-surface-sunken px-4 py-3 text-sm text-text-secondary">
                  {t("paymentCancelNote")}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="primary" size="md">
                    <Link href="/moji-termini">{t("myBookings")}</Link>
                  </Button>
                  <Button type="button" variant="secondary" size="md" onClick={restart}>
                    {t("bookAnother")}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {step === 0 && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-text-primary md:text-2xl">{t("serviceTitle")}</h2>
                      <p className="mt-1.5 text-sm text-text-secondary">{t("serviceLead")}</p>
                    </div>
                    <div className="flex flex-col gap-1 rounded-card bg-card p-2 shadow-card">
                      {services.map((s) => {
                        const selected = s.id === serviceId;
                        const oldPrice = s.discountPercent ? Number(s.price) / (1 - s.discountPercent / 100) : null;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => pickService(s.id)}
                            className={cn(
                              "flex items-center justify-between gap-4 rounded-control p-3.5 text-left transition-colors",
                              selected ? "bg-brand-subtle" : "hover:bg-surface-sunken",
                            )}
                          >
                            <div className="flex min-w-0 flex-col gap-1">
                              <span className="font-bold text-text-primary">{s.name}</span>
                              <span className="text-sm text-text-secondary">{s.durationMinutes} min</span>
                            </div>
                            <div className="flex flex-none items-center gap-3">
                              <div className="flex flex-col items-end">
                                {oldPrice && <span className="text-xs text-text-muted line-through">{formatPrice(oldPrice)}</span>}
                                <span className="price text-base">{formatPrice(s.price)}</span>
                              </div>
                              <span
                                className={cn(
                                  "inline-flex h-9 items-center rounded-control px-3.5 text-sm font-medium",
                                  selected ? "bg-brand text-primary-foreground" : "border border-border-subtle bg-card text-brand",
                                )}
                              >
                                {selected ? t("serviceSelected") : t("serviceSelect")}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-text-primary md:text-2xl">{t("staffTitle")}</h2>
                      <p className="mt-1.5 text-sm text-text-secondary">{t("staffLead")}</p>
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
                      <button
                        type="button"
                        onClick={() => pickWorker("any")}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-card p-4 text-center shadow-card",
                          workerChoice === "any" ? "bg-brand-subtle ring-1 ring-inset ring-indigo-200" : "bg-card",
                        )}
                      >
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-sunken text-icon-muted">
                          <Icon icon={User} size={20} />
                        </span>
                        <span className="text-sm font-bold text-text-primary">{t("staffAnyName")}</span>
                        <span className="text-xs text-text-secondary">{t("staffAnyRole")}</span>
                      </button>
                      {eligibleWorkers.map((w) => (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => pickWorker(w.id)}
                          className={cn(
                            "flex flex-col items-center gap-2 rounded-card p-4 text-center shadow-card",
                            workerChoice === w.id ? "bg-brand-subtle ring-1 ring-inset ring-indigo-200" : "bg-card",
                          )}
                        >
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-400">
                            {w.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                          </span>
                          <span className="text-sm font-bold text-text-primary">{w.name}</span>
                          <span className="text-xs text-text-secondary">{w.position}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && service && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-text-primary md:text-2xl">{t("timeTitle")}</h2>
                      <p className="mt-1.5 text-sm text-text-secondary">
                        {t("timeLead", { duration: service.durationMinutes })}
                      </p>
                    </div>

                    {firstFreeSlot && (
                      <div className="flex flex-col gap-2.5 rounded-card bg-card p-4 shadow-card">
                        <span className="eyebrow">{t("quickFirstFreeTag")}</span>
                        <button
                          type="button"
                          onClick={() => pickSlot(selectedDate, firstFreeSlot.time)}
                          className={cn(
                            "inline-flex w-fit items-center rounded-control px-3.5 py-2 text-sm font-bold",
                            selectedTime === firstFreeSlot.time
                              ? "bg-brand text-primary-foreground"
                              : "bg-brand-subtle text-brand",
                          )}
                        >
                          {formatDayLabel(selectedDate)}, {firstFreeSlot.time}
                        </button>
                      </div>
                    )}

                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {days.map((d) => {
                        const count = service ? countFreeSlots({ salon, service, workerIds: activeWorkerIds, date: d }) : 0;
                        const isSelected = isSameDay(d, selectedDate);
                        const isClosed = !computeSlots({ salon, service, workerIds: activeWorkerIds, date: d }).length && count === 0;
                        return (
                          <button
                            key={d.toISOString()}
                            type="button"
                            onClick={() => setSelectedDate(startOfDay(d))}
                            className={cn(
                              "flex flex-none flex-col items-center gap-0.5 rounded-control px-0 py-2.5",
                              isSelected ? "bg-brand text-primary-foreground" : "border border-border-subtle bg-card text-text-primary",
                            )}
                            style={{ width: 70 }}
                          >
                            <span className="text-2xs uppercase tracking-wide opacity-75">{formatWeekdayShort(d)}</span>
                            <span className="text-lg font-bold leading-tight">{d.getDate()}</span>
                            <span className={cn("text-2xs", isSelected ? "opacity-85" : count > 0 ? "text-success-fg" : "text-text-muted")}>
                              {count > 0 ? `${count} ${freeWord(count, t)}` : isClosed ? t("dayClosed") : t("dayFull")}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {freeSlots.length === 0 ? (
                      <div className="flex flex-col items-center gap-3 rounded-card bg-card p-8 text-center shadow-card">
                        <span className="text-sm text-text-secondary">{t("emptyDayTitle")}</span>
                        {firstFreeDay && (
                          <Button type="button" variant="secondary" size="sm" onClick={() => setSelectedDate(startOfDay(firstFreeDay))}>
                            {t("jumpToFirstFree", { day: formatDayLabel(firstFreeDay) })}
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {groups.map((g) => (
                          <div key={g.label} className="flex flex-col gap-2.5 rounded-card bg-card p-4 shadow-card">
                            <span className="text-sm font-bold text-text-primary">{g.label}</span>
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(76px,1fr))] gap-2">
                              {g.items.map((slot) => (
                                <button
                                  key={slot.time}
                                  type="button"
                                  disabled={slot.taken}
                                  onClick={() => pickSlot(selectedDate, slot.time)}
                                  className={cn(
                                    "h-9 rounded-control text-sm font-medium",
                                    slot.taken
                                      ? "cursor-not-allowed bg-surface-sunken text-text-muted line-through"
                                      : selectedTime === slot.time
                                        ? "bg-brand text-primary-foreground"
                                        : "border border-border-subtle bg-card text-text-primary hover:bg-brand-subtle",
                                  )}
                                >
                                  {slot.time}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {step === 3 && service && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-text-primary md:text-2xl">{t("reviewTitle")}</h2>
                      <p className="mt-1.5 text-sm text-text-secondary">{t("reviewLead")}</p>
                    </div>

                    <div className="flex flex-col rounded-card bg-card p-2 shadow-card">
                      {recap.map((r, i) => (
                        <div
                          key={r.label}
                          className={cn("flex items-center gap-3 p-3.5", i < recap.length - 1 && "border-b border-border-subtle")}
                        >
                          <Icon icon={r.icon} size={16} className="flex-none text-icon-muted" />
                          <div className="flex min-w-0 flex-1 flex-col">
                            <span className="text-xs text-text-secondary">{r.label}</span>
                            <span className="text-sm font-semibold text-text-primary">{r.value}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => go(r.label === t("recapService") ? 0 : r.label === t("recapStaff") ? (solo ? 0 : 1) : 2)}
                            className="h-9 flex-none rounded-control border border-border-subtle bg-card px-3.5 text-sm font-medium text-brand"
                          >
                            {t("edit")}
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-4 rounded-card bg-card p-5 shadow-card">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <label className="flex flex-col gap-1.5">
                          <span className="text-sm font-medium text-text-primary">{t("clientNameLabel")}</span>
                          <Input value={clientName} onChange={(e) => setClientName(e.target.value)} />
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className="text-sm font-medium text-text-primary">{t("clientPhoneLabel")}</span>
                          <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} type="tel" />
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className="text-sm font-medium text-text-primary">{t("clientEmailLabel")}</span>
                          <Input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} type="email" />
                        </label>
                      </div>
                      <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-text-primary">{t("noteLabel")}</span>
                        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("notePlaceholder")} />
                      </label>
                      <label className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={wantsReminder}
                          onChange={(e) => setWantsReminder(e.target.checked)}
                          className="mt-0.5 h-5 w-5 flex-none accent-[var(--brand)]"
                        />
                        <span>
                          <span className="block text-sm font-medium text-text-primary">{t("reminderLabel")}</span>
                          <span className="block text-xs text-text-secondary">{t("reminderSub")}</span>
                        </span>
                      </label>
                      <div className="flex gap-3 rounded-md bg-info-bg p-3.5 text-info-fg">
                        <Icon icon={Info} size={18} className="flex-none" />
                        <span className="text-sm">{t("pendingNotice")}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="hidden flex-wrap gap-3 md:flex">
                  {step > 0 && (
                    <Button type="button" variant="secondary" size="md" onClick={handleBack}>
                      <Icon icon={ArrowLeft} size={18} />
                      {t("back")}
                    </Button>
                  )}
                  <Button type="button" variant="accent" size="md" disabled={!canNext} onClick={handleNext}>
                    {step === 3 ? t("confirm") : t("next")}
                    <Icon icon={step === 3 ? CalendarCheck : ArrowRight} size={18} />
                  </Button>
                </div>
              </>
            )}
          </div>

          {!done && service && (
            <div className="hidden flex-col gap-3 rounded-card bg-card p-6 shadow-card lg:sticky lg:top-24 lg:flex">
              <span className="eyebrow">{t("yourBooking")}</span>
              <span className="text-lg font-bold text-text-primary">{salon.name}</span>
              <span className="text-xs text-text-secondary">{salon.address}</span>
              <div className="h-px bg-border-subtle" />
              {recap.map((r) => (
                <div key={r.label} className="flex items-start gap-2.5 text-sm">
                  <Icon icon={r.icon} size={16} className="mt-0.5 flex-none text-icon-muted" />
                  <span className={r.label === t("recapTime") && !selectedTime ? "text-text-secondary" : "text-text-primary"}>
                    {r.value}
                  </span>
                </div>
              ))}
              <div className="h-px bg-border-subtle" />
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-text-secondary">{t("total")}</span>
                <span className="text-2xl font-bold text-text-primary">{formatPrice(service.price)}</span>
              </div>
              <span className="text-xs text-text-secondary">{t("paymentCancelNote")}</span>
            </div>
          )}
        </div>
      </main>

      {!done && service && (
        <div className="sticky bottom-0 z-10 flex items-center gap-3 border-t border-border-subtle bg-white/86 px-4 py-3 shadow-inset-line backdrop-blur-sticky md:hidden">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-lg font-bold leading-tight text-text-primary">{formatPrice(service.price)}</span>
            <span className="truncate text-xs text-text-secondary">{barLine}</span>
          </div>
          <Button type="button" variant="accent" size="lg" disabled={!canNext} onClick={handleNext} className="flex-none">
            {step === 3 ? t("confirm") : t("next")}
            <Icon icon={step === 3 ? CalendarCheck : ArrowRight} size={18} />
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}
