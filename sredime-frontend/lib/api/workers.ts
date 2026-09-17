import type { Worker } from "@/types/entities";
import workersFixture from "@/lib/mock-data/workers.json";

/** Mock data-access layer — see lib/api/salons.ts for the swap-to-real-API convention. */

function all(): Worker[] {
  return workersFixture as Worker[];
}

export async function getWorkersBySalon(salonId: number): Promise<Worker[]> {
  return all().filter((w) => w.salonId === salonId);
}

export async function getWorkerById(id: number): Promise<Worker | null> {
  return all().find((w) => w.id === id) ?? null;
}
