import type { Metadata } from "next";
import { ClientProfileContent } from "@/components/client/client-profile-content";
import { getCurrentClient } from "@/lib/api/client";

export const metadata: Metadata = {
  title: "Klijent profil | SrediMe",
};

export default async function ClientProfilePage() {
  const user = await getCurrentClient();

  return <ClientProfileContent user={user} />;
}
