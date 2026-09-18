import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { SESSION_NAMES } from "@/lib/session";
import type { Page, Role } from "@/types/dashboard";

export interface NavItem {
  id: Page;
  label: string;
  icon: LucideIcon;
  count?: number;
}

/** Desktop dark sidebar: salon name, tab nav, and the owner/worker viewer toggle. */
export function DashboardSidebar({
  salonName,
  salonCity,
  items,
  page,
  onPageChange,
  role,
  onSelectRole,
}: {
  salonName: string;
  salonCity: string;
  items: NavItem[];
  page: Page;
  onPageChange: (page: Page) => void;
  role: Role;
  onSelectRole: (role: Role) => void;
}) {
  const t = useTranslations("dashboard");
  const isOwner = role === "owner";

  return (
    <aside className="hidden w-60 flex-none flex-col gap-5 bg-surface-inverse p-4 text-brand-on lg:flex">
      <div className="flex flex-col gap-0.5 px-2 py-1">
        <span className="text-base font-bold tracking-tight">{salonName}</span>
        <span className="text-xs text-indigo-200">{salonCity}</span>
      </div>
      <nav className="flex flex-col gap-1">
        {items.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => onPageChange(n.id)}
            className={cn(
              "flex h-10 items-center gap-2.5 rounded-control px-2.5 text-sm font-medium",
              page === n.id ? "bg-indigo-500 text-brand-on" : "text-indigo-200 hover:bg-indigo-500/60",
            )}
          >
            <Icon icon={n.icon} size={17} />
            <span className="flex-1 text-left">{n.label}</span>
            {!!n.count && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-2xs font-bold text-[var(--text-on-accent)]">
                {n.count}
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className="flex-1" />
      <div className="flex flex-col gap-2 rounded-control bg-indigo-500 p-3">
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{isOwner ? SESSION_NAMES.owner : SESSION_NAMES.worker}</span>
          <span className="text-xs text-indigo-200">{isOwner ? t("viewingAsOwner") : t("viewingAsWorker")}</span>
        </div>
        <div className="flex gap-1.5">
          {(["owner", "worker"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onSelectRole(r)}
              className={cn(
                "h-7 flex-1 rounded-control text-2xs font-semibold",
                role === r ? "bg-card text-brand" : "bg-transparent text-indigo-200",
              )}
            >
              {r === "owner" ? t("roleOwner") : t("roleWorker")}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

/** Top bar: page title, "Novi termin" (Kalendar only) and the horizontal tab nav shown below `lg`. */
export function DashboardHeader({
  page,
  isOwner,
  items,
  onPageChange,
  onNewAppointment,
}: {
  page: Page;
  isOwner: boolean;
  items: NavItem[];
  onPageChange: (page: Page) => void;
  onNewAppointment: () => void;
}) {
  const t = useTranslations("dashboard");

  const titles: Record<Page, string> = {
    kalendar: t("calendarTitle"),
    zahtjevi: t("requestsTitle"),
    klijenti: t("clientsTitle"),
    usluge: t("servicesTitle"),
    radnici: t("staffTitle"),
    vrijeme: isOwner ? t("hoursTitleOwner") : t("hoursTitleWorker"),
    statistika: t("statsTitle"),
  };

  return (
    <div className="flex flex-col gap-3 border-b border-border-subtle bg-card px-4 py-3 lg:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-lg font-bold text-text-primary lg:text-xl">{titles[page]}</span>
        </div>
        {page === "kalendar" && (
          <Button type="button" variant="accent" size="sm" onClick={onNewAppointment}>
            <Icon icon={Plus} size={15} />
            <span className="hidden sm:inline">{t("newAppointment")}</span>
            <span className="sm:hidden">{t("newAppointmentShort")}</span>
          </Button>
        )}
      </div>
      <nav className="flex gap-1.5 overflow-x-auto lg:hidden">
        {items.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => onPageChange(n.id)}
            className={cn(
              "flex h-9 flex-none items-center gap-1.5 rounded-control px-3 text-sm font-medium",
              page === n.id ? "bg-brand text-primary-foreground" : "border border-border-subtle bg-card text-text-secondary",
            )}
          >
            {n.label}
            {!!n.count && <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-2xs font-bold text-[var(--text-on-accent)]">{n.count}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
}
