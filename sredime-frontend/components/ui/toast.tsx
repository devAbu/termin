import { Check } from "lucide-react";
import { Icon } from "@/components/ui/icon";

export function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-surface-inverse px-4.5 py-3 text-sm font-medium text-brand-on shadow-popover">
      <Icon icon={Check} size={16} className="text-accent" />
      {message}
    </div>
  );
}
