import type { Metadata } from "next";
import { SalonSetupContent } from "@/components/owner/salon-setup-content";

export const metadata: Metadata = {
  title: "Postavljanje salona | SrediMe",
};

export default function SalonSetupPage() {
  return <SalonSetupContent />;
}
