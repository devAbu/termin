import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  CalendarDays,
  Check,
  CircleCheck,
  Inbox,
  NotebookPen,
  PhoneOff,
  Tag,
  UserX,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Navbar } from "@/components/chrome/navbar";
import { Logo } from "@/components/chrome/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

const PROBLEMS: { icon: LucideIcon; titleKey: string; bodyKey: string; bg: string; fg: string }[] = [
  { icon: PhoneOff, titleKey: "problem1Title", bodyKey: "problem1Body", bg: "bg-danger-bg", fg: "text-danger-fg" },
  { icon: UserX, titleKey: "problem2Title", bodyKey: "problem2Body", bg: "bg-warning-bg", fg: "text-warning-fg" },
  { icon: NotebookPen, titleKey: "problem3Title", bodyKey: "problem3Body", bg: "bg-surface-sunken", fg: "text-brand" },
];

const BENEFITS: { icon: LucideIcon; titleKey: string; bodyKey: string }[] = [
  { icon: CalendarClock, titleKey: "benefit1Title", bodyKey: "benefit1Body" },
  { icon: UserX, titleKey: "benefit2Title", bodyKey: "benefit2Body" },
  { icon: BarChart3, titleKey: "benefit3Title", bodyKey: "benefit3Body" },
  { icon: Users, titleKey: "benefit4Title", bodyKey: "benefit4Body" },
];

const STEPS = [
  { n: 1, titleKey: "step1Title", bodyKey: "step1Body" },
  { n: 2, titleKey: "step2Title", bodyKey: "step2Body" },
  { n: 3, titleKey: "step3Title", bodyKey: "step3Body" },
  { n: 4, titleKey: "step4Title", bodyKey: "step4Body" },
];

const MOCK_NAV: { icon: LucideIcon; labelKey: string; active?: boolean }[] = [
  { icon: CalendarDays, labelKey: "mockNavCalendar", active: true },
  { icon: Inbox, labelKey: "mockNavRequests" },
  { icon: Users, labelKey: "mockNavClients" },
  { icon: Tag, labelKey: "mockNavServices" },
  { icon: BarChart3, labelKey: "mockNavStats" },
];

const DONE = "bg-success-bg text-success-fg";
const CONFIRMED = "bg-brand-subtle text-brand";
const PENDING = "bg-warning-bg text-warning-fg";
const BLOCK = "bg-surface-sunken text-text-muted";

const MOCK_COLUMNS = [
  {
    name: "Amina",
    slots: [
      { time: "09:00", label: "Šišanje", css: DONE },
      { time: "10:30", label: "Bojenje", css: CONFIRMED },
      { time: "13:00", label: "Pauza", css: BLOCK },
      { time: "14:30", label: "Feniranje", css: CONFIRMED },
    ],
  },
  {
    name: "Mirza",
    slots: [
      { time: "09:30", label: "Brijanje", css: CONFIRMED },
      { time: "11:00", label: "Šišanje", css: PENDING },
      { time: "12:30", label: "Brada", css: CONFIRMED },
    ],
  },
  {
    name: "Lejla",
    slots: [
      { time: "10:00", label: "Manikir", css: CONFIRMED },
      { time: "12:00", label: "Gel lak", css: PENDING },
      { time: "15:00", label: "Pedikir", css: CONFIRMED },
    ],
  },
];

export function ForSalonsContent() {
  const t = useTranslations("forSalons");

  const footerColumns = [
    {
      title: t("footerNavHeading"),
      links: [
        { label: t("footerNavBenefits"), href: "#sta-dobijas" },
        { label: t("footerNavSteps"), href: "#kako-pocinje" },
        { label: t("footerNavDemo"), href: "/dashboard" },
        { label: t("footerNavSupport"), href: "#" },
      ],
    },
    {
      title: t("footerClientsHeading"),
      links: [
        { label: t("footerClientsHome"), href: "/" },
        { label: t("footerClientsSearch"), href: "/pretraga" },
        { label: t("footerClientsBookings"), href: "/moji-termini" },
      ],
    },
    {
      title: t("footerContactHeading"),
      links: [
        { label: "saloni@sredime.ba", href: "mailto:saloni@sredime.ba" },
        { label: "+387 33 000 000", href: "tel:+38733000000" },
        { label: t("footerTerms"), href: "/uslovi" },
        { label: t("footerPrivacy"), href: "/privatnost" },
      ],
    },
  ];

  return (
    <div className="flex min-h-full flex-col bg-surface-canvas">
      <Navbar />

      <section className="bg-gradient-to-b from-indigo-50 to-surface-canvas px-6 py-12 md:py-16">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="flex min-w-0 flex-col gap-4">
            <span className="inline-flex w-fit items-center gap-2 rounded-pill bg-card px-3.5 py-1.5 text-2xs font-semibold uppercase tracking-wide text-brand shadow-card">
              <Icon icon={NotebookPen} size={14} />
              {t("badge")}
            </span>
            <h1 className="text-3xl leading-tight text-balance md:text-5xl">{t("title")}</h1>
            <p className="max-w-[520px] text-base leading-relaxed text-text-secondary md:text-lg">
              {t("lead")}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button asChild variant="accent" size="lg">
                <a href="#prijava">
                  {t("ctaPrimary")}
                  <Icon icon={ArrowRight} size={18} />
                </a>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <a href="#dashboard">{t("ctaSecondary")}</a>
              </Button>
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              {(["heroPoint1", "heroPoint2", "heroPoint3"] as const).map((key) => (
                <span key={key} className="inline-flex items-center gap-2 text-sm text-text-secondary">
                  <Icon icon={CircleCheck} size={16} className="text-success-fg" />
                  {t(key)}
                </span>
              ))}
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-3">
            {PROBLEMS.map((p) => (
              <Card key={p.titleKey} className="p-4">
                <div className="flex items-start gap-3.5">
                  <span className={`flex h-9 w-9 flex-none items-center justify-center rounded-pill ${p.bg} ${p.fg}`}>
                    <Icon icon={p.icon} size={18} />
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-base font-semibold">{t(p.titleKey)}</span>
                    <span className="text-sm leading-relaxed text-text-secondary">{t(p.bodyKey)}</span>
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-14 px-6 py-14">
        <section id="sta-dobijas" className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <span className="eyebrow">{t("benefitsEyebrow")}</span>
            <h2 className="text-xl md:text-2xl">{t("benefitsTitle")}</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => (
              <Card key={b.titleKey} className="flex flex-col gap-3 p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-pill bg-brand-subtle text-brand">
                  <Icon icon={b.icon} size={22} />
                </span>
                <span className="text-lg font-bold tracking-[-0.01em] text-balance">{t(b.titleKey)}</span>
                <span className="text-sm leading-relaxed text-text-secondary">{t(b.bodyKey)}</span>
              </Card>
            ))}
          </div>
        </section>

        <section id="dashboard" className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          <div className="flex min-w-0 flex-col gap-3">
            <span className="eyebrow">{t("dashboardEyebrow")}</span>
            <h2 className="text-xl md:text-2xl">{t("dashboardTitle")}</h2>
            <p className="max-w-[460px] text-base leading-relaxed text-text-secondary">{t("dashboardBody")}</p>
            <div className="flex flex-col gap-2.5 pt-1">
              {(["dashboardPoint1", "dashboardPoint2", "dashboardPoint3", "dashboardPoint4"] as const).map((key) => (
                <span key={key} className="inline-flex items-start gap-2.5 text-sm leading-relaxed text-text-secondary">
                  <Icon icon={Check} size={16} className="mt-0.5 flex-none text-brand" />
                  {t(key)}
                </span>
              ))}
            </div>
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 pt-1 text-sm font-medium text-brand">
              {t("dashboardLink")}
              <Icon icon={ArrowRight} size={15} />
            </Link>
          </div>

          <div className="flex h-[300px] min-w-0 overflow-hidden rounded-card bg-card shadow-popover md:h-[360px]">
            <div className="flex w-[52px] flex-none flex-col gap-3.5 bg-surface-inverse px-2 py-4 text-brand-on sm:w-[128px] sm:px-3">
              <span className="hidden pl-1.5 text-sm font-bold tracking-[-0.01em] text-brand-on sm:inline">
                Sredi<span className="text-gold-400">Me</span>
              </span>
              <div className="flex flex-col gap-1">
                {MOCK_NAV.map((n) => (
                  <span
                    key={n.labelKey}
                    className={`inline-flex h-8 items-center justify-center gap-2 rounded-control px-2 text-xs font-medium whitespace-nowrap sm:justify-start ${
                      n.active ? "bg-indigo-500 text-brand-on" : "text-indigo-200"
                    }`}
                  >
                    <Icon icon={n.icon} size={15} className="flex-none" />
                    <span className="hidden sm:inline">{t(n.labelKey)}</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col bg-surface-canvas">
              <div className="flex min-h-11 flex-none flex-wrap items-center gap-2 bg-card px-3.5 py-1.5 shadow-inset-line">
                <span className="text-sm font-bold">{t("mockNavCalendar")}</span>
                <span className="text-xs text-text-muted">{t("mockDate")}</span>
                <span className="flex-1" />
                <Badge variant="warning" className="flex-none">{t("mockRequestsBadge")}</Badge>
              </div>
              <div className="grid min-h-0 flex-1 grid-cols-3 gap-2 p-3">
                {MOCK_COLUMNS.map((col) => (
                  <div key={col.name} className="flex min-w-0 flex-col gap-1.5">
                    <span className="eyebrow text-text-muted">{col.name}</span>
                    {col.slots.map((s) => (
                      <span key={s.time} className={`flex flex-col gap-0 rounded-lg px-2 py-1.5 ${s.css}`}>
                        <span className="text-[9px] font-semibold opacity-85">{s.time}</span>
                        <span className="truncate text-2xs font-medium">{s.label}</span>
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="kako-pocinje" className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <span className="eyebrow">{t("stepsEyebrow")}</span>
            <h2 className="text-xl md:text-2xl">{t("stepsTitle")}</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <Card key={s.n} className="flex flex-col gap-2.5 p-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-pill bg-brand text-sm font-bold text-brand-on">
                  {s.n}
                </span>
                <span className="text-base font-bold tracking-[-0.01em]">{t(s.titleKey)}</span>
                <span className="text-sm leading-relaxed text-text-secondary">{t(s.bodyKey)}</span>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <div id="prijava" className="flex flex-col gap-8 bg-surface-inverse px-6 py-10 text-white md:px-10 md:py-12">
        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-6 border-b border-indigo-400 pb-7">
          <div className="flex max-w-[560px] flex-col gap-2">
            <span className="text-2xl font-bold tracking-[-0.01em] md:text-[28px]">{t("finalTitle")}</span>
            <span className="text-sm leading-relaxed text-indigo-200">{t("finalBody")}</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="accent" size="lg">
              <Link href="/registracija">
                {t("ctaPrimary")}
                <Icon icon={ArrowRight} size={18} />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="border border-indigo-400 bg-transparent text-brand-on hover:bg-indigo-500"
            >
              <Link href="/registracija">{t("finalCtaSecondary")}</Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-7 md:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
          <div className="flex flex-col gap-2.5">
            <Logo inverse />
            <span className="max-w-[280px] text-sm leading-relaxed text-indigo-200">
              {t("cancellationNote")}
            </span>
          </div>
          {footerColumns.map((col) => (
            <div key={col.title} className="flex flex-col gap-2.5">
              <span className="eyebrow text-indigo-200">{col.title}</span>
              <div className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <Link key={link.label} href={link.href} className="text-sm text-indigo-200 hover:text-white">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap justify-between gap-3 border-t border-indigo-400 pt-5 text-xs text-indigo-200">
          <span>{t("copyright", { year: new Date().getFullYear() })}</span>
          <span>{t("cancellationNote")}</span>
        </div>
      </div>
    </div>
  );
}
