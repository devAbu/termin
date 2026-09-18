"use client";

import { useMemo, useState } from "react";
import { BarChart3, CalendarDays, Clock, Inbox, Tag, UserPlus, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useFlashToast } from "@/hooks/use-flash-toast";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Toast } from "@/components/ui/toast";
import { formatTimeOfDay, formatWeekdayShort } from "@/lib/format";
import { pickPendingBookings, summarizeClients, type BookingDetails } from "@/lib/api/bookings";
import { buildManualBooking, mergeBookings, mergeServices } from "@/lib/api/dashboard";
import { buildInitialTeam } from "@/lib/api/team";
import { NewAppointmentModal, type NewBookingInput } from "@/components/owner/new-appointment-modal";
import { InviteWorkerModal, type InvitePayload } from "@/components/owner/invite-worker-modal";
import { EditServiceModal } from "@/components/owner/edit-service-modal";
import type { Salon, Service, Worker, BookingStatus } from "@/types/entities";
import type { Page, Role, TeamMember } from "@/types/dashboard";
import type { AppointmentActions } from "./dashboard/appointment-card";
import { BookingActionModal, type ActionModalType } from "./dashboard/booking-action-modal";
import { CalendarTab } from "./dashboard/calendar-tab";
import { ClientsTab } from "./dashboard/clients-tab";
import { DashboardHeader, DashboardSidebar, type NavItem } from "./dashboard/dashboard-nav";
import { HoursTab } from "./dashboard/hours-tab";
import { RequestsTab } from "./dashboard/requests-tab";
import { ServicesTab } from "./dashboard/services-tab";
import { StaffTab } from "./dashboard/staff-tab";
import { StatsTab } from "./dashboard/stats-tab";

let nextLocalId = 100000;

/**
 * Salon dashboard shell: owns all session-only state (edits, added bookings, team, open dialogs, toast)
 * and composes the sidebar/header with one component per tab. State lives here — not in the tabs —
 * so it survives switching tabs, same as before the split.
 */
export function DashboardContent({
  salon,
  workers,
  services,
  bookings,
  initialPage = "kalendar",
  initialRole = "owner",
}: {
  salon: Salon;
  workers: Worker[];
  services: Service[];
  bookings: BookingDetails[];
  initialPage?: Page;
  initialRole?: Role;
}) {
  const t = useTranslations("dashboard");
  const tInvite = useTranslations("workerInvite");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [role, setRole] = useState<Role>(initialRole);
  const [page, setPage] = useState<Page>(initialPage);
  const [dayOffset, setDayOffset] = useState(0);
  const [staffFilter, setStaffFilter] = useState<number | "all">("all");
  const [overrides, setOverrides] = useState<Record<number, Partial<BookingDetails>>>({});
  const [extra, setExtra] = useState<BookingDetails[]>([]);
  const [canBlockOverrides, setCanBlockOverrides] = useState<Record<number, boolean>>({});
  const [hoursClosed, setHoursClosed] = useState<Record<number, boolean>>({});
  const [serviceOverrides, setServiceOverrides] = useState<Record<number, Partial<Service>>>({});
  const [editServiceModal, setEditServiceModal] = useState<Service | null>(null);
  const [actionModal, setActionModal] = useState<{ type: ActionModalType; bookingId: number } | null>(null);
  const [newApptOpen, setNewApptOpen] = useState(false);
  const [team, setTeam] = useState<TeamMember[]>(() => buildInitialTeam(workers, salon));
  const [inviteModal, setInviteModal] = useState<{ mode: "new" } | { mode: "resend"; member: TeamMember } | null>(null);
  const { toast, flash } = useFlashToast();
  const [now] = useState(() => new Date());

  function selectRole(r: Role) {
    setRole(r);
    if (r === "worker" && page === "statistika") setPage("kalendar");
    const params = new URLSearchParams(searchParams.toString());
    params.set("role", r);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const isOwner = role === "owner";

  const allBookings = useMemo(() => mergeBookings(bookings, overrides, extra), [bookings, overrides, extra]);
  const clients = useMemo(() => summarizeClients(allBookings), [allBookings]);
  const displayedServices = useMemo(() => mergeServices(services, serviceOverrides), [services, serviceOverrides]);
  const allPending = useMemo(() => pickPendingBookings(allBookings), [allBookings]);

  const nav: (NavItem & { ownerOnly?: boolean })[] = [
    { id: "kalendar", label: t("navCalendar"), icon: CalendarDays },
    { id: "zahtjevi", label: t("navRequests"), icon: Inbox, count: allPending.length },
    { id: "klijenti", label: t("navClients"), icon: Users },
    { id: "usluge", label: t("navServices"), icon: Tag, ownerOnly: true },
    { id: "radnici", label: t("navStaff"), icon: UserPlus, ownerOnly: true },
    { id: "vrijeme", label: t("navHours"), icon: Clock },
    { id: "statistika", label: t("navStats"), icon: BarChart3, ownerOnly: true },
  ];
  const visibleNav = nav.filter((n) => isOwner || !n.ownerOnly);

  function setStatus(id: number, status: BookingStatus, msg: string) {
    setOverrides((cur) => ({ ...cur, [id]: { ...cur[id], status } }));
    setActionModal(null);
    flash(msg);
  }

  function moveBooking(id: number, newIso: string) {
    setOverrides((cur) => ({ ...cur, [id]: { ...cur[id], scheduledAt: newIso, status: "confirmed" } }));
    setActionModal(null);
    flash(t("movedToast", { when: `${formatWeekdayShort(new Date(newIso))} ${new Date(newIso).getDate()}., ${formatTimeOfDay(newIso)}` }));
  }

  const appointmentActions: AppointmentActions = {
    onConfirm: (id) => setStatus(id, "confirmed", t("confirmedToast")),
    onComplete: (id) => setStatus(id, "completed", t("completedToast")),
    onRequestAction: (type, bookingId) => setActionModal({ type, bookingId }),
  };

  const modalBooking = actionModal ? allBookings.find((b) => b.id === actionModal.bookingId) ?? null : null;

  function handleServiceSave(id: number, changes: Partial<Service>) {
    setServiceOverrides((cur) => ({ ...cur, [id]: { ...cur[id], ...changes } }));
    setEditServiceModal(null);
    flash(t("serviceUpdatedToast", { name: changes.name ?? "" }));
  }

  function handleNewBooking(input: NewBookingInput) {
    const service = displayedServices.find((s) => s.id === input.serviceId)!;
    const worker = workers.find((w) => w.id === input.workerId)!;
    const booking = buildManualBooking({
      id: nextLocalId++,
      salon,
      service,
      worker,
      clientName: input.clientName,
      clientPhone: input.clientPhone,
      date: input.date,
      time: input.time,
    });
    setExtra((cur) => [...cur, booking]);
    setNewApptOpen(false);
    flash(t("addedToast", { who: input.clientName, when: `${input.date.getDate()}.${input.date.getMonth() + 1}., ${input.time}` }));
  }

  function handleInviteSent(payload: InvitePayload) {
    if (inviteModal?.mode === "resend") {
      const targetId = inviteModal.member.id;
      setTeam((cur) => cur.map((m) => (m.id === targetId ? { ...m, contact: payload.contact || m.contact, status: "invited" } : m)));
      flash(tInvite("resentToast", { contact: payload.contact || inviteModal.member.contact }));
    } else {
      setTeam((cur) => [...cur, { id: nextLocalId++, name: payload.name, role: payload.role, contact: payload.contact, status: "invited" }]);
      flash(tInvite("sentToast", { contact: payload.contact }));
    }
  }

  return (
    <div className="flex min-h-screen bg-surface-canvas">
      <DashboardSidebar
        salonName={salon.name}
        salonCity={salon.city}
        items={visibleNav}
        page={page}
        onPageChange={setPage}
        role={role}
        onSelectRole={selectRole}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader page={page} isOwner={isOwner} items={visibleNav} onPageChange={setPage} onNewAppointment={() => setNewApptOpen(true)} />

        <main className="flex flex-1 flex-col gap-5 p-4 lg:p-6">
          {page === "kalendar" && (
            <CalendarTab
              salon={salon}
              workers={workers}
              allBookings={allBookings}
              clients={clients}
              now={now}
              dayOffset={dayOffset}
              onDayOffsetChange={setDayOffset}
              staffFilter={staffFilter}
              onStaffFilterChange={setStaffFilter}
              actions={appointmentActions}
              onFlash={flash}
            />
          )}
          {page === "zahtjevi" && <RequestsTab pending={allPending} clients={clients} actions={appointmentActions} />}
          {page === "klijenti" && <ClientsTab clients={clients} role={role} onFlash={flash} />}
          {page === "usluge" && <ServicesTab services={displayedServices} isOwner={isOwner} onEdit={setEditServiceModal} />}
          {page === "radnici" && (
            <StaffTab
              team={team}
              workers={workers}
              canBlockOverrides={canBlockOverrides}
              isOwner={isOwner}
              onToggleCanBlock={(workerId, canBlock) => setCanBlockOverrides((cur) => ({ ...cur, [workerId]: canBlock }))}
              onInviteNew={() => setInviteModal({ mode: "new" })}
              onResendInvite={(member) => setInviteModal({ mode: "resend", member })}
            />
          )}
          {page === "vrijeme" && (
            <HoursTab
              openingHours={salon.openingHours}
              hoursClosed={hoursClosed}
              isOwner={isOwner}
              onToggle={(dayIndex, wasOpen) => setHoursClosed((cur) => ({ ...cur, [dayIndex]: wasOpen }))}
            />
          )}
          {page === "statistika" && <StatsTab allBookings={allBookings} workers={workers} />}
        </main>
      </div>

      {inviteModal && (
        <InviteWorkerModal
          mode={inviteModal.mode}
          initialName={inviteModal.mode === "resend" ? inviteModal.member.name : undefined}
          initialContact={inviteModal.mode === "resend" ? inviteModal.member.contact : undefined}
          initialRole={inviteModal.mode === "resend" ? inviteModal.member.role ?? undefined : undefined}
          onClose={() => setInviteModal(null)}
          onSent={handleInviteSent}
        />
      )}

      {newApptOpen && (
        <NewAppointmentModal
          salon={salon}
          workers={workers}
          services={displayedServices}
          clients={clients}
          existingBookings={allBookings}
          onClose={() => setNewApptOpen(false)}
          onSave={handleNewBooking}
        />
      )}

      {editServiceModal && (
        <EditServiceModal service={editServiceModal} onClose={() => setEditServiceModal(null)} onSave={handleServiceSave} />
      )}

      {actionModal && modalBooking && (
        <BookingActionModal
          type={actionModal.type}
          booking={modalBooking}
          salon={salon}
          allBookings={allBookings}
          onDismiss={() => setActionModal(null)}
          onMove={moveBooking}
          onSetStatus={setStatus}
        />
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
}
