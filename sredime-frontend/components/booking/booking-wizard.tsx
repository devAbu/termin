"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Calendar, CalendarCheck, Clock, Scissors, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Navbar } from "@/components/chrome/navbar";
import { Footer } from "@/components/chrome/footer";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { formatDayLabel, getEffectivePrice } from "@/lib/format";
import { startOfDay } from "@/lib/date";
import { isGuestBookingDetailsValid } from "@/lib/validation";
import { CURRENT_CLIENT_ID, type BookingDetails } from "@/lib/api/bookings";
import { pickFavoriteWorkerId, pickLastUsedWorkerId, pickPreselectedWorkerId } from "@/lib/api/favorites";
import type { FavoriteServiceWorker, Salon, Service, Worker } from "@/types/entities";
import { BookingSummary, MobileBookingBar } from "./booking-summary";
import { DonePanel } from "./done-panel";
import { ReviewStep, type GuestDetails } from "./review-step";
import { ServiceStep } from "./service-step";
import { TimeStep } from "./time-step";
import { WizardStepper } from "./wizard-stepper";
import { WorkerStep } from "./worker-step";
import type { RecapRow, Step } from "./wizard-types";

export function BookingWizard({
  salon,
  services,
  workers,
  clientBookings = [],
  favorites = [],
  initialServiceId,
  initialWorkerId,
}: {
  salon: Salon;
  services: Service[];
  workers: Worker[];
  clientBookings?: BookingDetails[];
  favorites?: FavoriteServiceWorker[];
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
  const [revealAllWorkers, setRevealAllWorkers] = useState(false);
  const [sessionFavorites, setSessionFavorites] = useState<FavoriteServiceWorker[]>([]);
  const [favoriteSaved, setFavoriteSaved] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [details, setDetails] = useState<GuestDetails>({ name: "", phone: "", email: "", note: "", wantsReminder: true });
  const [done, setDone] = useState(false);

  const allFavorites = useMemo(() => [...favorites, ...sessionFavorites], [favorites, sessionFavorites]);

  const service = services.find((s) => s.id === serviceId) ?? null;
  const servicePrice = service ? getEffectivePrice(service.price, service.discountPercent) : 0;
  const eligibleWorkers = service ? workers.filter((w) => service.workerIds.includes(w.id)) : workers;
  const worker = workerChoice && workerChoice !== "any" ? workers.find((w) => w.id === workerChoice) ?? null : null;
  const activeWorkerIds = useMemo(
    () => (workerChoice === "any" ? eligibleWorkers.map((w) => w.id) : worker ? [worker.id] : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- eligibleWorkers/worker are derived fresh each render from stable ids
    [workerChoice, service?.id, worker?.id],
  );

  const favoriteWorkerId = serviceId != null ? pickFavoriteWorkerId(allFavorites, serviceId) : null;
  const lastUsedWorkerId = serviceId != null ? pickLastUsedWorkerId(clientBookings, serviceId) : null;
  const isFavoriteEligible = favoriteWorkerId != null && eligibleWorkers.some((w) => w.id === favoriteWorkerId);
  const showFavoriteCard = isFavoriteEligible && !revealAllWorkers;
  const alreadyFavorite = worker != null && favoriteWorkerId === worker.id;

  function go(next: Step) {
    setStep(next);
    setReached((r) => (r > next ? r : next) as Step);
  }

  function pickService(id: number) {
    setServiceId(id);
    setRevealAllWorkers(false);
    const svc = services.find((s) => s.id === id);
    const eligibleIds = svc ? workers.filter((w) => svc.workerIds.includes(w.id)).map((w) => w.id) : [];
    setWorkerChoice(pickPreselectedWorkerId(allFavorites, clientBookings, id, eligibleIds));
    go(solo ? 2 : 1);
  }

  function pickWorker(choice: number | "any") {
    setWorkerChoice(choice);
    go(2);
  }

  function confirmSaveFavorite() {
    if (!service || !worker) return;
    setSessionFavorites((cur) => [
      ...cur,
      { id: Date.now(), clientId: CURRENT_CLIENT_ID, salonId: salon.id, serviceId: service.id, workerId: worker.id, createdAt: new Date().toISOString() },
    ]);
    setFavoriteSaved(true);
  }

  function pickSlot(date: Date, time: string) {
    setSelectedDate(startOfDay(date));
    setSelectedTime(time);
    go(3);
  }

  const labels = solo ? [t("stepService"), t("stepTime"), t("stepReview")] : [t("stepService"), t("stepStaff"), t("stepTime"), t("stepReview")];
  const stepIndexes = solo ? [0, 2, 3] : [0, 1, 2, 3];
  const currentLabelIndex = done ? labels.length : stepIndexes.indexOf(step);

  const canNext =
    step === 0
      ? !!serviceId
      : step === 1
        ? !!workerChoice
        : step === 2
          ? !!selectedTime
          : isGuestBookingDetailsValid({ name: details.name, phone: details.phone, email: details.email });

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
    setRevealAllWorkers(false);
    setFavoriteSaved(false);
    setDone(false);
  }

  const timeStr = selectedTime ? `${formatDayLabel(selectedDate)}, ${selectedTime}` : t("recapTimeUnset");
  const recap: RecapRow[] = service
    ? [
        { key: "service", icon: Scissors, label: t("recapService"), value: service.name },
        {
          key: "staff",
          icon: User,
          label: t("recapStaff"),
          value: solo && worker ? t("recapStaffSolo", { name: worker.name }) : worker ? worker.name : t("recapStaffAny"),
        },
        { key: "time", icon: Calendar, label: t("recapTime"), value: timeStr },
        { key: "duration", icon: Clock, label: t("recapDuration"), value: `${service.durationMinutes} min` },
      ]
    : [];

  const barLine = step === 2 && !selectedTime ? t("barLinePickTime") : service ? `${service.name} · ${selectedTime ? timeStr : `${service.durationMinutes} min`}` : "";

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
          <WizardStepper labels={labels} stepIndexes={stepIndexes} currentLabelIndex={currentLabelIndex} reached={reached} onGo={go} />
        )}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex min-w-0 flex-col gap-5">
            {done ? (
              <DonePanel
                recap={recap}
                worker={worker}
                service={service}
                favoriteSaved={favoriteSaved}
                alreadyFavorite={alreadyFavorite}
                onSaveFavorite={confirmSaveFavorite}
                onRestart={restart}
              />
            ) : (
              <>
                {step === 0 && <ServiceStep services={services} serviceId={serviceId} onPick={pickService} />}

                {step === 1 && (
                  <WorkerStep
                    workers={workers}
                    eligibleWorkers={eligibleWorkers}
                    workerChoice={workerChoice}
                    favoriteWorkerId={favoriteWorkerId}
                    lastUsedWorkerId={lastUsedWorkerId}
                    showFavoriteCard={showFavoriteCard}
                    onPick={pickWorker}
                    onRevealAll={() => setRevealAllWorkers(true)}
                  />
                )}

                {step === 2 && service && (
                  <TimeStep
                    salon={salon}
                    service={service}
                    activeWorkerIds={activeWorkerIds}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    onSelectDate={setSelectedDate}
                    onPickSlot={pickSlot}
                  />
                )}

                {step === 3 && service && (
                  <ReviewStep
                    recap={recap}
                    solo={solo}
                    details={details}
                    onChange={(patch) => setDetails((cur) => ({ ...cur, ...patch }))}
                    onEdit={go}
                  />
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

          {!done && service && <BookingSummary salon={salon} recap={recap} timeSelected={!!selectedTime} total={servicePrice} />}
        </div>
      </main>

      {!done && service && (
        <MobileBookingBar total={servicePrice} line={barLine} isLastStep={step === 3} canNext={canNext} onNext={handleNext} />
      )}

      <Footer />
    </div>
  );
}
