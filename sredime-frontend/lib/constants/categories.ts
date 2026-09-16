import type { SalonCategory } from "@/types/entities";
import type { LucideIcon } from "lucide-react";
import { Scissors, Sparkles, Hand } from "lucide-react";

export const CATEGORY_META: Record<
  SalonCategory,
  { label: string; icon: LucideIcon }
> = {
  frizer: { label: "Frizerski salon", icon: Scissors },
  barber: { label: "Barbershop", icon: Scissors },
  kozmetika: { label: "Kozmetički salon", icon: Sparkles },
  nokti: { label: "Nail studio", icon: Hand },
};

export const CITIES = ["Sarajevo", "Banja Luka", "Mostar", "Tuzla", "Zenica"];

export const SERVICE_CHIPS = [
  { label: "Šišanje", icon: Scissors },
  { label: "Bojenje", icon: Sparkles },
  { label: "Manikir", icon: Hand },
  { label: "Brijanje", icon: Scissors },
];
