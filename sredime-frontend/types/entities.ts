/**
 * Entity types mirroring docs/database.md. These are the shape the real
 * Laravel API (`/api/v1/...`) will return via its Resource classes — the
 * mock data layer in lib/api/ returns exactly this shape from JSON fixtures
 * so swapping in real `fetch` calls later is a drop-in change.
 */

export type UserRole = "client" | "owner" | "worker" | "admin";

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
}

export interface Service {
  id: number;
  salonId: number;
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
  clientId: number;
  salonId: number;
  workerId: number;
  serviceId: number;
  scheduledAt: string; // UTC ISO 8601
  status: BookingStatus;
  manuallyEntered: boolean;
}

export interface Review {
  id: number;
  bookingId: number;
  salonId: number;
  clientName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string | null;
  createdAt: string;
}
