import type { Metadata } from "next";
import { RegistrationContent } from "@/components/auth/registration-content";

export const metadata: Metadata = {
  title: "Registracija | SrediMe",
};

export default function RegistrationPage() {
  return <RegistrationContent />;
}
