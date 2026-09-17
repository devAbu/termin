import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorkerInviteContent } from "@/components/invite/worker-invite-content";
import { getSalonById } from "@/lib/api/salons";
import { CURRENT_SALON_ID } from "@/lib/api/bookings";

export const metadata: Metadata = {
  title: "Pozivnica radniku | SrediMe",
};

export default async function WorkerInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  // No real `worker_invitations` token store yet (docs/PROGRESS.md §3) — every
  // token resolves to the one mock salon, same convention as the rest of the
  // owner/worker screens (CURRENT_SALON_ID).
  const salon = await getSalonById(CURRENT_SALON_ID);
  if (!salon) notFound();

  return <WorkerInviteContent salon={salon} token={token} />;
}
