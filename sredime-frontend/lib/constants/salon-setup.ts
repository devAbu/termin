import type { DayHours, DraftService, DraftStaff } from "@/types/salon-setup";

export const MAX_SALON_PHOTOS = 10;
export const INITIAL_PHOTO_COUNT = 3;

export const SERVICE_DURATION_OPTIONS_MINUTES = [15, 20, 30, 45, 60, 90, 120];
export const DEFAULT_SERVICE_DURATION_MINUTES = 45;

export const WORKING_TIME_OPTIONS = ["07:00", "08:00", "08:30", "09:00", "10:00", "12:00", "14:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];
export const DEFAULT_OPEN_TIME = "09:00";
export const DEFAULT_CLOSE_TIME = "19:00";
export const DEFAULT_OPEN_WEEKDAYS_COUNT = 6;

export const WEEKDAY_LABELS_MON_FIRST = ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak", "Subota", "Nedjelja"];

export const PHOTO_PLACEHOLDER_CAPTIONS = ["Ulaz i izlog", "Prostor salona", "Radno mjesto", "Detalj rada", "Kabina", "Recepcija"];

/** Prefilled demo drafts so the wizard doesn't open empty (mock phase — real salon data replaces these once "Registracija vlasnika" exists, docs/PROGRESS.md §3). */
export const INITIAL_DRAFT_SERVICES: DraftService[] = [
  { id: 1, name: "Šišanje i pranje", price: 25, duration: 45 },
  { id: 2, name: "Bojenje korijena", price: 60, duration: 90 },
  { id: 3, name: "Feniranje", price: 20, duration: 30 },
];

export const INITIAL_DRAFT_STAFF: DraftStaff[] = [
  { id: 1, name: "Amina Hodžić", role: "Vlasnica, frizerka", status: "owner" },
  { id: 2, name: "Lejla Kadić", role: "Frizerka", status: "invited" },
  { id: 3, name: "Ena Šarić", role: "Pomoćnica", status: "draft" },
];

export function createDefaultWeek(): DayHours[] {
  return WEEKDAY_LABELS_MON_FIRST.map((day, i) => ({
    day,
    open: i < DEFAULT_OPEN_WEEKDAYS_COUNT,
    from: DEFAULT_OPEN_TIME,
    to: DEFAULT_CLOSE_TIME,
  }));
}
