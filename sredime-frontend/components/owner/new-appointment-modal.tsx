"use client";

import { useMemo, useState } from "react";
import { Calendar, TriangleAlert, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { formatPrice, formatWeekdayShort } from "@/lib/format";
import { hoursForDate } from "@/lib/api/availability";
import type { BookingDetails, SalonClientSummary } from "@/lib/api/bookings";
import type { Salon, Service, Worker } from "@/types/entities";

const SLOT_INTERVAL = 30;

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function hhmm(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

export interface NewBookingInput {
  clientName: string;
  clientPhone: string;
  serviceId: number;
  workerId: number;
  date: Date;
  time: string;
}

export function NewAppointmentModal({
  salon,
  workers,
  services,
  clients,
  existingBookings,
  onClose,
  onSave,
}: {
  salon: Salon;
  workers: Worker[];
  services: Service[];
  clients: SalonClientSummary[];
  existingBookings: BookingDetails[];
  onClose: () => void;
  onSave: (input: NewBookingInput) => void;
}) {
  const t = useTranslations("dashboard");

  const [mode, setMode] = useState<"existing" | "guest">(clients.length ? "existing" : "guest");
  const [clientName, setClientName] = useState(clients[0]?.name ?? "");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [serviceId, setServiceId] = useState(services[0]?.id ?? 0);
  const [workerId, setWorkerId] = useState<number | null>(null);
  const [dayOffset, setDayOffset] = useState(0);
  const [time, setTime] = useState<string | null>(null);

  const service = services.find((s) => s.id === serviceId) ?? services[0];
  const eligibleWorkers = workers.filter((w) => service.workerIds.includes(w.id));
  const activeWorkerId = useMemo(
    () => (workerId && eligibleWorkers.some((w) => w.id === workerId) ? workerId : eligibleWorkers[0]?.id ?? null),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- eligibleWorkers is derived fresh each render from stable service.workerIds
    [workerId, service.id],
  );

  const days = useMemo(() => {
    const base = startOfDay(new Date());
    return [0, 1, 2].map((i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d;
    });
  }, []);
  const date = days[dayOffset];

  const slots = useMemo(() => {
    if (!activeWorkerId) return [];
    const hours = hoursForDate(salon, date);
    if (!hours) return [];
    const need = service.durationMinutes + service.bufferMinutes;
    const taken = existingBookings.filter((b) => {
      if (b.worker.id !== activeWorkerId) return false;
      const bd = new Date(b.scheduledAt);
      return bd.getFullYear() === date.getFullYear() && bd.getMonth() === date.getMonth() && bd.getDate() === date.getDate();
    });
    const busyRanges = taken.map((b) => {
      const bd = new Date(b.scheduledAt);
      const start = bd.getHours() * 60 + bd.getMinutes();
      return { start, end: start + b.service.durationMinutes + 10 };
    });
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const list: { time: string; taken: boolean }[] = [];
    for (let t2 = hours.open; t2 + need <= hours.close; t2 += SLOT_INTERVAL) {
      if (isToday && t2 <= nowMinutes) continue;
      const overlaps = busyRanges.some((r) => t2 < r.end && t2 + need > r.start);
      list.push({ time: hhmm(t2), taken: overlaps });
    }
    return list;
  }, [salon, date, service, activeWorkerId, existingBookings]);

  const selectedClient = clients.find((c) => c.name === clientName);
  const who = mode === "existing" ? clientName : guestName.trim();
  const guestValid = guestName.trim().length > 1 && guestPhone.trim().length > 5;
  const ready = !!time && !!activeWorkerId && (mode === "existing" ? !!clientName : guestValid);

  function handleSave() {
    if (!ready || !activeWorkerId || !time) return;
    onSave({
      clientName: who,
      clientPhone: mode === "existing" ? selectedClient?.phone ?? "" : guestPhone.trim(),
      serviceId: service.id,
      workerId: activeWorkerId,
      date,
      time,
    });
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[var(--overlay-scrim)] p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-[560px] flex-col gap-5 overflow-y-auto rounded-modal bg-card p-6 shadow-modal">
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight text-text-primary">{t("newApptTitle")}</span>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text-primary">
            <Icon icon={X} size={20} />
          </button>
        </div>

        <div className="flex gap-2">
          {(["existing", "guest"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "h-9 rounded-control px-3.5 text-sm font-medium",
                mode === m ? "bg-brand text-primary-foreground" : "border border-border-subtle bg-card text-text-primary",
              )}
            >
              {m === "existing" ? t("modeExisting") : t("modeGuest")}
            </button>
          ))}
        </div>

        {mode === "existing" ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text-primary">{t("existingClientLabel")}</span>
            <Select value={clientName} onChange={(e) => setClientName(e.target.value)}>
              {clients.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} · {c.phone}
                </option>
              ))}
            </Select>
            {selectedClient && selectedClient.noShowCount > 0 && (
              <span className="mt-1 flex items-center gap-1.5 text-xs text-warning-fg">
                <Icon icon={TriangleAlert} size={13} />
                {t("riskWarning")}
              </span>
            )}
          </label>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-text-primary">{t("guestNameLabel")}</span>
              <Input value={guestName} onChange={(e) => setGuestName(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-text-primary">{t("guestPhoneLabel")}</span>
              <Input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} type="tel" />
            </label>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text-primary">{t("serviceLabel")}</span>
            <Select
              value={serviceId}
              onChange={(e) => {
                setServiceId(Number(e.target.value));
                setWorkerId(null);
                setTime(null);
              }}
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.durationMinutes} min · {formatPrice(s.price)}
                </option>
              ))}
            </Select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text-primary">{t("staffLabel")}</span>
            <Select
              value={activeWorkerId ?? ""}
              onChange={(e) => {
                setWorkerId(Number(e.target.value));
                setTime(null);
              }}
            >
              {eligibleWorkers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </Select>
          </label>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-text-primary">{t("dateLabel")}</span>
          <div className="flex gap-2">
            {days.map((d, i) => (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => {
                  setDayOffset(i);
                  setTime(null);
                }}
                className={cn(
                  "h-9 flex-1 rounded-control text-sm font-medium",
                  dayOffset === i ? "bg-brand text-primary-foreground" : "border border-border-subtle bg-card text-text-primary",
                )}
              >
                {i === 0 ? t("today") : `${formatWeekdayShort(d)} ${d.getDate()}.${d.getMonth() + 1}.`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-text-primary">{t("timeLabel")}</span>
          {slots.length === 0 ? (
            <span className="text-sm text-text-secondary">{t("emptyDayClosed")}</span>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(70px,1fr))] gap-2">
              {slots.map((s) => (
                <button
                  key={s.time}
                  type="button"
                  disabled={s.taken}
                  onClick={() => setTime(s.time)}
                  className={cn(
                    "h-9 rounded-control text-sm font-medium",
                    s.taken
                      ? "cursor-not-allowed bg-surface-sunken text-text-muted line-through"
                      : time === s.time
                        ? "bg-brand text-primary-foreground"
                        : "border border-border-subtle bg-card text-text-primary hover:bg-brand-subtle",
                  )}
                >
                  {s.time}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 rounded-control bg-surface-sunken px-3.5 py-2.5 text-sm text-text-secondary">
          <Icon icon={Calendar} size={16} className="flex-none text-icon-muted" />
          {time ? `${who || "—"} · ${dayOffset === 0 ? t("today") : `${formatWeekdayShort(date)} ${date.getDate()}.${date.getMonth() + 1}.`}, ${time}` : t("pickTimeHint")}
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={onClose}>
            {t("dismiss")}
          </Button>
          <Button type="button" variant="primary" size="lg" className="flex-[1.4]" disabled={!ready} onClick={handleSave}>
            {t("saveAppointment")}
          </Button>
        </div>
      </div>
    </div>
  );
}
