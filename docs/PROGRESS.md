# PROGRESS — SrediMe

**OBAVEZNO PRVO ČITANJE na početku svake sesije** (vidi `docs/CLAUDE.md`). Statusi: `[ ]` nije počeo,
`[~]` u toku, `[x]` gotovo. Ažurirati odmah nakon svakog završenog zadatka, ne čekati kraj sesije.

## Sljedeći koraci (kraj sesije 2026-09-16)

Sesija je svjesno zaustavljena ovdje na korisnikov zahtjev ("Dosta za danas"). Kad se nastavi, najvjerovatnije
sljedeći zadatak je **"Pretraga salona"** ekran (search/discovery stranica) — ovo nije još odlučeno kao
konačno, samo najvjerovatnija sljedeća stavka, korisnik će potvrditi na početku sljedeće sesije. Razlog:
Home page hero search (`components/home/hero-search.tsx`) i footer/nav linkovi već vode na `/pretraga?...`
koja trenutno 404-uje. Prije nego što se krene:
1. Provjeriti da li se `sredime-frontend` dev server i dalje pokreće čisto: `npm --prefix sredime-frontend run dev`
   (ili `preview_start` s `.claude/launch.json` konfiguracijom `sredime-frontend`).
2. Fetch-ovati `Pretraga salona.dc.html` preko `DesignSync get_file` (project `089e1262-0841-4481-a4b2-4e12f6104048`)
   za tačan layout/filtere prije pisanja koda — ne nagađati.
3. Proširiti `lib/mock-data/` po potrebi (trenutno samo `salons.json` postoji — 8 salona, 4 grada).

## 0. Okruženje / preduslovi

- [x] Pročitani svi `docs/*.md` (specifikacija, architecture, database, backend, frontend, permissions,
      design, mobile, CLAUDE.md)
- [x] Dizajn projekat uvezen (Claude Design, project `089e1262-0841-4481-a4b2-4e12f6104048`) — tokeni
      rekonstruisani u `design/tokens.css`, sadržajna/vizuelna pravila u `design/README.md`. Puni
      `.dc.html` ekrani i `components/**/*.jsx` iz dizajn sistema NISU još povučeni (povlače se on-demand
      po ekranu preko `DesignSync get_file`, vidi `design/README.md`)
- [x] **ODLUKA (2026-09-16): backend je PAUZIRAN za sad.** PHP/Composer/MySQL nisu instalirani na ovoj
      mašini i korisnik je eksplicitno tražio da se fokus stavi isključivo na `sredime-frontend`.
      `sredime-backend` (Laravel) se NE gradi dok se eksplicitno ne zatraži ponovo. Umjesto pravog API-ja,
      frontend koristi **mock JSON fixture podatke** kroz `lib/api/` sloj čiji povratni tipovi odgovaraju
      stvarnom API ugovoru iz `docs/backend.md`/`docs/database.md` — nikad hardkodirani literali direktno
      u komponentama. Sekcije 2–6 i 13 ispod (migracije, auth backend, booking engine backend,
      notifikacije, admin) ostaju `[ ]` dok se backend rad ne nastavi.

## 1. Setup projekta

- [ ] **PAUZIRANO** `sredime-backend/` — Laravel 11 projekat (ne raditi dok korisnik eksplicitno ne
      zatraži — vidi §0). Sve stavke ispod u ovoj sekciji koje pominju `sredime-backend` su pauzirane.
- [ ] `sredime-backend` — Sanctum instaliran i konfigurisan
- [ ] `sredime-backend` — MySQL konekcija konfigurisana (`.env`), baza kreirana
- [ ] `sredime-backend` — `filesystems.php` R2 disk (s3-compatible) konfigurisan
- [ ] `sredime-backend` — Resend mail driver konfigurisan
- [ ] `sredime-backend` — Queue driver konfigurisan (Redis ili DB fallback)
- [ ] `sredime-backend` — `/api/v1` route prefix i API routing skeleton
- [x] `sredime-frontend/` — Next.js 16 (App Router, TypeScript, Turbopack) projekat kreiran
- [x] `sredime-frontend` — mock data sloj: `lib/mock-data/salons.json` (8 saloni, 4 grada) +
      `lib/api/salons.ts` (`getFeaturedSalons`, `searchSalons`, `getSalonBySlug`, `getCities`) čiji
      povratni tip (`types/entities.ts`) odgovara stvarnom API ugovoru. Treba proširiti sa
      services/workers/bookings/reviews fixtures kad ti ekrani budu na redu.
- [x] `sredime-frontend` — Tailwind v4 tema (`app/globals.css`) namapirana na sve `design/tokens.css`
      vrijednosti — boje (indigo/gold override + slate/semantic aliasi), spacing (Tailwind default skala
      se already 1:1 poklapa), radius (`rounded-card/-control/-pill/-modal/-image`), shadow
      (`shadow-card/-card-hover/-modal/-focus`), motion (`duration-*`/`ease-*`), font (Plus Jakarta Sans
      preko `next/font/google`, self-hosted/optimized umjesto CDN linka iz dizajna)
- [x] `sredime-frontend` — shadcn/ui inicijalizovan (`base-nova` style); `Button`/`Input`/`Select`/`Badge`/
      `Card` u `components/ui/` su ručno prepisani (ne generisani boilerplate) da tačno prate
      control-height/radius/shadow tokene iz dizajna — shadcn-ov auto-generisani Button/stilovi NISU
      korišteni jer ne odgovaraju SrediMe veličinama
- [x] `sredime-frontend` — Lucide icon wrapper (`components/ui/icon.tsx`) postavljen
- [x] `sredime-frontend` — i18n routing skeleton (next-intl, `/bs/...`, `messages/bs.json`) postavljen.
      **VAŽNO:** `useTranslations()` koristi React `use()` interno i NE SMIJE se pozvati iz `async`
      Server komponente (React baca "Expected a suspended thenable") — obrazac koji koristimo: async
      page.tsx radi fetch pa prosljeđuje podatke kao props sync komponenti koja zove `useTranslations`
      (vidi `components/home/home-content.tsx` vs `app/[locale]/page.tsx`)
- [x] `sredime-frontend` — folder struktura: `app/[locale]/`, `components/{ui,chrome,discovery,home,booking}/`,
      `lib/{api,mock-data,constants}/`, `types/`, `i18n/`, `messages/`. (public)/(auth)/(client)/(owner)
      route groups iz `docs/frontend.md` dolaze kako se ekrani grade — samo Home page postoji za sad
- [ ] `sredime-frontend` — API klijent za PRAVI backend (token interceptor, 401/403 handling) — odgođeno
      dok backend nije aktivan; trenutni `lib/api/` je mock-only
- [x] `sredime-frontend` — React Query provider setup (`lib/query-provider.tsx`)
- [x] `.claude/launch.json` — dev server config (`npm --prefix sredime-frontend run dev`, port 3000) za
      `preview_start`

## 2. Migracije i modeli (`docs/database.md`)

- [ ] `users` migracija + `User` model (role enum, password hash)
- [ ] `salons` migracija + `Salon` model (owner_id FK, country_code, lat/lng nullable, status enum)
- [ ] `salon_images` migracija + relacija
- [ ] `workers` migracija + `Worker` model (can_block_clients)
- [ ] `worker_schedules` migracija
- [ ] `worker_time_off` migracija
- [ ] `services` migracija + `Service` model (decimal price/currency cast, discount_percent)
- [ ] `worker_service` pivot migracija
- [ ] `bookings` migracija + `Booking` model (status enum, composite index salon+worker+scheduled_at)
- [ ] `favorite_service_worker` migracija + model (unique client+salon+service)
- [ ] `reviews` migracija + model (unique booking_id)
- [ ] `blacklist_entries` migracija + model
- [ ] `client_notes` migracija + model
- [ ] `loyalty_accounts` migracija + model (struktura samo, bez logike — V3/V4)
- [ ] `notifications` migracija + model (log tabela, channel enum email-only u V1)
- [ ] `worker_invitations` migracija + model (pozivnica token flow)
- [ ] Svi indexi iz `docs/database.md` §Indexing strategija primijenjeni
- [ ] `app/Scopes/BelongsToSalonScope` global scope (tenant izolacija) + primijenjen na sve salon-scoped
      modele (Worker, Service, Booking, Review, BlacklistEntry, ClientNote, LoyaltyAccount)
- [ ] Factories + seeders za sve modele (dev/test podaci)

## 3. Auth (Sanctum) — `docs/specifikacija.md` §4.1, `docs/permissions.md`

- [ ] Registracija (klijent) — email/mobitel + lozinka
- [ ] Registracija vlasnika (kreira i prvi Salon ili odvojen "Salon setup" korak)
- [ ] Radnik registracija ISKLJUČIVO putem pozivnice (token flow, `WorkerInvitation`)
- [ ] Login (Sanctum token)
- [ ] Reset lozinke (email flow, Resend)
- [ ] Onboarding wizard po ulozi (klijent, vlasnik, radnik)
- [ ] Social login (Google/Apple) — MVP scope, može ići nakon osnovnog email/password flow-a
- [ ] Role/salon-membership middleware + Policy skeleton (`docs/permissions.md`)
- [ ] Frontend: Prijava, Registracija, Pozivnica radniku ekrani (vidi dizajn `.dc.html` ako postoje)

## 4. Salon CRUD — `docs/specifikacija.md` §4.2

- [ ] Kreiranje/uređivanje salona (naziv, opis, adresa, grad, kategorija)
- [ ] Geocoding job (Nominatim, async, popunjava lat/lng, tih fail na null)
- [ ] Upload slika salona (do 10, R2 storage) + `salon_images`
- [ ] CRUD radnici (ime, slika, pozicija, bio) + pozivnica generisanje
- [ ] CRUD usluge (naziv, cijena, trajanje, buffer, slika, discount_percent toggle)
- [ ] Radno vrijeme po danima (salon) + po radniku (`worker_schedules`, `worker_time_off`)
- [ ] Cjenovnik/galerija kao samostalna dijeljiva stranica
- [ ] Policy provjere (vlasnik-only za sve admin akcije salona)

## 5. Booking Engine (jezgro) — `docs/specifikacija.md` §4.3 — NAJKRITIČNIJI DIO

- [ ] Dostupnost endpoint (radnik + usluga + datum → slobodni slotovi, poštuje radno vrijeme, buffer,
      postojeće bookinge, time-off)
- [ ] 3-Click Booking flow (usluga → radnik → termin → potvrda) backend endpoint(i)
- [ ] Statusni model + `BookingStatusService` (prelazi iz `docs/specifikacija.md` §3.1)
- [ ] Zabrana duplih termina istog klijenta u isto vrijeme
- [ ] Otkazivanje (uvijek besplatno, bilo koji status → cancelled_by_client/cancelled_by_salon)
- [ ] Ručno dodavanje/izmjena termina (vlasnik/radnik, `manually_entered` flag)
- [ ] Blokiranje vremena u kalendaru (pauza, slobodan dan, godišnji) — koristi `worker_time_off`
- [ ] NO_SHOW ručno označavanje + blacklist prijedlog (prag konfigurabilan po salonu, default 3/90 dana)
- [ ] Favorite usluga+radnik endpoint (create/delete) + "zadnje korišteni radnik" upit fallback
- [ ] Deep linking iz emaila u rezervaciju/aplikaciju
- [ ] Zakaži ponovo (One-Tap Rebook)
- [ ] Globalni real-time filter po datumu/satu (search/discovery strana upita ovo)
- [ ] Frontend: 3-Click Booking wizard (`components/booking/` iz dizajna: BookingSteps, ServiceRow,
      StaffPicker, TimeSlotGrid, AvailabilityCalendar)

## 6. Notifikacije (email, Resend) — `docs/specifikacija.md` §4.5

- [ ] Mailable + Job: potvrda rezervacije (klijent, vlasnik, radnik)
- [ ] Mailable + Job: podsjetnik prije termina (scheduled)
- [ ] Mailable + Job: otkazivanje
- [ ] Mailable + Job: promjena termina od salona
- [ ] `notifications` log zapis po poslatom mailu

## 7. Klijent profil — `docs/specifikacija.md` §4.4

- [ ] Nadolazeće/prošle rezervacije, otkazivanje iz profila
- [ ] Uređivanje ličnih podataka, promjena lozinke
- [ ] Frontend: "Moji termini", "Klijent profil", "Klijent historija" ekrani

## 8. Vlasnik/Radnik Dashboard — `docs/specifikacija.md` §4.6

- [ ] Pregled nadolazećih rezervacija (kalendar view)
- [ ] Označavanje NO_SHOW
- [ ] Statistika (ne)potvrđenih termina od radnika
- [ ] Historija klijenata + interni komentar (`ClientNote`, vidljivo samo tom salonu)
- [ ] Frontend: "Salon dashboard" ekran (kalendar, zahtjevi, klijenti, usluge)

## 9. Pretraga i Discovery — `docs/specifikacija.md` §4.7

- [~] Pretraga po gradu i kategoriji/usluzi — mock `searchSalons()` u `lib/api/salons.ts` postoji
      (filtrira grad/kategorija/query/danas), ali "Pretraga salona" EKRAN (ruta `/pretraga`) još nije
      izgrađen — hero search na Home page-u već linkuje na `/pretraga?grad=...&q=...` i vraća 404
- [ ] Filter "Slobodno danas"/"Slobodno sada"
- [ ] Filter po ocjeni, cijeni, dostupnosti
- [ ] Pretraga po nazivu usluge
- [ ] "Blizu mene" — browser geolocation (frontend) + Haversine sort (backend), tih fallback na grad.
      **Napomena:** stvarni Home page.dc.html iz dizajna NEMA "Najbliže tebi" sekciju (samo "Popularno u
      [gradu]") iako je frontend.md/specifikacija.md §4.7 spominju — pratili smo dizajn kao izvor istine;
      "Najbliže tebi" ostaje TODO, dizajn za nju treba ili izvesti iz postojećeg SalonCard-a ili dograditi
- [x] Frontend: Home page — hero (grad select + usluga/salon search + kategorija chips), "Popularno u
      Sarajevu" salon grid (`SalonCard`), "Kako radi" 3-koraka sekcija, navbar/footer chrome. Vizuelno
      provjereno u browseru (screenshot), tačno prati `Home page.dc.html` iz dizajna. Cijene formatirane
      bez ".00" (`lib/format.ts`). "Pretraga salona" ekran NIJE gotov (vidi red iznad)

## 10. Recenzije — `docs/specifikacija.md` §4.9

- [ ] Review kreiranje (samo za `completed` booking, unique po bookingu)
- [ ] Prikaz na profilu salona
- [ ] Frontend: "Recenzija" ekran

## 11. Statistike i izvještaji (vlasnik) — `docs/specifikacija.md` §4.12

- [ ] Prihod po danu/sedmici/mjesecu
- [ ] Najpopularnije usluge i radnici
- [ ] Stopa otkazivanja i no-showova
- [ ] Izvještaji po radniku
- [ ] Frontend: "Statistika" ekran

## 12. Ostali ekrani iz dizajna (svih 15 `.dc.html`)

- [x] Home page (vidi §9 gore za detalje)
- [ ] Pretraga salona
- [ ] Salon profil
- [ ] 3-Click Booking
- [ ] Moji termini
- [ ] Klijent profil
- [ ] Klijent historija
- [ ] Recenzija
- [ ] Prijava
- [ ] Registracija
- [ ] Pozivnica radniku
- [ ] Salon setup
- [ ] Salon dashboard
- [ ] Statistika
- [ ] Za salone (marketing/landing stranica za vlasnike)

## 13. Admin (funkcionalno, BEZ UI) — `docs/specifikacija.md` §4.13

- [ ] Salon status enum (`pending`/`active`/`suspended`) postoji i poštuje se u query-jima (salon
      nevidljiv klijentima dok nije `active`) — odobravanje se radi kroz Tinker/SQL, ne UI

## Napomena o obimu / redoslijedu

Redoslijed rada: setup (§1) → migracije/modeli (§2) → auth (§3) → salon CRUD (§4) → booking engine (§5,
najkritičniji) → notifikacije (§6) → ostali ekrani/moduli (§7–12). Ne raditi V2+ funkcionalnost
(payment, Meilisearch, multi-lokacija UI, loyalty, waiting lista) — vidi `docs/specifikacija.md` §4 za
punu listu šta NIJE u V1.
