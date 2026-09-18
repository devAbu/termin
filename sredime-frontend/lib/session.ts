// DEV-ONLY: session-only "ko je ulogovan" stanje za Navbar, čuvano u localStorage jer Navbar
// nema zajednički layout (svaka *-content.tsx stranica ga sama montira, vidi PROGRESS.md §15.2).
// Ovo NIJE pravi auth (nema tokena, nema backend provjere) — zamijeniti Sanctum sesijom kad
// pravi auth dođe (docs/PROGRESS.md §3).

export type SessionRole = "client" | "worker" | "owner";

export interface StoredSession {
  role: SessionRole;
  name: string;
}

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

export function initialsFromName(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
