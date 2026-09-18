import { firstName } from "@/lib/format";
import { SESSION_NAMES } from "@/lib/session";
import type { TeamMember } from "@/types/dashboard";
import type { Salon, Worker } from "@/types/entities";

/** Mock data-access layer — the team list has no fixture/endpoint yet (docs/PROGRESS.md §4 "CRUD radnici"), so it's derived from the salon's workers. */

export const OWNER_MEMBER: TeamMember = {
  id: -1,
  name: SESSION_NAMES.owner,
  role: null,
  contact: "selma@studiolux.ba",
  status: "owner",
};

/** Made-up work email for a worker — the fixtures have no worker contact yet ("amina@studiolux.ba"). */
function contactFor(name: string, salon: Salon): string {
  const first = firstName(name).toLowerCase();
  const domain = salon.name.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return `${first}@${domain}.ba`;
}

/** Owner first, then every worker as an active member. */
export function buildInitialTeam(workers: Worker[], salon: Salon): TeamMember[] {
  return [
    OWNER_MEMBER,
    ...workers.map((w) => ({ id: w.id, name: w.name, role: w.position, contact: contactFor(w.name, salon), status: "active" as const, workerId: w.id })),
  ];
}
