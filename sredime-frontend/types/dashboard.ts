/** Owner-dashboard-only UI types — not mirrored from a real API entity, see types/entities.ts for those. */

/** Viewer role toggle for the owner/worker dashboard views (session-only, not real auth — docs/PROGRESS.md §3). */
export type Role = "owner" | "worker";

/** Salon dashboard tab. */
export type Page = "kalendar" | "zahtjevi" | "klijenti" | "usluge" | "radnici" | "vrijeme" | "statistika";

/** "Radnici" tab row status: the owner, a worker who accepted, one with a pending invite, or one not invited yet. */
export type TeamStatus = "owner" | "active" | "invited" | "draft";

export interface TeamMember {
  id: number;
  name: string;
  /** Job title; `null` for the owner, whose label comes from translations. */
  role: string | null;
  contact: string;
  status: TeamStatus;
  workerId?: number;
}
