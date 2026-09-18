import type { Metadata } from "next";
import { ForSalonsContent } from "@/components/marketing/for-salons-content";

export const metadata: Metadata = {
  title: "Za salone | SrediMe",
};

export default function ForSalonsPage() {
  return <ForSalonsContent />;
}
