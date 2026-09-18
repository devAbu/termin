/** Owner-dashboard-only UI types — not mirrored from a real API entity, see types/entities.ts for those. */

/** Viewer role toggle for the owner/worker dashboard views (session-only, not real auth — docs/PROGRESS.md §3). */
export type Role = "owner" | "worker";

/** Salon dashboard tab. */
export type Page = "kalendar" | "zahtjevi" | "klijenti" | "usluge" | "radnici" | "vrijeme" | "statistika";
