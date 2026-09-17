import type { User } from "@/types/entities";
import clientFixture from "@/lib/mock-data/client.json";

/**
 * Mock data-access layer — see lib/api/salons.ts for the swap-to-real-API
 * convention. No auth yet (§3 u docs/PROGRESS.md), so there's exactly one
 * mock "current client" (id matches `CURRENT_CLIENT_ID` in lib/api/bookings.ts)
 * instead of a real session lookup.
 */

export async function getCurrentClient(): Promise<User> {
  return clientFixture as User;
}
