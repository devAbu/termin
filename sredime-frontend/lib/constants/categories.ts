import type { SalonCategory } from "@/types/entities";
import type { LucideIcon } from "lucide-react";
import { Scissors, Sparkles, Hand } from "lucide-react";

export const CATEGORY_META: Record<
  SalonCategory,
  { label: string; pluralLabel: string; icon: LucideIcon }
> = {
  frizer: { label: "Frizerski salon", pluralLabel: "Frizerski saloni", icon: Scissors },
  barber: { label: "Barbershop", pluralLabel: "Barbershop saloni", icon: Scissors },
  kozmetika: { label: "Kozmetički salon", pluralLabel: "Kozmetički saloni", icon: Sparkles },
  nokti: { label: "Nail studio", pluralLabel: "Nail studiji", icon: Hand },
};

export const CITIES = ["Sarajevo", "Banja Luka", "Mostar", "Tuzla", "Zenica"];

export const SERVICE_CHIPS = [
  { label: "Šišanje", icon: Scissors },
  { label: "Bojenje", icon: Sparkles },
  { label: "Manikir", icon: Hand },
  { label: "Brijanje", icon: Scissors },
];
