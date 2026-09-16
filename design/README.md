# SrediMe — imported design reference

Source: Claude Design project `089e1262-0841-4481-a4b2-4e12f6104048` ("SrediMe 3-Click Booking Wizard"),
design system `sredime-design-system-8009360d-1358-4569-ab2d-009230ef4e6a`.

`tokens.css` in this folder is a full reconstruction of the design system's CSS custom properties
(colors, typography, spacing, radius, elevation, motion) plus the base element resets and the
Plus Jakarta Sans font-face — pulled from `_ds_manifest.json` and `ds/tokens/base.css` in the design
project. These are the exact values `sredime-frontend` must use (map into `tailwind.config` / `globals.css`
— do not invent new colors/spacing, see `docs/design.md` and `docs/frontend.md`).

## Not pulled into this repo yet — fetch on demand

The design project also contains, per its manifest, 19 shadcn/ui-style React components
(`components/core`, `components/booking`, `components/discovery`, `components/overlays`) and full
click-through UI kits (`ui_kits/client-web/`, `ui_kits/salon-dashboard/`), plus 15 `.dc.html` screen
exports at the project root:

- `Home page.dc.html`
- `Pretraga salona.dc.html`
- `Salon profil.dc.html`
- `3-Click Booking.dc.html`
- `Moji termini.dc.html`
- `Klijent profil.dc.html`
- `Klijent historija.dc.html`
- `Recenzija.dc.html`
- `Prijava.dc.html`
- `Registracija.dc.html`
- `Pozivnica radniku.dc.html`
- `Salon setup.dc.html`
- `Salon dashboard.dc.html`
- `Statistika.dc.html`
- `Za salone.dc.html`

These were **not** downloaded in bulk to avoid bloating context/repo with content that's only needed
once, when the matching screen is actually being built. When implementing a given Next.js page, fetch
its `.dc.html` (and any relevant `components/**/*.jsx` or `ui_kits/**` file) with the `DesignSync` tool:

```
DesignSync(method: "get_file", projectId: "089e1262-0841-4481-a4b2-4e12f6104048", path: "<file path from list_files>")
```

Run `DesignSync(method: "list_files", projectId: "089e1262-0841-4481-a4b2-4e12f6104048")` first if the
exact path is unknown (component/guideline files live under `components/`, `guidelines/`, `ui_kits/` —
not all were visible in the initial shallow listing).

## Content/style rules (from the design system readme — apply everywhere in the frontend)

- **Language:** Bosnian only, all UI text through the i18n system (see `docs/frontend.md`).
- **Voice:** second person singular, informal ("ti", never "Vi"). Imperative verbs on buttons
  ("Zakaži", "Potvrdi", "Otkaži"), never noun phrases ("Rezervacija").
- **Casing:** sentence case everywhere, including headings/buttons/table headers. Bosnian sentence case
  for dates (months/weekdays lowercase: "14. oktobar"). The only uppercase text in the system is the
  12px eyebrow/label style (`--type-eyebrow-*`), tracked +0.04em.
- **Numbers:** prices as `35 KM` (space before suffix, never a symbol), durations `45 min`, percent with
  comma decimal (`6,3%`), thousands with a period (`1.240 KM`).
- **Booking status copy:** PENDING → "Čeka potvrdu", CONFIRMED → "Potvrđeno", COMPLETED → "Obavljeno",
  CANCELLED_BY_CLIENT / CANCELLED_BY_SALON → "Otkazano" / "Salon otkazao", NO_SHOW → "Nije se pojavio".
- **Never:** emoji, exclamation marks, urgency/countdown language, fake scarcity, hype adjectives
  ("najbolji", "revolucionarni"). Empty states state the fact + next action only.
- **Cancellation messaging:** repeat "otkazivanje je uvijek besplatno, bez naknade" at the points of
  friction (booking summary, cancel dialog, salon sidebar) — see `docs/specifikacija.md` §3.1.

## Visual system summary (full detail in `tokens.css` / `docs/design.md`)

- Primary `--brand` = deep indigo `#2E2B72`, accent `--accent` = warm gold `#E8A855` (one CTA per view,
  fill nowhere else). Canvas `#F8FAFC`, cards pure white with `--shadow-card`, `--radius-card` (20px),
  **no border** (border and shadow never both appear on a card).
- Type: Plus Jakarta Sans only, weights 400/500/700 (600 exists for the eyebrow/label range).
- Icons: Lucide, outline only, via a wrapper `Icon` component (mask-image + `currentColor`, tinted with
  `--icon-default` / `--icon-muted` / semantic colors) — never raw inline SVG paths, never emoji/unicode
  glyphs as icons.
- Component base: shadcn/ui (button, input, modal, checkbox, select, dropdown) + SrediMe-specific
  customs: `BookingSteps`, `ServiceRow`, `StaffPicker`, `TimeSlotGrid`, `AvailabilityCalendar` (booking),
  `SalonCard`, `SearchBar`, `FilterChip`, `StarRating` (discovery).
- No logo file/photography/icon binaries were supplied — logo is a type-set wordmark ("Sredi" indigo +
  "Me" gold, Plus Jakarta Sans 700, -0.03em), photography slots are token-colored placeholder blocks with
  a caption of what belongs there. Do not generate placeholder images/logos.
- **Not designed in this system** (build from `docs/` specs directly, no visual reference exists):
  auth screens (login/register/reset/onboarding wizards) and the worker-invitation flow — these ARE in
  the 15 `.dc.html` files list above (`Prijava`, `Registracija`, `Pozivnica radniku`) per the later
  iteration, so check those first before assuming no reference exists.
