// DEV-ONLY: session-only "ko je ulogovan" stanje za Navbar, čuvano u localStorage jer Navbar
// nema zajednički layout (svaka *-content.tsx stranica ga sama montira, vidi PROGRESS.md §15.2).
// Ovo NIJE pravi auth (nema tokena, nema backend provjere) — zamijeniti Sanctum sesijom kad
// pravi auth dođe (docs/PROGRESS.md §3).

export type SessionRole = "client" | "worker" | "owner";

export interface StoredSession {
  role: SessionRole;
  name: string;
}

/** Fixed mock identity per role — same person everywhere in the app (dashboard viewer chip, quick-login, client notes author, invite sender). */
export const SESSION_NAMES: Record<SessionRole, string> = {
  client: "Sanela Kovačević",
  worker: "Lejla Hadžić",
  owner: "Selma Hodžić",
};

const STORAGE_KEY = "sredime.session";

export function getStoredSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export function setStoredSession(session: StoredSession) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  window.localStorage.removeItem(STORAGE_KEY);
}
