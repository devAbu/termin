import type { ClientNote } from "@/types/entities";
import notesFixture from "@/lib/mock-data/client-notes.json";

/** Klijent historija — internal notes for one client at one salon, newest first. */
export async function getClientNotes(salonId: number, clientName: string): Promise<ClientNote[]> {
  return (notesFixture as ClientNote[])
    .filter((n) => n.salonId === salonId && n.clientName === clientName)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
