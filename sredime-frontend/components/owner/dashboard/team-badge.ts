import { CircleCheck, Info, Mail, Store } from "lucide-react";
import type { VariantProps } from "class-variance-authority";
import type { badgeVariants } from "@/components/ui/badge";
import type { TeamStatus } from "@/types/dashboard";

type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

/** Badge per team-member status ("Radnici" tab). Lives with the components (not lib/) because it holds React icon components. */
export const TEAM_BADGE: Record<TeamStatus, { tone: BadgeTone; icon: typeof Store; labelKey: string }> = {
  owner: { tone: "info", icon: Store, labelKey: "badgeOwner" },
  active: { tone: "success", icon: CircleCheck, labelKey: "badgeActive" },
  invited: { tone: "warning", icon: Mail, labelKey: "badgeInvited" },
  draft: { tone: "neutral", icon: Info, labelKey: "badgeDraft" },
};
