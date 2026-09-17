import type { Service } from "@/types/entities";
import servicesFixture from "@/lib/mock-data/services.json";

/** Mock data-access layer — see lib/api/salons.ts for the swap-to-real-API convention. */

export interface ServiceGroup {
  groupLabel: string;
  items: Service[];
}

function all(): Service[] {
  return servicesFixture as Service[];
}

export function groupServices(services: Service[]): ServiceGroup[] {
  const order: string[] = [];
  const byGroup = new Map<string, Service[]>();
  for (const service of services) {
    if (!byGroup.has(service.groupLabel)) {
      order.push(service.groupLabel);
      byGroup.set(service.groupLabel, []);
    }
    byGroup.get(service.groupLabel)!.push(service);
  }
  return order.map((groupLabel) => ({ groupLabel, items: byGroup.get(groupLabel)! }));
}

export async function getServicesBySalon(salonId: number): Promise<Service[]> {
  return all().filter((s) => s.salonId === salonId);
}

export async function getServiceById(id: number): Promise<Service | null> {
  return all().find((s) => s.id === id) ?? null;
}
