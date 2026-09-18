/**
 * Entity types mirroring docs/database.md. These are the shape the real
 * Laravel API (`/api/v1/...`) will return via its Resource classes — the
 * mock data layer in lib/api/ returns exactly this shape from JSON fixtures
 * so swapping in real `fetch` calls later is a drop-in change.
 */

export type UserRole = "client" | "owner" | "worker" | "admin";

export interface User {
  id: number;
  role: UserRole;
  name: string;
  email: string;
  phone: string | null;
  emailVerifiedAt: string | null; // UTC ISO 8601
  createdAt: string; // UTC ISO 8601
  // `password` never leaves the backend — no field here, matches the real API Resource.
}

export type SalonCategory = "frizer" | "barber" | "kozmetika" | "nokti";

export type SalonStatus = "pending" | "active" | "suspended";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled_by_client"
  | "cancelled_by_salon"
  | "no_show";

export interface Salon {
  id: number;
  slug: string;
  name: string;
  description: string;
  address: string;
  city: string;
  countryCode: string;
  latitude: number | null;
  longitude: number | null;
  category: SalonCategory;
  status: SalonStatus;
  rating: number;
  reviewCount: number;
  images: SalonImage[];
  distanceKm?: number;
  /** Computed server-side by the salon-list endpoint, not stored columns. */
  priceFrom: string;
  nextSlotLabel: string;
  nextSlotIsToday: boolean;
  photoCaption: string;
  /** Salon-level working hours — no dedicated table in docs/database.md yet, display-only for now. `time` is "09:00 – 20:00", or `null` when the salon is closed that day. */
  openingHours: { day: string; time: string | null }[];
  /** Aggregate 1..5-star counts (index 0 = 1-star ... index 4 = 5-star), computed server-side. */
  ratingBreakdown: number[];
}

export interface SalonImage {
  id: number;
  url: string | null;
  caption: string;
  order: number;
}

export interface Worker {
  id: number;
  salonId: number;
  name: string;
  position: string;
  bio: string | null;
  photoUrl: string | null;
  canBlockClients: boolean;
  /** Computed by the availability engine, not a stored column (docs/database.md). */
  nextSlotLabel: string;
}

export interface Service {
  id: number;
  salonId: number;
  /**
   * Display-only grouping for the salon profile ("Frizerske usluge", "Bojenje"...).
   * Not a column in docs/database.md — salon owners currently have no group/category
   * field on services. Flag for a product decision before the real backend is built.
   */
  groupLabel: string;
  name: string;
  price: string; // decimal as string — never a float in code, docs/backend.md
  currency: string;
  durationMinutes: number;
  bufferMinutes: number;
  discountPercent: number | null;
  photoUrl: string | null;
  workerIds: number[];
}

export interface Booking {
  id: number;
  /**
   * `null` = guest booking, no account (the salon dashboard's "Novi termin"
   * flow supports booking a walk-in by name+phone alone). `docs/database.md`
   * models `client_id` as a required FK — doesn't support guests yet. Flag
   * for a product/schema decision before the real backend is built.
   */
  clientId: number | null;
  /** Denormalized display fields — from the User when clientId is set, from the guest entry otherwise. */
  clientName: string;
  clientPhone: string;
  salonId: number;
  workerId: number;
  serviceId: number;
  scheduledAt: string; // UTC ISO 8601
  status: BookingStatus;
  manuallyEntered: boolean;
}

export interface ClientNote {
  id: number;
  salonId: number;
  /** Matches Booking.clientName — guest bookings have no clientId yet, same caveat as Booking.clientName. */
  clientName: string;
  authorName: string;
  text: string;
  createdAt: string; // UTC ISO 8601
}

export interface FavoriteServiceWorker {
  id: number;
  clientId: number;
  salonId: number;
  serviceId: number;
  workerId: number;
  createdAt: string; // UTC ISO 8601
}

export interface Review {
  id: number;
  bookingId: number;
  salonId: number;
  clientName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string | null;
  createdAt: string; // UTC ISO 8601
  /** Denormalized from the review's booking — what the API Resource joins in, not stored on `reviews`. */
  serviceName: string;
  workerName: string;
}
