/** Salon-setup onboarding wizard draft shapes — session-only UI state, not API entities (see types/entities.ts for those). */

export type StaffStatus = "owner" | "invited" | "draft";

export interface DraftService {
  id: number;
  name: string;
  price: number;
  duration: number;
}

export interface DraftStaff {
  id: number;
  name: string;
  role: string;
  status: StaffStatus;
}

export interface DayHours {
  day: string;
  open: boolean;
  from: string;
  to: string;
}
