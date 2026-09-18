import { Check, CircleCheck, CircleX, Clock, UserX } from "lucide-react";
import type { BookingStatus } from "@/types/entities";

/** Icon per booking status for the owner-side views. Lives with the components (not lib/) because it holds React icon components. */
export const BOOKING_STATUS_ICON = {
  pending: Clock,
  confirmed: CircleCheck,
  completed: Check,
  cancelled_by_client: CircleX,
  cancelled_by_salon: CircleX,
  no_show: UserX,
} satisfies Record<BookingStatus, unknown>;
