# PROGRESS — SrediMe

**OBAVEZNO PRVO ČITANJE na početku svake sesije** (vidi `docs/CLAUDE.md`). Statusi: `[ ]` nije počeo,
`[~]` u toku, `[x]` gotovo. Ažurirati odmah nakon svakog završenog zadatka, ne čekati kraj sesije.

## Sljedeći koraci (kraj sesije 2026-09-18, petnaesti krug)

**SVIH 15 `.dc.html` EKRANA JE GOTOVO** (vidi §12) I **SVE 3 DOGOVORENE FRONTEND POLISH STAVKE IZ §14
SU GOTOVE.** Fokus sesije bio je frontend polish/proširenja dok je backend i dalje PAUZIRAN (§0) —
korisnikova eksplicitna odluka: "posto nam su nam backend, baza, auth i to trenutno manje bitno...sad
nam je fokus na FRONT (UI/UX)". Pun detalj svake stavke u **§14** ispod:

1. [x] Popust na usluzi — prava forma za uređivanje usluge u dashboard "Usluge" tabu +
   `discount_percent` toggle. Usput otkriven i popravljen ŠIRI bug: popust se računao u pogrešnom
   smjeru (`price` tretiran kao već-diskontovana cijena) kroz CIJELU aplikaciju, uklj. sve
   prihod-računice u Statistici/Klijent historiji — vidi §14.1 za pun detalj
2. [x] Favorite usluga+radnik (booking wizard korak 2, sva 3 stanja iz `docs/frontend.md`) +
   lokacijska pretraga "blizu mene" na Pretraga i Home page (`docs/specifikacija.md` §4.3/§4.7) —
   vidi §14.2 za pun detalj. Ovo je bila najveća/najskuplja stavka, prvobitno odgođena pa naknadno
   urađena istu sesiju
3. [x] Rola (Vlasnik/Radnik) se nije prenosila kroz URL između `/dashboard` i
   `/dashboard/klijenti/[ime]` — popravljeno preko `?role=` search parametra, isti obrazac kao
   postojeći `?tab=`. (Nije bio bug koji je korisnik prvobitno sumnjao — taj originalni scenario
   "radnik blokira sebe" nije reprodukovan i korisnik ga je odbacio; ovo je bio NOVI, stvarno nađen,
   manji problem otkriven pri uživo testiranju.)

**Nema više dogovorenih frontend stavki na čekanju** — `npx tsc --noEmit` čist (0 grešaka) na kraju
sesije. Sljedeći korak je ili nova frontend stavka (korisnikov zahtjev) ili nastavak backend faze
(§0 PAUZIRAN dok se eksplicitno ne zatraži, počinje se od §1).

**AŽURIRANO 2026-09-18:** ručni QA prolaz kroz cijelu aplikaciju (desktop + mobile) je gotov, 3 nova
nalaza dogovorena kao sljedeći frontend rad — vidi **§15** za pun detalj i redoslijed:
1. [x] Mobilni header nema hamburger/meni — nestaju Pretraga/Moji termini/Za salone/Registruj se
   ispod ~768px, bez zamjene. GOTOVO — vidi §15.1 za pun detalj
2. [x] Navbar ne prikazuje ulogovano stanje nakon dev "Brza prijava (test)" quick-login-a (Moji
   termini/Profil ispravno znaju korisnika, header i dalje pokazuje "Prijavi se"). GOTOVO — vidi
   §15.2 za pun detalj
3. [x] `/pretraga` i `/za-salone` nemaju svoj `<title>` (prikazuju generički Home page naslov).
   GOTOVO — vidi §15.3 za pun detalj

**SVE 3 STAVKE IZ §15 SU SAD GOTOVE** (`npx tsc --noEmit` čist nakon svake).

**AŽURIRANO 2026-09-18 (isti dan, naredni krug):** korisnik je tražio KODNI audit (ne samo UI) —
bugovi, dupliciran kod, i da li je arhitektura odvojena/spremna za budući mobile app (V3+, po
`docs/frontend.md`/`docs/mobile.md`). Nalazi i plan dogovoreni i upisani u **§16**:
- **§16.1 Faza 1 — GOTOVO I NEZAVISNO VERIFIKOVANO** (vidi §16.1 ispod za pun detalj): 2 stvarna bug-a
  (UTC datum-bug u `availability.ts`, pad aplikacije kod uzastopnog pomjeranja termina) + 6 stavki
  dupliciranog koda (initials helper, boja bedža statusa, modal/toast markup, Role/Page tip,
  hardkodirana mock imena) popravljeno. `npx tsc --noEmit` čist nakon svake stavke, live-testirano u
  browseru (Zahtjevi tab dashboard-a za Pomjeri-reset, dashboard/klijenti/radnici tabovi za initials,
  quick-login za SESSION_NAMES/navbar firstName).
  **DODATNA VERIFIKACIJA (isti dan, korisnikov eksplicitan zahtjev prije "kreni" na Fazu 2):**
  6-anglovni code-review (paralelni agenti: line-by-line, removed-behavior audit, cross-file tracer,
  reuse/simplification, efficiency/altitude, CLAUDE.md konvencije) + egzaktno logičko testiranje oba
  bug-fixa protiv stvarnog izvornog koda — Bug A: 144 sat/minut kombinacije kroz CEST/CET (DST), stari
  kod 9 grešaka / novi kod 0; end-to-end `computeSlots()` reprodukcija originalnog scenarija (13
  lažno-slobodnih prošlih slotova → 0). Bug B: 50 exhaustivnih kombinacija (broj slotova × klik
  indeks × broj slotova drugog termina), stari kod 10/50 padova (TypeError) / novi kod 0/50. Sve 6
  konsolidacija potvrđene bez pokvarenih import putanja/izgubljenog ponašanja/zamijenjenih vrijednosti;
  jedina namjerna promjena ponašanja (unifikacija boje bedža statusa na klijentskoj strani) potvrđena
  kao dogovorena u planu (ne slučajna regresija) i vizuelno provjerena uživo (computed CSS boje).
  4 sitna nalaza niskog rizika (nisu bugovi) odmah popravljena: `contactFor()` sad koristi
  `firstName()`; `BOOKING_STATUS_TONE` izdvojen iz `lib/format.ts` u novi `lib/booking-status.ts`
  (format.ts ostaje čisto o formatiranju teksta, bez zavisnosti od `BookingStatus` domenskog tipa);
  `lastUsedWorkerName` u booking-wizard.tsx pojednostavljen na jedan izraz; `moveChoice` reset
  refaktorisan sa ručnih `openActionModal`/`closeActionModal` helpera (fragilno — oslanja se na
  disciplinu pozivaoca) na React-preporučeni "adjust state during render" obrazac vezan za identitet
  `actionModal`-a (strukturalno se ne može zaboraviti na budućem novom exit putu) — **napomena:** prvi
  pokušaj ovog refaktora je koristio `useEffect` za reset, što je ODMAH uneseno kao NOVI
  `react-hooks/set-state-in-effect` lint problem (ista klasa već postojeće tech-debt greške u
  navbar.tsx/search-content.tsx/home-content.tsx) — ispravljeno na pravi React-dokumentacijski obrazac
  (state adjustment tokom rendera preko `prevActionModal` poređenja) prije nego je ušlo u kod. `npx tsc
  --noEmit` i `npx eslint .` čisti (identične 6 pre-existing grešaka kao prije Faze 1, nijedna nova),
  sve 4 stavke ponovo live-testirane u browseru.
- **§16.2 Faza 2** (posebna runda, POSLIJE Faze 1, veći/rizičniji zahvat, ČEKA "kreni"): rastavljanje
  4 "god-komponente" (600-870 linija) i izvlačenje poslovne logike/validacije u `lib/` — prava
  popravka za mobile-ready separaciju

Nakon §16.2: nastavak backend faze (§0 PAUZIRAN dok se eksplicitno ne zatraži, počinje se od §1) ili
nova frontend stavka.

**Šta ostaje van V1 frontend obima** (nije "ekran" iz liste od 15, nego stvarni backend/funkcionalni
rad): pravi auth (Sanctum token, sesija, Navbar "ulogovan" state), migracije/modeli, booking engine
backend, notifikacije email, admin. Sve dokumentovano u §1–§8/§13 ispod, ostaje `[ ]`/`[~]` dok se
`sredime-backend` eksplicitno ne nastavi (§0 — trenutno PAUZIRAN).
1. Provjeriti da li se `sredime-frontend` dev server i dalje pokreće čisto (`preview_start` s
   `.claude/launch.json` konfiguracijom `sredime-frontend`). **Napomena:** ovu sesiju je `next dev` više puta
   pao na Windows-specifičnoj grešci (`UNKNOWN: unknown error, open '.next/dev/types/...'`, EPERM-ish file
   lock) — rješenje je bilo `rm -rf .next` pa ponovo `preview_start`; ako se opet desi, isto probati prije
   dubljeg debug-a.
2. Fetch-ovati odgovarajući `.dc.html` preko `DesignSync get_file`
   (project `089e1262-0841-4481-a4b2-4e12f6104048`) za bilo koji od gornjih — ne nagađati layout.
3. **Kad se ipak dođe na Prijava/Registracija:** ovo je frontend-first faza, `sredime-backend` je
   PAUZIRAN (§0). Ekrani se mogu izgraditi vizuelno i sa mock/lokalnim "auth" state-om (npr. React Context +
   localStorage ili samo lokalni state koji glumi "ulogovan si"), ali STVARNA autentikacija (Sanctum token,
   hashing, sesija) ide tek kad backend nastavi. Odlučiti tada koliko "glumljenog" auth-a ima smisla praviti
   (npr. da Navbar prikaže "SK Sanela" chip umjesto Prijavi se/Registruj se, i da "Moji termini"/booking
   wizard/Recenzija/Klijent profil koriste `getCurrentClient()` iz `lib/api/client.ts` (postoji od ove
   sesije, `types/entities.ts` ima sad i `User` interfejs) umjesto hardkodiranog `CURRENT_CLIENT_ID` u
   `lib/api/bookings.ts`). `components/chrome/navbar.tsx` trenutno UVIJEK prikazuje Prijavi se/Registruj se
   — namjerna odluka kroz sve dosadašnje client-persona ekrane, ne popravljati usput, uraditi zajedno s
   pravim auth-om. Isto važi za vlasnik/radnik stranu: `CURRENT_SALON_ID` (=1, Studio Lux) u
   `lib/api/bookings.ts` i role toggle owner/worker u `components/owner/dashboard-content.tsx` su
   session-only UI stanje, ne pravi auth — zamijeniti stvarnim salon-membership/role kad auth dođe.

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
- [x] `sredime-frontend` — folder struktura: `app/[locale]/(public)/`, `components/{ui,chrome,discovery,home,salon,booking}/`,
      `lib/{api,mock-data,constants}/`, `types/`, `i18n/`, `messages/`. `(public)` route group iz
      `docs/frontend.md` uveden ovu sesiju (Home + Pretraga premješteni, Salon profil rođen unutra) —
      `(auth)/(client)/(owner)` dolaze kako ti ekrani budu na redu
- [ ] `sredime-frontend` — API klijent za PRAVI backend (token interceptor, 401/403 handling) — odgođeno
      dok backend nije aktivan; trenutni `lib/api/` je mock-only
- [x] `sredime-frontend` — React Query provider setup (`lib/query-provider.tsx`) — **napomena:** trenutno
      NEKORIŠTEN u praksi; pokušaj korištenja na Pretraga ekranu je uveo bug (per-filter `queryKey` uz
      statičan `initialData` "zamrzava" rezultate, vidi §9), pa filtriranje/sortiranje ide kroz sinhrone
      `useMemo` pozive na mock funkcije umjesto `useQuery`. Provider ostaje spreman za kad backend uvede
      pravu mrežnu latenciju gdje će react-query stvarno biti koristan
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
- [x] Frontend: Prijava, Registracija, Pozivnica radniku ekrani — vidi §12 za puni detalj svakog. Sve
      session-only/mock (nema pravog Sanctum auth-a ispod, vidi ostale stavke ove sekcije koje ostaju `[ ]`)

## 4. Salon CRUD — `docs/specifikacija.md` §4.2

- [ ] Kreiranje/uređivanje salona (naziv, opis, adresa, grad, kategorija)
- [ ] Geocoding job (Nominatim, async, popunjava lat/lng, tih fail na null)
- [ ] Upload slika salona (do 10, R2 storage) + `salon_images`
- [ ] CRUD radnici (ime, slika, pozicija, bio) + pozivnica generisanje
- [ ] CRUD usluge (naziv, cijena, trajanje, buffer, slika, discount_percent toggle)
- [ ] Radno vrijeme po danima (salon) + po radniku (`worker_schedules`, `worker_time_off`)
- [ ] Cjenovnik/galerija kao samostalna dijeljiva stranica
- [ ] Policy provjere (vlasnik-only za sve admin akcije salona)
- [x] Frontend: "Salon setup" onboarding wizard ekran (vidi §12 za puni detalj) — vizuelni/session-only,
      ne piše u `lib/mock-data/` (nema pravog salona da se upiše, vidi napomenu u §12)

## 5. Booking Engine (jezgro) — `docs/specifikacija.md` §4.3 — NAJKRITIČNIJI DIO

- [~] Dostupnost endpoint — **mock verzija** gotova: `lib/api/availability.ts` (`computeSlots`, pure +
      testabilna, `getAvailableSlots` async wrapper po istom obrascu kao `filterSalons`/`searchSalons`).
      Poštuje `Salon.openingHours` (po danu sedmice) i `Service.durationMinutes`+`bufferMinutes`; "taken"
      slotovi su DETERMINISTIČKI pseudo-random (hash od datum+radnik+vrijeme, ~1/5 zauzeto) jer nema
      pravih bookinga za provjeru. Ne poštuje `worker_time_off` (ne postoji mock za to). Pravi backend
      endpoint zamjenjuje ovu funkciju 1:1 (isti pozivni obrazac), ali logika iznutra mora biti stvarna.
      **NAPOMENA (Salon dashboard sesija):** ova pseudo-random funkcija se koristi SAMO na klijent strani
      (booking wizard). "Salon dashboard" (`components/owner/new-appointment-modal.tsx`, "Pomjeri" modal u
      `dashboard-content.tsx`) ima SVOJU, ODVOJENU dostupnost-logiku koja stvarno provjerava
      `lib/mock-data/bookings.json` (busy-check protiv pravih termina tog radnika/dana) — ISPRAVNIJA od
      `computeSlots`, ali dvije odvojene mock implementacije postoje paralelno. Isti obrazac kao u
      originalnom dizajnu (i tamo su "3-Click Booking" i "Salon dashboard" imali odvojenu, nepovezanu
      availability logiku) — ali kad pravi backend dođe, treba SAMO JEDAN pravi dostupnost servis koji oba
      ekrana koriste.
- [x] Frontend: 3-Click Booking wizard — ruta `/saloni/[slug]/zakazi`
      (`app/[locale]/(public)/saloni/[slug]/zakazi/page.tsx` + `components/booking/booking-wizard.tsx`),
      vizuelno provjeren desktop+mobile, testiran cijeli put usluga→radnik→termin→potvrda→"done", uklj.
      deep-linking sa Salon profil ekrana (`?usluga=`/`?radnik=` presjeda korake kad je već poznato).
      Namjerno drugačije/skraćeno od `3-Click Booking.dc.html`:
        - Samo JEDNA varijanta koraka "Termin" implementirana (dizajn je imao 3: kalendar-grid, day-strip
          + grupisani slotovi, agenda — izabrana je day-strip/grupisani variant B, mobile-first,
          jednostavnija za izgradnju od punog kalendar-grid komponenta)
        - Dizajnov "Širina"/"Korak 3 varijanta"/"Režim potvrde"/"Salon 1 vs 3 radnika"/"Stanje" toolbar je
          developer-only QA alat, nije implementiran (isti obrazac kao ranije preskočeni toggle-i)
        - "Auto-potvrda" salon-nivo postavka NE postoji u `docs/database.md` šemi — fiksirano na
          "Čeka potvrdu" (pending) svugdje, konzistentno s `BookingStatus` enum-om gdje je PENDING prvi
          naveden status. Treba schema/product odluku (`salons.auto_confirm` kolona?) prije backend rada
        - "Rubna stanja" (slot zauzet dok biraš, dupli termin) NISU implementirana — zahtijevaju stvarnu
          `Booking` tabelu/historiju za detekciju, koje nema u mock fazi
        - Radnik picker filtrira po `Service.workerIds` (samo radnici dodijeljeni toj usluzi) — STROŽIJE
          od dizajna (koji je prikazivao sva 3 radnika za svaku uslugu); ispravnije jer poštuje
          `worker_service` pivot iz `docs/database.md`
        - Korak "Radnik" ima i "Bilo koji radnik" opciju — dostupnost za nju je UNIJA slobodnih slotova
          svih radnika dodijeljenih toj usluzi (slot dostupan ako je BAREM JEDAN radnik slobodan)
        - Korak "Pregled i potvrda" koristi guest-style mini formu (ime/telefon/email) umjesto
          pretpostavljenog ulogovanog klijenta — auth ekrani (§3) ne postoje još, vidi napomenu na vrhu
          fajla. "Potvrdi termin" NE PERSISTUJE nigdje (nema write-sloj u `lib/api/bookings.ts`, koji od
          ove sesije postoji ali samo za READ) — samo prelazi na "done" prikaz lokalno. **Rezervacija
          napravljena kroz wizard se NE pojavljuje na "Moji termini" ekranu** (koji sad postoji, vidi §7)
          jer su to dvije nepovezane mock površine dok ne postoji stvaran write endpoint
- [ ] Backend endpoint(i) za sve gore (kad backend nastavi rad)
- [ ] Statusni model + `BookingStatusService` (prelazi iz `docs/specifikacija.md` §3.1)
- [ ] Zabrana duplih termina istog klijenta u isto vrijeme
- [ ] Otkazivanje (uvijek besplatno, bilo koji status → cancelled_by_client/cancelled_by_salon)
- [ ] Ručno dodavanje/izmjena termina (vlasnik/radnik, `manually_entered` flag)
- [ ] Blokiranje vremena u kalendaru (pauza, slobodan dan, godišnji) — koristi `worker_time_off`
- [ ] NO_SHOW ručno označavanje + blacklist prijedlog (prag konfigurabilan po salonu, default 3/90 dana)
- [ ] Favorite usluga+radnik endpoint (create/delete) + "zadnje korišteni radnik" upit fallback — vidi
      napomenu u booking wizard-u iznad: radnik picker trenutno UVIJEK prikazuje "Nova usluga" stanje
      (ništa pred-selektovano) jer nema klijent/booking historije za provjeru druga dva stanja iz
      `docs/frontend.md` §"Booking flow"
- [ ] Deep linking iz emaila u rezervaciju/aplikaciju
- [ ] Zakaži ponovo (One-Tap Rebook)
- [ ] Globalni real-time filter po datumu/satu (search/discovery strana upita ovo)

## 6. Notifikacije (email, Resend) — `docs/specifikacija.md` §4.5

- [ ] Mailable + Job: potvrda rezervacije (klijent, vlasnik, radnik)
- [ ] Mailable + Job: podsjetnik prije termina (scheduled)
- [ ] Mailable + Job: otkazivanje
- [ ] Mailable + Job: promjena termina od salona
- [ ] `notifications` log zapis po poslatom mailu

## 7. Klijent profil — `docs/specifikacija.md` §4.4

- [x] Nadolazeće/prošle rezervacije, otkazivanje iz profila — "Moji termini" ekran (vidi §12 za puni detalj).
      Otkazivanje je trenutno SAMO klijent-side (React state za sesiju, ne perzistuje, nema backend
      endpoint) — refresh stranice vraća "otkazani" termin jer ništa nije stvarno sačuvano
- [x] Uređivanje ličnih podataka, promjena lozinke — "Klijent profil" ekran (vidi §12 za puni detalj).
      Kao i otkazivanje: SVE je client-side/session-only, ništa se ne perzistuje (nema `users` write
      endpoint) — "Sačuvaj promjene"/"Promijeni lozinku" samo ažuriraju lokalni React state + toast
- [x] Frontend: "Klijent profil" ekran (vidi §12)
- [x] Frontend: "Klijent historija" ekran (vidi §12 za puni detalj) — **POTVRĐENO: ovo je SALON/VLASNIK
      strana**, ne klijentska — per-klijent drill-down unutar "Salon dashboard" (isti sidebar), ruta
      `/dashboard/klijenti/[ime]`

## 8. Vlasnik/Radnik Dashboard — `docs/specifikacija.md` §4.6

- [x] Pregled nadolazećih rezervacija (kalendar view) — "Salon dashboard" ekran, vidi §12 za puni detalj.
      Lista po danu (grid/calendar-kolona prikaz NIJE implementiran — namjerno skraćenje, vidi §12), dan
      navigacija (prethodni/danas/sljedeći), filter po radniku
- [x] Označavanje NO_SHOW — akcija na svakom terminu (samo za `confirmed` status, poštuje statusni model)
- [x] Statistika (ne)potvrđenih termina od radnika — mini "Statistika" tab u dashboard-u (KPI kartice +
      po-radniku potvrđeno/nepotvrđeno, RAČUNA SE iz stvarnih bookings podataka). Samostalan "Statistika"
      ekran (puniji izvještaji, vidi §11) ostaje TODO
- [x] Historija klijenata + interni komentar (`ClientNote`, vidljivo samo tom salonu) — "Klijenti" tab u
      dashboard-u ima listu + "Historija" link po klijentu, koji vodi na odvojeni "Klijent historija"
      ekran sa punom historijom termina i `ClientNote` CRUD-om, vidi §12
- [x] Frontend: "Salon dashboard" ekran (kalendar, zahtjevi, klijenti, usluge, radnici, radno vrijeme,
      mini statistika) — vidi §12 za puni detalj

## 9. Pretraga i Discovery — `docs/specifikacija.md` §4.7

- [x] Pretraga po gradu i kategoriji/usluzi — "Pretraga salona" ekran (ruta `/pretraga`,
      `app/[locale]/(public)/pretraga/page.tsx` + `components/discovery/search-content.tsx`) gotov i
      vizuelno provjeren (screenshot desktop + mobile), tačno prati `Pretraga salona.dc.html` iz dizajna.
      Filtriranje je sinhrono na klijentu (`filterSalons()` u `lib/api/salons.ts`, čist/testabilan iz
      `searchSalons()` async wrapper-a) — **VAŽNO:** ne koristiti React Query `initialData` za ovakav slučaj
      (per-filter queryKey uz statičan `initialData` "zamrzava" rezultate jer se nova data smatra svježom
      unutar staleTime-a — otkriven i popravljen bug u ovoj sesiji). Deep linking s Home page-a
      (`?grad=...&q=...`) i sa Salon profil breadcrumb-a (`?kategorija=...`) radi end-to-end.
- [x] Filter "Slobodno danas"/"Slobodno sada" — "sada" je heuristika (termin danas i počinje u sljedeća 3h
      ili je počeo do 30min unazad), pošto mock podaci nemaju satnu granularnost van `nextSlotLabel` teksta
- [x] Filter po ocjeni, cijeni, dostupnosti — "Ocjena 4,5+" i "Do 20 KM" chipovi
- [x] Pretraga po nazivu usluge — tekstualna pretraga uključuje `Salon.description`, pored naziva/grada.
      Prava pretraga po nazivu KONKRETNE usluge (npr. "bojenje" pogađa samo salone koji je nude) nije
      implementirana — trebala bi `lib/mock-data/services.json` (sada postoji, vidi §12) da join-uje, ali
      `searchSalons()` to trenutno ne radi; TODO ako se pokaže bitno prije backend faze
- [ ] "Blizu mene" — browser geolocation (frontend) + Haversine sort (backend), tih fallback na grad.
      **Napomena:** stvarni Home page.dc.html iz dizajna NEMA "Najbliže tebi" sekciju (samo "Popularno u
      [gradu]") iako je frontend.md/specifikacija.md §4.7 spominju — pratili smo dizajn kao izvor istine;
      "Najbliže tebi" ostaje TODO, dizajn za nju treba ili izvesti iz postojećeg SalonCard-a ili dograditi
- [x] Frontend: Home page — hero (grad select + usluga/salon search + kategorija chips), "Popularno u
      Sarajevu" salon grid (`SalonCard`), "Kako radi" 3-koraka sekcija, navbar/footer chrome. Vizuelno
      provjereno u browseru (screenshot), tačno prati `Home page.dc.html` iz dizajna. Cijene formatirane
      bez ".00" (`lib/format.ts`).
- [x] Frontend: "Pretraga salona" ekran (vidi red iznad za detalje)

## 10. Recenzije — `docs/specifikacija.md` §4.9

- [ ] Review kreiranje (samo za `completed` booking, unique po bookingu)
- [x] Prikaz na profilu salona — rating summary (prosjek, zvijezde, 1–5 distribucija), sort
      (Najnovije/Najviša ocjena), "Prikaži još recenzija" (3 po stranici), empty state za salone bez
      recenzija (kod je spreman, ali svih 8 mock salona trenutno IMA recenzije — vidi §12 napomenu).
      `Review.serviceName`/`workerName` su denormalizovani display-only stringovi u fixture-u (real API bi
      ih join-ovao preko `booking_id`), `Salon.ratingBreakdown` je odvojen aggregate niz (nije izveden iz
      `lib/mock-data/reviews.json` reda po red — namjerno, isti obrazac kao originalni dizajn demo)
- [x] Frontend: "Recenzija" ekran (vidi §12 za puni detalj — forma za ostavljanje/izmjenu recenzije,
      zvjezdice + komentar, blokirano za termine koji nisu `completed`)

## 11. Statistike i izvještaji (vlasnik) — `docs/specifikacija.md` §4.12

- [x] Prihod po danu/sedmici/mjesecu — mock verzija (vidi §12), stvarna agregacija iz `bookings.json`
- [x] Najpopularnije usluge i radnici — mock verzija (vidi §12)
- [x] Stopa otkazivanja i no-showova — mock verzija (vidi §12)
- [x] Izvještaji po radniku — mock verzija (vidi §12)
- [x] Frontend: "Statistika" ekran (vidi §12 za puni detalj)
- [ ] V3: Novi vs. povratni klijenti. V4: Export PDF/Excel — van V1 obima, vidi `docs/specifikacija.md` §4.12

## 12. Ostali ekrani iz dizajna (svih 15 `.dc.html`)

- [x] Home page (vidi §9 gore za detalje)
- [x] Pretraga salona (vidi §9 gore za detalje)
- [x] Salon profil — ruta `/saloni/[slug]` (`app/[locale]/(public)/saloni/[slug]/page.tsx` +
      `components/salon/salon-profile-content.tsx` + `service-row.tsx`/`staff-card.tsx`/`review-card.tsx`/
      `rating-summary.tsx`), tačno prati `Salon profil.dc.html`. Vizuelno provjereno (desktop sidebar +
      mobile sticky CTA bar + sve 3 tabove) za više salona, uklj. 404 za nepostojeći slug. Dizajnov
      "Širina"/"Stanje salona" toolbar i **"SEO/SSR" tab su namjerno preskočeni** — to je bio
      developer-facing demo tab (prikazuje sirov HTML/JSON-LD korisniku, što nema smisla u produkciji);
      umjesto toga stvarni `generateMetadata()` (naslov/opis po salonu) + JSON-LD `<script>` su implementirani
      u `page.tsx` (server component, zadovoljava `docs/frontend.md` SEO/SSR zahtjev za realno, ne demo-om)
    - Mock podaci prošireni za ovaj ekran: `lib/mock-data/{workers,services,reviews}.json` (17 radnika,
      27 usluga, 17 recenzija — pokrivaju svih 8 salona) + `lib/api/{workers,services,reviews}.ts`.
      `types/entities.ts`: `Worker.nextSlotLabel`, `Service.groupLabel` (**NAPOMENA: `groupLabel` NIJE
      kolona u `docs/database.md`** — display-only grupisanje usluga, treba product/schema odluku prije
      pravog backend rada), `Review.serviceName`/`workerName` (denormalizovano), `Salon.openingHours`
      (nema svoju tabelu u `docs/database.md` još — vjerovatno treba `salon_hours` ili slično kad se
      backend nastavi) i `Salon.ratingBreakdown` (aggregate, computed)
    - Bug otkriven i popravljen ovu sesiju: `formatPrice()` u `lib/format.ts` je koristio
      `toLocaleString("bs-BA", ...)` za decimalni zarez — Node (server) i browser (klijent) mogu imati
      različite ICU podatke za "bs-BA" pa su SSR/CSR string izlazi bili različiti ("87.50" vs "87,50"),
      što je izazvalo hydration mismatch čim se prva necjelobrojna cijena pojavila (popust na uslugu).
      Popravljeno ručnim formatiranjem stringa (bez `Intl`/`toLocaleString`) — deterministično na
      serveru i klijentu
- [x] 3-Click Booking (vidi §5 gore za puni detalj — namjerne razlike od dizajna, mock dostupnost, guest
      forma umjesto auth-a)
- [x] Moji termini — ruta `/moji-termini` (`app/[locale]/(client)/moji-termini/page.tsx` +
      `components/client/my-bookings-content.tsx`, novi `(client)` route grupa po `docs/frontend.md`),
      tačno prati `Moji termini.dc.html`. Vizuelno provjereno desktop+mobile: Nadolazeći tab (date-box
      kartice, otkazivanje s modalom i toast potvrdom), Historija tab (Salon/Status filteri, "Ostavi
      recenziju"/"Ponovi" akcije). Novo: `lib/mock-data/bookings.json` + `lib/api/bookings.ts`
      (`getUpcomingBookings`/`getBookingHistory`, join-uje Salon/Service/Worker po id-u — dodani
      `getSalonById`/`getWorkerById`/`getServiceById` u postojeće `lib/api/` module).
      **Namjerna pojednostavljenja/napomene:**
        - Fiksni mock "trenutni klijent" (`CURRENT_CLIENT_ID = 1` u `page.tsx`) jer auth ne postoji — vidi
          napomenu na vrhu fajla
        - Navbar NE prikazuje "ulogovan" stanje (dizajn ima "AH Amina" chip umjesto Prijavi/Registruj se) —
          `components/chrome/navbar.tsx` je ostavljen neizmijenjen radi konzistentnosti dok stvaran auth ne
          postoji; revidirati kad se radi Prijava/Registracija
        - Otkazivanje je session-only (React state, ne perzistuje — refresh vraća termin, vidi §7)
        - Bug otkriven i popravljen ovu sesiju: `scheduledAt` u fixture-u imao "Z" (UTC) sufiks, pregledač
          ga je tumačio kroz lokalnu vremensku zonu i prikazivao pomjerena vremena (14:30 → 16:30 na ovoj
          mašini). Popravljeno uklanjanjem "Z" — vidi komentar u `lib/api/bookings.ts`. Isti komentar:
          `lib/format.ts` je imao grešku "august" umjesto ispravnog bosanskog "avgust" — popravljeno,
          dodan i `formatMonthShort()` export
        - `?tab=recenzije` search-param dodan na Salon profil (`salon-profile-content.tsx` prima
          `initialTab` prop) — **NAPOMENA:** "Ostavi/Izmijeni recenziju" linkovi na "Moji termini" su OD
          SESIJE Recenzija ekrana promijenjeni da idu na `/moji-termini/{id}/recenzija` umjesto ovoga;
          `?tab=recenzije` search-param na Salon profilu ostaje koristan za direktan link na taj tab
          (npr. iz vana), samo ga "Moji termini" akcije ne koriste više
- [x] Klijent profil — ruta `/profil` (`app/[locale]/(client)/profil/page.tsx` +
      `components/client/client-profile-content.tsx`), tačno prati `Klijent profil.dc.html`. Lični podaci
      (ime/email/mobitel, Sačuvaj/Odustani), promjena lozinke (3 password polja, validacija: sva 3
      popunjena, nova ≥8 znakova, nova===potvrda — dizajnov demo script NIJE provjeravao dužinu iako je
      obećava u kopiju, ovo je stvarna ispravka), Obavještenja (2 checkboxa). Vizuelno provjereno
      desktop 2-kolone + mobile 1-kolona layout, testirane sve interakcije (save/discard/password
      validacija). Sve session-only, vidi §7.
        - Novo: `types/entities.ts` dobio `User` interfejs (id/role/name/email/phone/emailVerifiedAt/
          createdAt — bez `password` polja, isto kao stvaran API Resource nikad ne vraća hash),
          `lib/mock-data/client.json` (jedini mock "trenutni klijent", `id:1` odgovara postojećem
          `CURRENT_CLIENT_ID` u `lib/api/bookings.ts`) + `lib/api/client.ts` (`getCurrentClient()`).
          Identitet: "Sanela Kovačević" — ISTA osoba već korištena kao mock klijent na "Moji termini"/
          booking wizard (dizajnov OWN demo koristi drugo ime "Amina Hodžić" za ovaj konkretan `.dc.html`
          fajl, ali dosljednost KROZ NAŠU aplikaciju je važnija od kopiranja dizajnovog per-fajl placeholder
          imena)
        - `lib/format.ts` dobio `formatMonthGenitive()` — "član od **maja** 2026", ne "**maj**" (nominativ
          pogrešan iza "od" u bosanskom; ista razlika kao "septembra" vs "septembar" itd. — zaseban niz od
          `formatMonthShort`/`formatDayLabel`-ovog nominativa)
- [x] Klijent historija — ruta `/dashboard/klijenti/[ime]`
      (`app/[locale]/(owner)/dashboard/klijenti/[ime]/page.tsx` +
      `components/owner/client-history-content.tsx`), tačno prati `Klijent historija.dc.html`. `[ime]` je
      URL-encoded `clientName` (isti identitet kao `Booking.clientName`/`SalonClientSummary.name` — nema
      per-klijent numerički ID za guest bookinge, vidi napomenu u `types/entities.ts`). 404 ako klijent
      nema nijedan booking kod ovog salona. Isti sidebar/nav stil kao "Salon dashboard", ali nav stavke su
      sad pravi `Link`-ovi na `/dashboard?tab=X` (ne interni `setPage`) — "Kalendar"/"Klijent historija" su
      odvojene rute pa nema zajedničkog React state-a za tab; `DashboardPage`/`DashboardContent` prošireni
      da čitaju `?tab=` search param i inicijalizuju odgovarajući tab (`initialPage` prop), radi ispravnog
      "nazad" navigiranja. "Klijenti" tab u dashboardu dobio "Historija" dugme po redu klijenta
      (`components/owner/dashboard-content.tsx`).
        - Header kartica: inicijali, ime, status bedž (Aktivan/Prag nedolazaka dostignut/Blokiran u ovom
          salonu), telefon, "Prvi termin {datum}" (najraniji booking ovog klijenta kod ovog salona — NE
          "Klijent od..." kao u dizajnu, jer guest klijenti (`clientId: null`) nemaju nalog/registraciju da
          bi "član od" imalo smisla; ista nijansa kao `Booking.clientId` napomena)
        - 4 KPI kartice (ukupno termina, obavljeno + zadnji datum, nedolasci 90 dana / prag, prihod) +
          uslovni "prag nedolazaka" banner (Zanemari / Blokiraj-Predloži, session-only dismiss)
        - Historija termina: lista FILTRIRANA na ovaj salon, Select filter (Svi/Obavljeno/Otkazano/Nije se
          pojavio — "Otkazano" spaja `cancelled_by_client`+`cancelled_by_salon` u jedan filter, isto grupisanje
          kao dizajn), footer sa "{n} od {N} termina" + sumom cijena filtriranog prikaza
        - Interni komentar: `ClientNote` CRUD, novi mock `lib/mock-data/client-notes.json` +
          `lib/api/client-notes.ts` (`getClientNotes`). Dodavanje/brisanje je session-only (React state),
          ne perzistuje — isti obrazac kao svuda u frontend-first fazi. Autor bilješke = "Selma Hodžić"
          (vlasnik) / "Lejla Hadžić" (radnik), ISTI identiteti kao "Salon dashboard" viewer chip
          (`dashboard-content.tsx`), ne dizajnovi placeholder-i ("Amina Hodžić"/"Ena Šarić")
        - Blokiraj/Predloži blokadu: isti owner/worker razlika kao "Salon dashboard" Klijenti tab
          (vlasnik blokira direktno, radnik samo predlaže — nema per-radnik `canBlockClients` provjeru jer
          nema "trenutni radnik" identitet, ista pojednostavljenost kao dashboard), modal s opcionim
          "Razlog (interno)" poljem, session-only state (blocked/proposed/dismissed)
        - "Novi termin" otvara `NewAppointmentModal` (isti komponent kao "Salon dashboard") sa `clients`
          prop suženim na SAMO ovog klijenta (pre-popunjeno, bez biranja) i `existingBookings` = SVI
          salon bookings (ne samo ovog klijenta) da provjera dostupnosti termina bude tačna
        - Mock podaci: `lib/mock-data/bookings.json` dobio 2 dodatna `no_show` reda za "Emina Pašić" u
          Studio Lux (id 17, 18) da ukupno dostigne prag od 3 nedolaska u 90 dana i demonstrira alert
          banner (datumi namjerno IZVAN 30-dana prozora korištenog za "Salon dashboard" Kalendar-tab KPI,
          da ga ne mijenjaju — samo unutar 90-dana prozora ovog ekrana)
        - Vizuelno provjereno desktop (1280px, sidebar) + mobile (375px, horizontal tab bar) za oba
          klijenta (Sanela Kovačević — obična historija + postojeće bilješke; Emina Pašić — prag
          nedolazaka banner + prazno stanje bilješki), testirano: filter select, dodaj/obriši bilješku,
          blokiraj/ukloni blokadu (owner) i predloži blokadu (worker role toggle), novi termin kroz modal,
          404 za nepostojećeg klijenta
- [x] Recenzija — ruta `/moji-termini/[bookingId]/recenzija` (`app/[locale]/(client)/moji-termini/[bookingId]/recenzija/page.tsx`
      + `components/client/review-form.tsx`), tačno prati `Recenzija.dc.html` — ali kao PRAVA stranica
      (Navbar/Footer, centrirana kartica), ne kao modal-preko-blurane-pozadine iz dizajna, jer je "close"
      akcija u dizajnu zapravo navigacija-nazad (nema smisla graditi lažni modal za rutu čija je namjena da
      se napusti nazad na "Moji termini"). Tri stanja: forma (nova recenzija ILI izmjena postojeće —
      pre-popunjena ocjena/komentar ako `getReviewByBookingId()` nađe postojeći zapis), "Hvala" potvrda,
      i "blokirano" (booking.status !== "completed", provjereno stvarno kroz `getBookingById()`, ne
      dizajn-alatni toggle). Vizuelno provjereno desktop+mobile za sva 3 stanja + 404 za booking koji ne
      postoji/nije ovog klijenta.
        - Otkriven i popravljen bug: appt summary kartica je uvijek pisala "· obavljeno" (kopirano iz
          dizajn demo-a) bez obzira na stvaran status — sad koristi `bookingStatus` prijevod za pravi
          status (npr. "· salon otkazao" za CANCELLED_BY_SALON)
        - Kao i booking wizard/otkazivanje: "Pošalji recenziju" NE PERZISTUJE (nema write u
          `lib/mock-data/reviews.json` — lokalni state samo prelazi na "done" prikaz). Submit-ovana
          recenzija se NEĆE pojaviti na Salon profil "Recenzije" tabu ni promijeniti "Izmijeni/Ostavi"
          dugme na "Moji termini" nakon refresh-a
- [x] Prijava (vidi §12 ispod, na samom dnu liste — nakon "Registracija" — za puni detalj)
- [x] Registracija (vidi §12 ispod, na dnu liste — nakon "Pozivnica radniku" — za puni detalj)
- [x] Pozivnica radniku (vidi §12 ispod, na dnu liste — nakon "Za salone" — za puni detalj)
- [x] Salon setup — ruta `/postavljanje-salona` (`app/[locale]/(owner)/postavljanje-salona/page.tsx` +
      `components/owner/salon-setup-content.tsx`), tačno prati `Salon setup.dc.html`. Namjerno BEZ
      sidebar-a (drugačiji layout od "Salon dashboard"/"Klijent historija") — sticky top bar (logo,
      "Postavljanje salona" bedž, "Nastavi kasnije") + centrirani sadržaj, max-width 1000px. 5 koraka
      (Slike/Usluge/Radnici/Radno vrijeme/Provjera) + "poslano na verifikaciju" završno stanje, korak-
      indikator s kružićima/kvačicama/linijama, klik na bilo koji korak slobodno skače (nema validacije
      koja blokira napredak — isto kao dizajn demo). Sve session-only (React state), NE piše u
      `lib/mock-data/` jer nema pravog salona za koji bi ovo bilo trajno stanje — "Registracija vlasnika"
      (§3, ne postoji još) bi trebala kreirati stvarni `Salon` red prije nego ovaj wizard ima smisla
      protiv pravog backend-a. Eyebrow "Novi salon · Sarajevo" je placeholder konstanta u komponenti, ne
      vezana ni za jedan postojeći fixture salon (namjerno različito od "Studio Lux" da se ne implicira
      da se pravi salon uređuje).
        - Korak 1 (Slike): brojač fotografija (bez pravog file upload-a — R2 storage nije povezan, vidi
          §1/§4), placeholder gradient pločice s natpisom, "Naslovna" bedž na prvoj, ukloni/dodaj
          dugmad mijenjaju samo `photoCount` state
        - Korak 2 (Usluge): CRUD lista (naziv/cijena/trajanje), forma za dodavanje; "Uredi" dugme po
          usluzi je namjerno no-op s toast objašnjenjem (pojedinačno uređivanje nije izgrađeno, ukloni pa
          dodaj ponovo za sad)
        - Korak 3 (Radnici): CRUD lista sa status bedžom (Vlasnik/Pozivnica poslana/Bez pozivnice),
          "Pošalji pozivnicu" mijenja draft→invited + toast, forma za dodavanje s "Pošalji pozivnicu
          odmah" checkbox-om (novi `Checkbox` UI komponent, vidi ispod)
        - Korak 4 (Radno vrijeme): 7 dana (pun bosanski naziv dana, lokalna konstanta u komponenti — ne
          postoji još zajednička "puna imena dana" lista u `lib/format.ts`, samo skraćena
          `WEEKDAYS_BS`), checkbox otvoreno/zatvoreno + od/do Select kad otvoreno, "Primijeni na sve dane"
          kopira ponedjeljak
        - Korak 5 (Provjera): žuti upozorenje-banner o ručnoj verifikaciji, summary kartice (broj
          slika/usluga/radnika/radnih dana) sa "Uredi" linkom nazad na taj korak, "šta slijedi" lista.
          "Pošalji na verifikaciju" prelazi na završno stanje (`sent`), koje ima svoj "Otvori dashboard"
          link (pravi `next-intl` `Link` na `/dashboard`, ne dizajnov statični `.dc.html` link)
        - Novo: `components/ui/checkbox.tsx` — nativni `<input type="checkbox">` ručno stiliziran (isti
          obrazac kao `Button`/`Input`/`Select`/`Badge` — shadcn-ov generisani Checkbox NIJE korišten,
          nema ni `@radix-ui/react-checkbox` zavisnost). Novo: `lib/format.ts` dobio `pluralBs(count, one,
          few, many)` helper (bosanska 3-way pluralizacija: 1/2-4/0+5), korišten ovdje 3x (usluge/radnici/
          radni dani) — postojeća inline ternary logika u `dashboard-content.tsx` ("Klijenti" tab
          posjete) refaktorisana da koristi isti helper radi konzistentnosti
        - **Bug otkriven i popravljen ovu sesiju (utiče na više ekrana, ne samo ovaj):** `text-brand-on`/
          `bg-brand-on` klase su korištene u `dashboard-content.tsx` i `client-history-content.tsx`
          (sidebar tekst, viewer chip) pod pretpostavkom da su validne Tailwind utility klase, ali
          `--brand-on` je postojao samo kao sirova CSS varijabla u `:root` (design tokens), NIKAD
          mapirana u `@theme inline` blok u `app/globals.css` — Tailwind v4 generiše `text-*`/`bg-*`
          klase SAMO iz `@theme` varijabli, pa je `text-brand-on` tiho padao na neki drugi tamni default
          (~`slate-900`) umjesto bijele, dajući nizak kontrast tekst na tamnoj indigo pozadini (jedva
          primjetno u ranijim screenshot-ovima, ali "Otvori dashboard" dugme na OVOM ekranu je imalo
          IDENTIČNU boju teksta i pozadine — potpuno nevidljiv tekst, otkriveno vizuelnom provjerom).
          Popravljeno dodavanjem `--color-brand-on: var(--brand-on);` u `@theme inline` (`app/globals.css`)
          — jedna linija, retroaktivno popravlja kontrast na sva tri ekrana koja koriste `text-brand-on`.
          Vizuelno potvrđeno (computed color prije/poslije) na sva tri mjesta.
        - Vizuelno provjereno desktop (1280px) + mobile (375px) kroz sva 4 koraka + review + sent stanje;
          testirano: dodaj/ukloni sliku, dodaj/ukloni/uredi(toast) uslugu, dodaj radnika + pošalji
          pozivnicu, toggle radnog dana + "Primijeni na sve dane", "Uredi" linkovi iz Provjera nazad na
          korake, cijeli submit→sent→"Otvori dashboard" put
- [x] Salon dashboard — ruta `/dashboard` (`app/[locale]/(owner)/dashboard/page.tsx` +
      `components/owner/dashboard-content.tsx` + `new-appointment-modal.tsx`), tačno prati
      `Salon dashboard.dc.html`. "Trenutni salon" fiksiran na Studio Lux (`CURRENT_SALON_ID=1` u
      `lib/api/bookings.ts`, isti obrazac kao `CURRENT_CLIENT_ID`). 7 tabova, svi na stvarnim podacima
      (workers.json/services.json/bookings.json), sve akcije stvarno rade (Potvrdi/Pomjeri/Otkaži/
      Obavljeno/Nije se pojavio, Novi termin, radnik can_block_clients toggle, radno vrijeme otvoreno/
      zatvoreno toggle) — session-only, ne perzistuje (isti pattern kao svuda ovu sesiju). Vizuelno
      provjereno desktop (sidebar) + mobile (horizontal tab bar) + owner/worker role toggle (sakriva
      Usluge/Radnici/Statistika za radnika, mijenja "Blokiraj"→"Predloži blokadu"). Svi KPI/statistika
      brojevi ručno provjereni protiv fixture podataka — tačni.
        - Mock podaci prošireni: `Booking.clientId` je sad `number | null` (guest booking bez naloga —
          `docs/database.md` NEMA ovo u šemi, isti tip napomene kao `Service.groupLabel` ranije),
          `Booking.clientName`/`clientPhone` denormalizovani (kao `Review.clientName`). 8 novih
          bookings.json redova za Studio Lux "danas" (gosti, ne Sanela) + jedan dodatni no_show red za
          testiranje "Rizik nedolaska" prikaza. `lib/api/bookings.ts` dobio `getSalonBookings` +
          sinhrone `pickBookingsForDate`/`pickPendingBookings`/`summarizeClients` (isti obrazac kao
          `filterSalons` — server fetch-uje JEDNOM, klijent filtrira interaktivno)
        - Namjerna skraćenja od dizajna: BEZ grid/calendar-kolona prikaza (samo lista), BEZ sedmičnog
          prihod-grafa (nema dovoljno realnih historijskih podataka da se ne izmišlja), "Klijenti" tab
          nema per-klijent internu bilješku (to je "Klijent historija", odvojen ekran, vidi §7/§8)
        - Bug otkriven i popravljen ovu sesiju: "Pomjeri" modal je koristio `date.toISOString()` za novo
          vrijeme termina — isti UTC-shift bug kao ranije u `bookings.json` (14:30 pretvoreno u pogrešan
          sat). Popravljeno ručnom konstrukcijom lokalnog ISO-stringa (isti fix pattern, vidi komentar u
          `dashboard-content.tsx`)
- [x] Statistika — ruta `/statistika` (`app/[locale]/(owner)/statistika/page.tsx` +
      `components/owner/statistics-content.tsx`), tačno prati `Statistika.dc.html` layout/sidebar-om
      (isti sidebar kao "Salon dashboard"/"Klijent historija", "Statistika" nav stavka aktivna). Za
      razliku od dizajn demo-a (koji ima 4 potpuno HARDKODIRANA fiksna dataset-a, jedan po periodu),
      ovaj ekran računa SVE iz stvarnih `bookings.json` podataka preko nove `lib/api/statistics.ts`:
        - `getStatsRange`/`getPreviousRange` — Danas/Sedmica/Mjesec su fiksni prozori od "sad"; "Raspon"
          parsira dva "dd.mm.gggg" text inputa (`parseBsDate`), prikazuje prijateljsku grešku
          (`ts("invalidRange")`) umjesto pada ako je raspon nevažeći ili obrnut
        - `buildRevenueBars` sam bira granulaciju bucket-a po dužini raspona: satno (≤1 dan), dnevno
          (≤14 dana), sedmično (>14 dana) — isti generic helper pokriva sva 4 perioda, ne postoji
          posebna grana koda po periodu
        - KPI delte (trend strelice) su STVARNO izračunate poređenjem s prethodnim periodom iste dužine
          (`getPreviousRange` + isti agregatori), ne izmišljene kao u dizajnu — "Popunjenost" računa
          stvarni kapacitet (`capacityMinutes`: zbir otvorenih sati salona × broj radnika kroz raspon,
          ista pojednostavljenost kao dashboard-ov fullnessPct — ne poštuje worker_time_off) naspram
          zauzetih minuta (`busyMinutes`, svi statusi osim otkazanih)
        - Filter po radniku (Select) primjenjuje se na SVE — KPI, graf, top usluge, stope, i samu tabelu
          radnika (tabela se svede na jedan red kad je filter aktivan, namjerno, radi dosljednosti)
        - "Izvještaj po radniku" tabela sortirana po prihodu opadajuće (dizajn ima fiksni redoslijed iz
          hardkodiranog niza; ovdje nema takvog niza pa je sortiranje po prihodu smisleniji default),
          bedž "Najviše prihoda" na prvom redu, "Visoka popunjenost"/"Ima prostora" inače (ista pravila
          kao dizajn)
        - Nema role toggle-a (owner/worker) kao "Salon dashboard"/"Klijent historija" — Statistika je
          `ownerOnly` u navigaciji svugdje (radnik ne vidi link), pa je vlasnik-only kontekst pretpostavljen
          direktno umjesto dupliciranja toggle logike koja bi ionako uvijek skrivala ovaj ekran za radnika
        - Mock podaci prošireni: `lib/mock-data/bookings.json` dobio 18 novih redova (id 19–36) za
          Studio Lux, raspoređenih kroz zadnjih ~30 dana (19.8–16.9), uglavnom `completed` + par
          `cancelled_by_client`/`cancelled_by_salon`, da "Sedmica"/"Mjesec" izvještaji imaju stvarnu
          raspodjelu umjesto skoro praznih grafova (prije ove sesije je salon1 imao samo 4 historijska
          termina van "danas" klastera — nedovoljno za smislen graf). Ovo je isti obrazac kao ranije
          dodavanje no-show redova za "Klijent historija" — real podaci, ne fabrikovani agregati.
        - **Bug otkriven i popravljen ovu sesiju:** dashboard-ov sidebar "Statistika" nav ikona je bila
          `Users` (generic, kopirano-zalijepljeno) umjesto prave chart ikone — popravljeno na `BarChart3`
          u sva tri ekrana (`dashboard-content.tsx`, `client-history-content.tsx`, novi
          `statistics-content.tsx`) radi konzistentnosti
        - Dashboard-ova mini "Statistika" TAB (§8/§11, "Statistika (ne)potvrđenih termina od radnika" iz
          specifikacije §4.6) NIJE uklonjena — različita svrha od punog izvještaja (brz pregled unutar
          dashboard-a naspram dubinske analitike), obje površine namjerno koegzistiraju. Mini tab je
          dobio "Puni izvještaj →" link ka `/statistika` (`components/owner/dashboard-content.tsx`),
          zamijenivši stari "statsHint" tekst koji je samo obećavao da "puni izvještaji dolaze kasnije"
        - Vizuelno provjereno desktop (1280px) + mobile (375px): sva 4 perioda (Danas/Sedmica/Mjesec/
          Raspon), filter po radniku (tabela/KPI/graf se ispravno sužavaju na jednog radnika), nevažeći
          custom raspon (prijateljska poruka), i link iz dashboard mini-taba
- [x] Za salone — ruta `/za-salone` (`app/[locale]/(public)/za-salone/page.tsx` +
      `components/marketing/for-salons-content.tsx`), tačno prati `Za salone.dc.html`. Javna marketing
      stranica za vlasnike (bez auth-a), koristi zajednički `Navbar` (link "Za salone" i `nav.forSalons`
      ključ već postojali u `messages/bs.json`/`navbar.tsx` iz ranije sesije, samo je stranica na koju
      pokazuju sad postavljena). Sekcije: hero (badge/naslov/lead/2 CTA dugmeta koja skroluju na
      `#prijava`/`#dashboard`, 3 checklist stavke) + 3 "problem" kartice desno, "Šta dobijaš" (4 benefit
      kartice), "Dashboard" (tekst + 4 poente + statični mockup kalendara s indigo sidebar-om — čisto
      dekorativna ilustracija, imena radnika/usluga u mockup-u su lokalne konstante kao u dizajnu, ne
      prava mock-data), "Kako počinje" (4 numerisana koraka), i tamna `#prijava` CTA/footer sekcija
      (naslov + 2 dugmeta na `/registracija`, footer kolone "Za salone"/"Za klijente"/"Kontakt",
      copyright). Namjerno NE koristi zajednički `components/chrome/footer.tsx` na kraju — dizajnov
      `#prijava` blok VEĆ jeste ova stranicina footer (druge kolone/linkovi nego generic Footer, koji bi
      inače duplirao "Imaš salon?" CTA na stranici koja je već ta CTA meta) — reuse-uje `Logo`/`Navbar`/
      `Button`/`Badge`/`Card`/`Icon` iz `components/ui|chrome/`.
        - Nove `messages/bs.json` `forSalons.*` ključi (sav tekst preveden, ništa hardkodirano u komponenti
          osim mockup-a — vidi napomenu iznad)
        - Vizuelno provjereno desktop (1024px) + mobile (375px): hero, problem kartice, benefit grid,
          dashboard mockup (sidebar se na <400px sužava na samo ikone, isti breakpoint pattern kao dizajn),
          koraci, tamna CTA/footer sekcija — sve renderuje ispravno, svi linkovi (nav, hash-anchor, footer)
          pokazuju na očekivane rute
- [x] Pozivnica radniku — dizajn (`Pozivnica radniku.dc.html`) ima DVIJE potpuno odvojene polovine
      (`isOwner`/`isWorker` toggle u demo toolbaru), implementirane kao dva zasebna ekrana:
        - **Vlasnička strana** — UNUTAR postojećeg "Radnici" taba na `/dashboard` (isti sidebar/nav kao
          "Salon dashboard"), NIJE nova ruta. Zamijenio stari placeholder (worker-card grid sa
          samo canBlockClients toggle-om i "Pozovi radnika" dugmetom koje je flash-ovalo "dolazi
          kasnije" poruku — vidi git historiju `components/owner/dashboard-content.tsx`). Novi prikaz:
          info banner ("Radnik se ne može registrovati sam..."), "Tim salona" lista (vlasnik + svi
          `workers` te salona + session-only dodani pozvani radnici), svaki red ima avatar-inicijale,
          ime, poziciju · kontakt (fabriciran email `ime@salondomen.ba`, `workers.json` nema email
          polje), status bedž (Vlasnik/Aktivan nalog/Pozivnica poslana/Bez pozivnice — novi
          `TeamStatus`/`TeamMember` tipovi LOKALNI u `dashboard-content.tsx`, NISU dodani u
          `types/entities.ts`/`Worker` jer bi to zahtijevalo mijenjanje javnog salon-profila
          `staff-card.tsx` koji dijeli isti `workers.json`). Postojeći `canBlockClients` toggle
          ZADRŽAN za stvarne aktivne radnike (nije uklonjen pri redizajnu), samo premješten u red
          akcija pored badge-a. "Pozovi radnika"/"Pošalji ponovo"/"Pošalji pozivnicu" akcije otvaraju
          novi `components/owner/invite-worker-modal.tsx` (`InviteWorkerModal`, mode `"new"` ili
          `"resend"`) — forma (ime/kontakt/pozicija Select) → "poslano" stanje (link + kod generisani
          klijent-side `generateInviteCode()`, "Kopiraj" dugme s privremenim "Kopirano" stanjem,
          "Pozovi još jednog" vraća na formu). Sve session-only (React state u `DashboardContent`),
          ne perzistuje — isti obrazac kao svuda u frontend-first fazi. Vlasnik "Selma Hodžić" prikazan
          u listi kao poseban red s bedžom "Vlasnik" (dosljedno s postojećim viewer chip identitetom,
          NE dizajnov placeholder "Amina Hodžić").
        - **Radnička strana** — NOVA javna ruta `/pozivnica/[token]`
          (`app/[locale]/(public)/pozivnica/[token]/page.tsx` +
          `components/invite/worker-invite-content.tsx`), split-screen layout (tamni indigo aside s
          "Pozvana si u {salon}" + 3 poente lijevo na desktopu, forma desno; jednokolonski na mobile
          s logom na vrhu). Tri stanja vođena URL `token` parametrom: forma (zaključana Ime/Email polja
          — vlasnik ih je unio, lozinka + potvrda lozinka, avatar upload placeholder, bio textarea,
          terms checkbox, "Pridruži se salonu"), "gotovo" (nakon uspješne client-side validacije —
          dužina lozinke ≥8, poklapanje, terms checked — session-only React state prelazi u "Dobrodošla
          u {salon}" s "Otvori moj kalendar" linkom na `/dashboard`), "isteklo" (token === "isteklo",
          tajna/test putanja jer nema pravog token store-a — `/pozivnica/isteklo` — "Zatraži novu
          pozivnicu" dugme). Nema pravog `worker_invitations` backend-a (docs/PROGRESS.md §3) pa SVAKI
          token (osim "isteklo") razrješava na isti mock salon (`CURRENT_SALON_ID`/Studio Lux) — isti
          obrazac kao ostatak vlasnik/radnik ekrana. Pozvani identitet je fiksna nova osoba "Ajla
          Zukić" (namjerno NIJE postojeći `workers.json` radnik — pozivnica demonstrira NOVOG radnika,
          korištenje već-aktivnog radnika kao "novog" bi bilo kontradiktorno), vlasnica koja šalje
          pozivnicu je "Selma Hodžić" (dosljedno, ne dizajnov placeholder).
        - Novi `messages/bs.json` `workerInvite.*` namespace pokriva OBA ekrana (banner/bedževi/modal
          na vlasničkoj strani, aside/forma/stanja na radničkoj). Stari neiskorišteni
          `dashboard.inviteToast` ključ uklonjen (zamijenjen stvarnom funkcionalnošću).
        - Bug otkriven i popravljen ovu sesiju: `/pozivnica/[token]` je imao ugniježđen `<a>` unutar
          `<a>` (`<Link href="/"><Logo /></Link>` — `Logo` već sam renderuje svoj `Link`) na mobile-only
          logo prikazu, što je uzrokovalo React hydration error (nevidljivo na screenshotu, otkriveno
          kroz `read_console_messages`). Popravljeno pozivanjem `<Logo className="..." />` direktno bez
          omotača.
        - Vizuelno provjereno desktop + mobile za oba ekrana: vlasnička strana (owner + worker role
          toggle prikaz, slanje nove pozivnice, "Pošalji ponovo" na već pozvanom radniku, kopiranje
          linka), radnička strana (forma → gotovo tok s pravim submit-om, isteklo stanje, split-screen
          desktop layout s tamnim aside-om).
- [x] Registracija — ruta `/registracija` (`app/[locale]/(auth)/registracija/page.tsx` +
      `components/auth/registration-content.tsx`), tačno prati `Registracija.dc.html`. Novi `(auth)`
      route group (prvi put korišten — `docs/frontend.md` ga je od početka predviđao pored
      `(public)/(client)/(owner)`). Split-screen layout (tamni indigo aside desktop, top logo mobile),
      isti obrazac kao `/pozivnica/[token]`.
        - Rola tab (Klijent/Vlasnik salona) prebacuje CIJEL sadržaj — aside tekst/poente, naslov/podnaslov,
          čak i max-width kartice (440px klijent, 520px vlasnik, iz dizajna).
        - **Klijent**: jednostepena forma (Ime i prezime/Email ili mobitel/Lozinka), "ili" separator +
          Google/Apple social dugmad (kozmetička, samo flash toast — nema pravog OAuth-a), terms
          checkbox, "Napravi nalog". Uspješan submit: toast + redirect na `/pretraga` (~800ms), testirano
          end-to-end.
        - **Vlasnik**: 3-koračni wizard sa step indikatorom (kružići s kvačicom za završene korake,
          brojem za trenutni/buduće, spojna linija) — isti vizuelni obrazac kao "Salon setup", ali
          samostalna implementacija (drugačiji broj koraka/kontekst, nije dijeljena komponenta):
            1. Tvoj nalog — Ime i prezime/Email/Lozinka
            2. Podaci o salonu — Naziv salona/Adresa/Grad (Select, `lib/constants/categories.ts`
               `CITIES`)/Kategorija (Select, `CATEGORY_META` labele — ISTE konstante kao Pretraga salona,
               ne duplirane liste)/Telefon salona (s hint tekstom o privatnosti)
            3. Provjera — žuti upozorenje-banner ("Salon ide na provjeru prije objave"), pregled svih
               unesenih podataka (Vlasnik/Email/Salon/Adresa/Kategorija), "Šta slijedi" lista (3 stavke),
               terms checkbox, Nazad/"Pošalji na provjeru"
          Nakon slanja: "Hvala na prijavi" završno stanje (success ikona, sva 3 koraka prikazuju kvačicu),
          "Idi na dashboard" → toast + redirect na `/postavljanje-salona` (~800ms) — **testiran pun
          end-to-end put Registracija (vlasnik) → Salon setup wizard**, isto poravnanje identiteta kao
          svugdje (nema hardkodiranog "Studio Lux"/"Selma Hodžić" ovdje — ovo je NOVA registracija,
          podaci dolaze iz forme, ne iz postojećih fixtures).
        - Real validacija dodana na SVAKI korak (dizajnov demo script NIJE validirao ništa — isti obrazac
          popravke kao ranije u Klijent profil/Pozivnica radniku): obavezna polja prije "Nastavi"/submit,
          lozinka ≥8 znakova, terms checkbox mora biti čekiran prije slanja — sve s toast porukama
          (`missingFieldsToast`/`passwordTooShortToast`/`termsRequiredToast`).
        - Novi `messages/bs.json` `registration.*` namespace (sav tekst preveden). Footer mini-linkovi
          (Uslovi korištenja/Privatnost/Podrška) — isti obrazac kao `components/chrome/footer.tsx`
          (`/uslovi`, `/privatnost` rute još ne postoje, konzistentno s ostatkom aplikacije).
        - Bug otkriven i popravljen ovu sesiju: dizajn koristi ikonu `"chrome"` (Google social dugme) iz
          dizajn-sistemovog ikon seta, ali instalirana `lucide-react` verzija u ovom projektu NEMA `Chrome`
          named export (`Error: Export Chrome doesn't exist in target module`) — zamijenjeno sa `Globe`
          (generic, dostupna ikona). Napomena za buduće ekrane: provjeriti `node -e "require('lucide-react')"`
          prije korištenja manje uobičajenih lucide imena iz dizajn skripti.
        - Vizuelno i funkcionalno provjereno desktop + mobile: role tab switch (aside/step-indicator/
          card max-width se ispravno mijenjaju), klijent submit → redirect na Pretragu, vlasnik sva 3
          koraka + Nazad navigacija + Provjera pregled tačno odražava unesene podatke → Hvala na prijavi →
          redirect na Salon setup, wizard step labele se sakrivaju na mobile (samo trenutni korak vidljiv,
          isti breakpoint obrazac kao "Za salone"/"Salon setup").
- [x] Prijava — ruta `/prijava` (`app/[locale]/(auth)/prijava/page.tsx` +
      `components/auth/login-content.tsx`), tačno prati `Prijava.dc.html`. **POSLJEDNJI od 15 ekrana —
      cijela dizajn lista je sad gotova.** Isti split-screen aside+forma layout obrazac kao
      "Registracija"/"Pozivnica radniku" (tamni indigo aside desktop s 3 poente + footnote, top logo
      mobile), namjerno SVOJA nezavisna komponenta a ne dijeljeni layout — polja/sadržaj se dovoljno
      razlikuju po ekranu da bi apstrakcija bila preuranjena (isto opravdanje kao ranije za
      Registracija/Pozivnica radniku).
        - Forma: Email ili mobitel (ikona `User`), Lozinka s show/hide toggle-om (`Eye`/`EyeOff`,
          `type="password"` ↔ `"text"`), "Zaboravljena lozinka" link (samo flash toast — nema
          Reset lozinke ekrana, nije na listi od 15 i nema `docs/specifikacija.md` stavke za njega u V1
          frontend obimu), "Ostani prijavljen" checkbox, "ili" separator, Google/Apple social dugmad.
        - Real validacija dodana (dizajnov demo `login()` handler NIJE provjeravao ništa — isti obrazac
          popravke kao svugdje ovu sesiju/prošle sesije): oba polja moraju biti popunjena prije
          "Prijavi se", inače `missingFieldsToast`.
        - Redirect ponašanje PRATI DIZAJN tačno, uklj. njegovu vlastitu asimetriju: "Prijavi se" i OBA
          social dugmeta (Google/Apple) redirektuju na `/moji-termini` nakon toast-a (~800ms) — za
          razliku od Registracije gdje su social dugmad čisto kozmetička (samo flash, bez redirect-a).
          Nema pravog role-based routing-a (info banner obećava "kalendar ako vodiš salon, ili pretragu
          ako tražiš termin", ali mock nema stvaran nalog/sesiju da zna koju ulogu typed kredencijali
          predstavljaju) — ostaje TODO za pravi Sanctum auth (§3), frontend ovdje samo prati dizajnov
          literalni klik-handler (uvijek Moji termini), ne izmišlja heuristiku za nešto što treba pravi
          backend da riješi.
        - Icon-in-input layout (User/Eye ikone unutar polja) je ručno sastavljen (`relative`+`absolute`
          positioning na `Input` komponenti) jer `components/ui/input.tsx` nema built-in `icon` prop
          (dizajnov `Input` iz komponenta biblioteke ima, naš ne) — isti obrazac kao zaključana polja u
          "Pozivnica radniku" radničkoj strani, nije izdvojeno u dijeljenu komponentu (samo 2 mjesta u
          kodu koriste ovaj layout, ne opravdava apstrakciju još).
        - Novi `messages/bs.json` `login.*` namespace (sav tekst preveden).
        - Vizuelno i funkcionalno provjereno desktop (split-screen aside) + mobile (top logo, jednokolonski
          layout): prazna forma validacija, show/hide lozinka toggle, "Zaboravljena lozinka" toast,
          uspješna prijava → toast → redirect na `/moji-termini` (pravi e2e test), "Registruj se"/
          "Nemaš nalog?" link na `/registracija` i nazad (`/prijava` link na Registraciji), sve bez
          console grešaka.

## 13. Admin (funkcionalno, BEZ UI) — `docs/specifikacija.md` §4.13

- [ ] Salon status enum (`pending`/`active`/`suspended`) postoji i poštuje se u query-jima (salon
      nevidljiv klijentima dok nije `active`) — odobravanje se radi kroz Tinker/SQL, ne UI

## 14. Frontend polish/proširenja (dogovoreno 2026-09-17, čeka "kreni")

Sve niže je frontend-only rad (mock/session-only podaci, isti obrazac kao svugdje u frontend-first
fazi) — ne backend. Redoslijed: 14.1 → 14.2 → 14.3.

### 14.1 Popust na usluzi (vlasnik) — [x] GOTOVO

- [x] Novi `components/owner/edit-service-modal.tsx` — forma Naziv/Cijena/Trajanje/Buffer + toggle
      "Popust aktivan" → otkriva "Popust (%)" input, uživo prikaz precrtane stare cijene. Validacija:
      naziv obavezan, cijena mora biti > 0, popust (kad je uključen) 1–90%
- [x] **Bug otkriven i popravljen (korisnik uočio odmah nakon prve verzije):** `price` je POGREŠNO
      tretiran kao već-diskontovana/naplativa cijena (stara cijena se računala UNAZAD dijeljenjem —
      `price / (1 - popust/100)`), umjesto kao osnovna cijena od koje se popust ODUZIMA (`price * (1 -
      popust/100)`). Npr. cijena 35 KM + popust 20% treba dati 28 KM klijentu, ne obrnuto. Novi čist
      helper `getEffectivePrice(price, discountPercent)` u `lib/format.ts` (dokumentovan komentarom da
      je `Service.price` UVIJEK osnovna cijena, popust se oduzima od nje — nikad obrnuto). Popravljeno
      svugdje gdje se cijena usluge prikazuje ili sabira: `service-row.tsx` (Salon profil),
      `booking-wizard.tsx` (lista usluga, sidebar/mobile total), `edit-service-modal.tsx` (preview),
      `new-appointment-modal.tsx` (select usluge), `saloni/[slug]/page.tsx` (JSON-LD `Offer.price`).
      **Širi efekat otkriven pri popravci:** `BookingDetails.service` (u `lib/api/bookings.ts`) nije
      nosio `discountPercent` uopšte, pa su SVI prihod-računi (dashboard mini-statistika, Klijent
      historija, puna Statistika — `lib/api/statistics.ts`) sabirali sirovu `price` bez popusta,
      precjenjujući prihod za svaku uslugu s aktivnim popustom. Dodano `discountPercent` u
      `BookingDetails.service` tip + u `withDetails()` (i u sve ručne booking-snapshot objekte u
      `dashboard-content.tsx`/`client-history-content.tsx` handleNewBooking funkcijama), i svi
      prihod-računi (`dashboard-content.tsx`, `client-history-content.tsx`, `statistics-content.tsx`,
      `lib/api/statistics.ts` — 3 funkcije) i klijentski prikazi cijene (`my-bookings-content.tsx`,
      dashboard appointment card) sad koriste `getEffectivePrice()`. Provjereno uživo: Sanelin prihod u
      Klijent historiji ispravno pao sa 105 KM (70+35, pogrešno) na 91 KM (56+35, ispravno) za njena 2
      obavljena termina u Studio Lux-u
- [x] `components/owner/dashboard-content.tsx` "Usluge" tab — "Uredi" otvara modal umjesto
      `flash(t("editServiceToast"))` no-op-a; rezultat ide u novi `serviceOverrides` state
      (`Record<number, Partial<Service>>`, isti obrazac kao postojeći `overrides`/`canBlockOverrides`),
      merge-ovan u novi `displayedServices` memo koji se koristi svugdje gdje se ranije koristio
      sirov `services` prop (i "Usluge" lista i `NewAppointmentModal`/`handleNewBooking`, da izmjena
      cijene/trajanja odmah utiče i na "Novi termin" tok unutar iste sesije). Dugme "Uredi" sad i
      `isOwner`-gated (radnik ga ne vidi, isti obrazac kao "Pozovi radnika" u "Radnici" tabu)
- [x] Isti tab — dodat bedž popusta ("-20%", `Badge variant="warning"`) na red usluge u listi
- [x] Nove `messages/bs.json` `dashboard.*` stavke za formu (naziv/cijena/trajanje/buffer/popust
      labele, validacija, toast) — stari neiskorišteni `editServiceToast` uklonjen
- [x] Testirano desktop+mobile: prepunjena forma, live preview precrtane cijene, validacija (prazan
      naziv, cijena ≤0), uspješno čuvanje + toast + bedž se pojavljuje u listi. Potvrđeno da je
      session-only (Salon profil na drugoj stranici i dalje pokazuje originalne mock podatke nakon
      navigacije — isti obrazac kao svugdje, ne piše u `lib/mock-data/services.json`)

### 14.2 Favorite usluga+radnik + lokacijska pretraga — [x] GOTOVO

**Favorite (booking wizard korak 2), `docs/specifikacija.md` §4.3 / `docs/frontend.md`:**

- [x] `types/entities.ts` — novi `FavoriteServiceWorker` interfejs (id/clientId/salonId/serviceId/
      workerId/createdAt), tačno prema `docs/database.md`
- [x] `lib/mock-data/favorites.json` — seed: Sanela (client 1) favorite radnik Amina Selimović za
      "Bojenje cijele kose" (id 4) u Studio Lux-u — stvarno odražava njenu postojeću historiju (2
      termina, oba kod iste radnice), ne izmišljen podatak. "Žensko šišanje" (2 termina, različiti
      radnici, bez favorite reda) demonstrira stanje 2; sve ostale usluge (bez historije) stanje 1 —
      sva 3 stanja pokrivena iz POSTOJEĆIH `bookings.json` podataka, bez fabrikovanja
- [x] `lib/api/favorites.ts` — `getFavoritesForClientSalon()` (async) + čiste helper funkcije
      `pickFavoriteWorkerId(favorites, serviceId)` i `pickLastUsedWorkerId(bookings, serviceId)`
      (najnoviji booking po `scheduledAt` za tu uslugu, bilo kog statusa)
- [x] `lib/api/bookings.ts` — nova `getClientBookingsAtSalon(clientId, salonId)` (svi statusi/datumi,
      za "zadnje korišteni radnik" upit)
- [x] `app/[locale]/(public)/saloni/[slug]/zakazi/page.tsx` — fetch favorites + client bookings
      (`CURRENT_CLIENT_ID`), proslijeđeno `BookingWizard`-u
- [x] `components/booking/booking-wizard.tsx` korak "Radnik" — sva 3 stanja implementirana:
      favorite postoji → jedna kartica ("Omiljeni radnik" bedž + inicijali/ime/pozicija) + "Nastavi s
      {ime}"/"Promijeni radnika" (otkriva punu listu, fallback na stanje 1/2, `revealAllWorkers`
      state); nema favorite-a ali ima historije → puna lista + eyebrow-pill "Prijedlog na osnovu tvog
      zadnjeg termina: {ime}" + taj radnik već vizuelno označen (`workerChoice` pred-postavljen u
      `pickService()`, i dalje slobodno promjenjiv klikom na bilo kog drugog); nema historije → puna
      lista, ništa označeno (postojeće ponašanje nepromijenjeno). Radi i kroz deep-link
      (`?usluga=X`), ne samo klikom kroz korak 0 — favorite/zadnje-korišteno se računa reaktivno iz
      `serviceId` state-a, ne samo unutar `pickService()` handler-a. **Namjerna izmjena ponašanja:**
      stari auto-skip "ako je workerChoice već postavljen, preskoči korak 1 pri promjeni usluge" je
      uklonjen — korak 1 se sad UVIJEK prikazuje (osim kod solo-radnik salona) da bi klijent stvarno
      VIDIO predloženog/omiljenog radnika prije potvrde, umjesto da se tiho preskoči
- [x] Isti fajl, "Hvala" ekran (NE korak potvrde — spec eksplicitno kaže "nakon uspješne rezervacije")
      — kartica "Sačuvaj {usluga} kod {radnik} kao omiljeno" + dugme "Sačuvaj" (prikazano samo kad je
      biran konkretan radnik, ne "Bilo koji radnik", i kombinacija još nije favorite), klik →
      session-only `sessionFavorites` state (ne piše u `favorites.json`) + kartica se mijenja u
      potvrdu "{usluga} kod {radnik} je sad tvoja omiljena kombinacija." **Bug otkriven i popravljen
      ovu sesiju:** početna verzija je gate-ovala cijelu karticu s `!alreadyFavorite`, pa je kartica
      NESTAJALA umjesto da pokaže poruku potvrde čim bi se favorite sačuvao (jer `alreadyFavorite`
      postane `true` odmah nakon snimanja) — popravljeno na `favoriteSaved || !alreadyFavorite`.
      Testirano puno write→read u istoj sesiji: zakazan termin bez favorite-a → sačuvano na "Hvala"
      ekranu → "Zakaži još jedan termin" → ista usluga odmah pokazuje stanje 3 (komponenta ostaje
      mounted, ne remount/navigacija)

**Lokacijska pretraga "blizu mene", `docs/specifikacija.md` §4.7 / `docs/frontend.md`:**

- [x] `lib/geo.ts` (novo) — čista `haversineKm(lat1,lng1,lat2,lng2)` funkcija
- [x] `hooks/use-geolocation.ts` (novo — vidi napomenu ispod za lokaciju foldera) — wrapper oko
      `navigator.geolocation`, stanja idle/loading/granted/denied/unavailable, `request()`/`reset()`
- [x] `lib/api/salons.ts` — `SalonSort` dobio `"distance"`; nova `attachDistances(salons, coords)`
      helper (koristi `Salon.latitude`/`longitude`, već popunjeni u `salons.json` za svih 8 salona —
      "geocoding" korak već postojao na nivou mock podataka, samo se do sad nigdje nije koristio)
- [x] `lib/format.ts` — `formatDistance(km)` helper (isti obrazac kao `formatPrice`; "850 m" ispod
      1km, "1,2 km" iznad, zarez decimalni separator)
- [x] `components/discovery/salon-card.tsx` — prikaz udaljenosti (ikona `Navigation` + tekst, brand
      boja) kad `salon.distanceKm` postoji (polje postojalo u `types/entities.ts` od ranije, nikad
      popunjeno/prikazano do sad)
- [x] `components/discovery/search-content.tsx` — nov filter chip "Blizu mene" (ikona `LocateFixed`):
      prvi klik (kad geolokacija još nije `granted`) pokazuje inline banner s objašnjenjem PRIJE
      browser prompta + dugme "Dozvoli lokaciju"; uspjeh → `sort` se automatski postavlja na
      `"distance"` (nova "Najbliže" stavka i u Sort chip redu, klik na nju izvan aktivnog "blizu mene"
      stanja pokreće isti explain→request tok); odbijanje/nedostupno → banner se tiho sklanja, chip
      ostaje neaktivan, BEZ greške (frontend.md: "korisnik ne smije osjetiti da je nešto pošlo po
      zlu"). Postojeći `search.comingSoonNote` tekst ažuriran (ranije je obećavao da "blizu mene"
      dolazi u sljedećoj verziji — sad je uklonjeno, ostavljena samo napomena o mapi koja i dalje nije
      implementirana, V2 po specifikaciji)
- [x] Home page (`components/home/home-content.tsx` + `app/[locale]/(public)/page.tsx`) — nova
      "Najbliže tebi" sekcija, ista geolocation logika kao Pretraga (zaseban `useGeolocation()` poziv,
      neovisan state). Prijevodi `nearbyEyebrow`/`nearbyTitle`/`nearbyLocationPrompt` su POSTOJALI u
      `messages/bs.json` od ranije sesije, nikad iskorišteni — dodano još `nearbyAllow`/
      `nearbyLoading`/`nearbyEmpty`. CTA kartica ("Dozvoli lokaciju da vidiš najbliže salone" + dugme)
      prikazana dok god korisnik nije odbio/nedostupno; nakon dozvole zamjenjuje se gridom od 4
      najbliža salona (svi gradovi, ne samo Sarajevo — "blizu mene" ignoriše grad filter po dizajnu
      loga funkcije); odbijanje/nedostupno → CIJELA sekcija nestaje (ne prazno stanje), dizajn
      (`Home page.dc.html`) nema ovu sekciju uopšte pa je izgrađena iz postojećeg `SalonCard`-a kao
      što je ranija sesija predložila. **Napomena:** `HomeContent` je ovom izmjenom postao pravi
      `"use client"` komponent (ranije je radio kao ne-async Server Component koristeći next-intl-ov
      poseban RSC `useTranslations()` mehanizam) — nužno jer geolocation zahtijeva `useState`/
      `useEffect`; `cities`/`featured`/`allSalons` i dalje stižu kao server-fetched props, nema
      regresije u obrascu podataka
- [x] **Napomena o folder strukturi:** `docs/frontend.md` dokumentuje `hooks/` kao top-level folder
      (sibling od `lib/`), ne `lib/hooks/` kako je originalni plan u ovoj sekciji pisao — praćen
      dokumentovan obrazac, `use-geolocation.ts` je na `hooks/use-geolocation.ts`
- [x] Testirano funkcionalno (mock `navigator.geolocation` za deterministički granted/denied,
      pravi browser permission dialog nije dostupan u ovom test okruženju): Pretraga — "Blizu mene"
      chip → banner → dozvola (mock koordinate blizu Studio Lux-a) → svih 8 salona ispravno sortirano
      po udaljenosti (293m/481m/995m/1,7km/2,3km/3,2km/...) + "Najbliže" sort chip sinhronizovan;
      isključivanje chip-a vraća "Preporučeno" i uklanja bedževe; odbijanje → banner nestaje, chip
      ostaje neaktivan, bez greške. Home page — CTA → dozvola → 4 najbliža salona s ispravnim
      udaljenostima i formatiranjem; odbijanje → cijela sekcija nestaje. Provjereno i mobile layout
      (Pretraga chip red). `npx tsc --noEmit` čist (0 grešaka) nakon svih izmjena u ovoj stavci

### 14.3 Rola se ne prenosi između dashboard stranica — [x] GOTOVO

- [x] `app/[locale]/(owner)/dashboard/page.tsx` — čita `role` search param (`?role=owner|worker`),
      proslijeđuje kao `initialRole` prop (default `"owner"` za bilo koju drugu/nepostojeću vrijednost)
- [x] `components/owner/dashboard-content.tsx` — `Role`/`Page` tipovi sad `export`-ovani; prihvata
      `initialRole` prop umjesto uvijek `useState<Role>("owner")`; novi `selectRole(r)` helper
      (koristi `useRouter`/`usePathname` iz `@/i18n/navigation` + `useSearchParams` iz
      `next/navigation`) postavlja i lokalni state i URL (`router.replace`, `scroll:false`, čuva
      postojeći `?tab=` parametar); klik na Vlasnik/Radnik toggle sad zove `selectRole` umjesto
      `setRole`; "Historija" linkovi u "Klijenti" tabu nose trenutnu rolu
      (`/dashboard/klijenti/{ime}?role=${role}`)
- [x] `app/[locale]/(owner)/dashboard/klijenti/[ime]/page.tsx` — isto, čita `role` search param,
      proslijeđuje kao `initialRole`
- [x] `components/owner/client-history-content.tsx` — `Role` tip `export`-ovan; prihvata
      `initialRole`; isti `selectRole` obrazac; "Klijenti" back-link i svih 6 sidebar/mobile NAV
      linkova ka `/dashboard` (Kalendar/Zahtjevi/Klijenti/Usluge/Radnici/Radno vrijeme) sad nose
      `&role=${role}` — "Statistika" link namjerno izuzet (ta stranica nema koncept role-a)
- [x] Testirano desktop+mobile, pun krug: Vlasnik→Radnik toggle na `/dashboard` mijenja URL na
      `?role=worker`, "Historija" link nosi rolu, `/dashboard/klijenti/[ime]` učitan u Radnik pogledu
      (sidebar "Lejla Hadžić", "Predloži blokadu" umjesto "Blokiraj klijenta", ownerOnly nav stavke
      sakrivene) — nazad na Klijenti isto zadržava `role=worker`. Direktna navigacija na URL s
      `?role=worker` odmah učitava ispravan pogled (server-side inicijalizacija radi, ne samo
      client-side toggle). Bez console grešaka

## 15. Frontend polish/bugfix (dogovoreno 2026-09-18, čeka "kreni")

Nalazi iz ručnog QA prolaska kroz cijelu `sredime-frontend` aplikaciju (desktop + mobile 375px),
urađenog NAKON zadnjeg commit-a ("Add dev-only quick login, lock reviews after submit, fix dashboard
full-height layout"). Sve niže je frontend-only rad (isti obrazac kao §14) — ne backend. Redoslijed:
15.1 → 15.2 → 15.3.

### 15.1 Mobilni header nema navigaciju — [x] GOTOVO

- [x] Problem: na širinama ispod ~768px `components/chrome/navbar.tsx` potpuno izbaci linkove
      "Pretraga"/"Moji termini"/"Za salone"/"Registruj se" — ostaju samo logo i "Prijavi se", bez
      hamburger/meni zamjene. Potvrđeno na Home, Pretraga, Salon profil (sve javne stranice dijele isti
      Navbar). Rezultat: na mobilnom se do tih ruta ne može doći iz headera ni na jednoj unutrašnjoj
      stranici (jedini izlaz je footer na Home page-u).
- [x] Dodat mobile meni u `components/chrome/navbar.tsx`: `"use client"` + `useState` za otvoreno/
      zatvoreno stanje, hamburger dugme (`Button variant="ghost" size="icon" md:hidden`, `Menu`/`X`
      lucide ikona koja se mijenja s stanjem, `aria-expanded` + `aria-label` preko novih `nav.openMenu`/
      `nav.closeMenu` `messages/bs.json` ključeva). Otvoren meni je `absolute inset-x-0 top-full` panel
      unutar (sticky) header-a — ne treba eksplicitan `relative` jer `sticky` već uspostavlja containing
      block za `absolute` potomke. Panel sadrži identičnu listu linkova kao desktop `<nav>` (Pretraga/
      Moji termini/Za salone) + "Registruj se" (koje je na desktopu zaseban `Button`, ovdje spušten u
      listu jer je desktop dugme `hidden md:inline-flex`). Zatvaranje: `useEffect` na `usePathname()`
      (iz `@/i18n/navigation`) zatvara meni čim se ruta stvarno promijeni (klik na link, back/forward),
      bez potrebe za `onClick` handlerom na svakom pojedinačnom linku
- [x] Vizuelno i funkcionalno provjereno: mobile (375px) — meni se otvara (svi linkovi vidljivi, dugme
      postaje "Zatvori meni" s X ikonom), klik na "Pretraga" navigira NA `/pretraga` i meni se sam
      zatvori; desktop (1280px) — nepromijenjeno, puna `<nav>` traka + oba dugmeta vidljivi, hamburger
      dugme se ne renderuje. **Napomena:** Browser pane-ov "desktop" preset je ~735px širok — ISPOD
      `md` (768px) breakpoint-a, pa i dalje prikazuje mobile/hamburger prikaz; stvarna desktop provjera
      je urađena eksplicitnim 1280px viewport-om. Bez console grešaka. `npx tsc --noEmit` čist
      (0 grešaka) nakon izmjene.

### 15.2 Navbar ne prati "ulogovan" stanje nakon dev quick-login-a — [x] GOTOVO

- [x] Problem: nakon "Brza prijava (test)" na `/prijava` (Klijent/Radnik/Vlasnik dugmad, dodano zadnjim
      commit-om), stranice koje ISPRAVNO prikazuju ulogovanog korisnika (npr. "Moji termini", "Klijent
      profil" — vide `CURRENT_CLIENT_ID` podatke) i dalje imaju Navbar koji prikazuje "Prijavi se"
      umjesto npr. avatara/imena ili "Odjavi se". Auth-state u Navbar-u nije povezan sa ostatkom
      aplikacije.
- [x] Napomena: ranije dokumentovano (§3, §12 "Moji termini"/"Klijent profil" napomene) kao NAMJERNO
      odgođeno dok pravi Sanctum auth ne dođe — ali dev quick-login uveden zadnjim commit-om je već
      session-only mehanizam istog tipa kao ostala session-only stanja u frontend-first fazi (favorite,
      otkazivanje, itd.), pa je popravljeno na taj nivo (BEZ pravog auth-a), ne čekajući backend
- [x] Novi `lib/session.ts` — `StoredSession { role: "client"|"worker"|"owner"; name }` u
      `localStorage` (ključ `sredime.session`, ne React Context — Navbar nema zajednički layout, svaka
      `*-content.tsx` stranica ga sama montira, pa se svaki mount/route-change čita iznova, vidi §15.1
      `usePathname` efekat). `getStoredSession`/`setStoredSession`/`clearStoredSession` + `initialsFromName`
      helper (isti `bg-brand-subtle text-brand` avatar-krug stil kao postojeći `initials()` obrasci u
      `salon-setup-content.tsx`/`statistics-content.tsx`, ali dijeljen jer ga OVDJE koriste 2 fajla)
- [x] `components/chrome/navbar.tsx` — čita sesiju u istom `useEffect`/`usePathname` bloku koji već
      zatvara mobile meni (§15.1); kad sesija postoji prikazuje avatar-inicijale + ime (skriveno na
      najužim ekranima) + "Odjavi se" dugme umjesto Prijavi se/Registruj se dugmadi; mobile dropdown
      panel isto zamjenjuje "Registruj se" red sa "Odjavi se" akcijom kad je ulogovan
- [x] `components/auth/login-content.tsx` — `quickLogin(role)` sad zove `setStoredSession({role, name})`
      prije redirect-a za sva tri dugmeta (`SESSION_NAMES`: client="Sanela Kovačević" — isti identitet
      kao `CURRENT_CLIENT_ID`, worker="Lejla Hadžić"/owner="Selma Hodžić" — isti identitet kao dashboard
      viewer chip u `dashboard-content.tsx`, iako Navbar trenutno nema prikaz na `/dashboard` rutama pa
      worker/owner sesija samo sjedi spremna ako se ikad doda). Obični `handleLogin()` submit i OBA
      social dugmeta (Google/Apple, preko novog `handleSocialLogin()`) isto postavljaju client sesiju —
      dizajn nema stvaran role-izbor na generičkoj formi pa je "client" jedina smislena pretpostavka,
      konzistentno s postojećim "uvijek Moji termini" redirect ponašanjem
- [x] Odjava (logout) — `clearStoredSession()` + lokalni state reset, radi identično na desktop dugmetu
      i mobile dropdown redu
- [x] Nove `messages/bs.json` `nav.logout` ključ ("Odjavi se")
- [x] Vizuelno i funkcionalno provjereno desktop + mobile: Klijent quick-login → Navbar na "Moji
      termini" ODMAH pokazuje "SK Sanela" + Odjavi se (bez ijedne dodatne akcije), navigacija na
      "Klijent profil" (potpuno nova stranica/mount) zadržava sesiju (localStorage), odjava vraća
      Prijavi se/Registruj se na obje stranice; Vlasnik/Radnik quick-login i dalje ispravno redirektuju
      na `/dashboard?role=...` bez greške (Navbar se tamo ne renderuje, pa vizuelno ništa ne mijenjaju,
      samo je potvrđeno da `setStoredSession` poziv ne baca grešku). Mobile dropdown (375px): avatar
      chip vidljiv pored X ikone, "Odjavi se" red u panelu radi. Bez console grešaka. `npx tsc --noEmit`
      čist (0 grešaka).

### 15.3 Nedostaju specifični `<title>` na pojedinim rutama — [x] GOTOVO

- [x] Problem: `/pretraga` i `/za-salone` prikazivali su generički naslov taba ("SrediMe — sredi se
      bez poziva", isti kao Home page, iz root `app/[locale]/layout.tsx` `metadata` fallback-a) umjesto
      stranici-specifičnog naslova — oba `page.tsx` fajla nisu imala ni `export const metadata` ni
      `generateMetadata()`. Ostale rute (Salon profil preko `generateMetadata()`, i svih 9 ostalih
      statičnih ruta preko `export const metadata`) su VEĆ imale ispravan naslov
- [x] Dodano `export const metadata: Metadata = { title: "Pretraga salona | SrediMe" }` u
      `app/[locale]/(public)/pretraga/page.tsx` i `title: "Za salone | SrediMe"` u
      `app/[locale]/(public)/za-salone/page.tsx` — isti minimalni obrazac (samo `title`, bez
      `description`) kao svih 9 postojećih statičnih `export const metadata` primjera (Prijava/
      Registracija/Moji termini/Recenzija/Klijent profil/Salon dashboard/Postavljanje salona/
      Statistika/Pozivnica radniku); Salon profil je jedina ruta sa bogatijim `generateMetadata()`
      (naslov+opis) jer je JEDINA čiji sadržaj (i time SEO opis) zavisi od dinamičkog parametra (slug)
- [x] Provjereno kroz SVE `page.tsx` fajlove (`grep` za `generateMetadata|export const metadata`) —
      jedina preostala ruta bez ijednog je Home page (`app/[locale]/(public)/page.tsx`), što je
      NAMJERNO (koristi root layout fallback naslov "SrediMe — sredi se bez poziva", ne praznina)
- [x] Vizuelno i funkcionalno provjereno (`document.title` u browseru): `/bs/pretraga` →
      "Pretraga salona | SrediMe", `/bs/za-salone` → "Za salone | SrediMe", `/bs` i dalje pokazuje
      fallback naslov (nepromijenjeno). Bez console grešaka. `npx tsc --noEmit` čist (0 grešaka).

## 16. Kodni audit — bugovi, duplikati, mobile-ready separacija (dogovoreno 2026-09-18, čeka "kreni")

Korisnik je nakon UI/browser QA (§15) tražio dublju provjeru na nivou KODA: bugovi, dupliciran kod, i
da li je poslovna logika stvarno odvojena od UI-a kako `docs/frontend.md`/`docs/mobile.md` traže
(priprema za budući React Native mobile app, V3+). Pokrenuta su 3 paralelna read-only istraživanja
(struktura/veličina fajlova, dupliciranje, bugovi), oba prijavljena bug-a ručno potvrđena čitanjem
izvornog koda prije upisa ovdje. Sve niže je frontend-only rad, isti obrazac kao §14/§15. Odgovor na
"da li je arhitektura mobile-ready": DA na nivou strukture foldera (tačno prati `docs/frontend.md`
šablon) i `lib/api/*.ts`/`types/entities.ts` su čisti (bez React/JSX) — ALI poslovna logika (agregacije,
validacija) dijelom curi u velike UI komponente umjesto `lib/`, vidi §16.2 za pun detalj.

Redoslijed: **Faza 1** (16.1, sigurni/mehanički fix-evi) prije **Faze 2** (16.2, veći strukturni
refaktor) — Faza 2 se namjerno radi POSLIJE Faze 1 da refaktor krene na već očišćenom kodu (manje
pokretnih dijelova odjednom). Obje faze su dogovorene i dokumentovane sad; izvršenje čeka eksplicitno
"kreni" po fazi.

### 16.1 Faza 1 — 2 stvarna bug-a + 6 duplikata koda — [x] GOTOVO (2026-09-18)

**Bug A — prošli termini danas ostaju "slobodni" u booking wizardu — [x]**
- [x] `lib/api/availability.ts:26-28,64` — `dateKey()` koristi `date.toISOString().slice(0,10)`, što
      konvertuje u UTC prije sječenja datuma — isti bug klase kao već jednom popravljen u
      `lib/api/bookings.ts`. Za BiH (UTC+1/+2), `dateKey(izabraniDatum) !== dateKey(sada)` skoro cijeli
      dan, pa `isToday` (linija 64) ispadne `false` iako je stvarno danas → provjera `if (isToday &&
      t <= nowMinutes) continue;` (linija 70) se ne aktivira → već prošli termini ostaju vidljivi/
      klikabilni. Scenario: klijent otvori zakazivanje u 15:00 za "danas", vidi 09:00/10:00 kao
      dostupne. `components/owner/new-appointment-modal.tsx:99` ima ISPRAVNU verziju iste provjere
      (`date.toDateString() === now.toDateString()`) — bug je izolovan na `availability.ts`.
- [x] Fix: zamijeniti `dateKey()` da gradi lokalni "YYYY-MM-DD" string ručno (`getFullYear()`/
      `getMonth()`/`getDate()`), bez `toISOString()` — isti obrazac kao postojeći fix u
      `lib/api/bookings.ts` i komentar u `dashboard-content.tsx:331`. Potvrđeno u browser konzoli:
      simulacija 00:30 lokalno (UTC+2) — stari kod vraćao "prethodni dan", novi ispravan dan.

**Bug B — pad aplikacije pri uzastopnom pomjeranju termina — [x]**
- [x] `components/owner/dashboard-content.tsx:338,828,850,852` — `moveChoice` (`useState(0)`) se nikad
      ne resetuje kad se "Pomjeri" modal otvori za NOVI termin ili zatvori — mijenja se samo klikom na
      slot (linija 828). `moveSlots` (max 4 stavke, `useMemo` po `modalBooking`) se računa PO
      REZERVACIJI. Scenario: vlasnik otvori "Pomjeri" za termin A (4 ponuđena slota), klikne 4. opciju
      (`moveChoice`→3), zatvori. Otvori "Pomjeri" za termin B čiji radnik ima samo 1 slobodan termin
      (`moveSlots.length === 1`). `moveChoice` je i dalje `3`. Dugme "Potvrdi" NIJE disabled (guard na
      liniji 850 provjerava samo `moveSlots.length === 0`) → klik izvršava `moveSlots[3].iso` →
      `moveSlots[3]` je `undefined` → `TypeError`, ruši taj dio dashboarda.
- [x] Fix: resetovati `setMoveChoice(0)` pri otvaranju/zatvaranju "move" akcionog modala, i dodati
      `moveChoice >= moveSlots.length` u `disabled` uslov kao dodatnu zaštitu. Implementirano kroz nove
      `openActionModal()`/`closeActionModal()` helpere koji zamjenjuju direktne `setActionModal(...)`
      pozive — resetuju `moveChoice` na oba mjesta (otvaranje i sva 3 zatvaranja: dismiss, i uspješan
      confirm/cancel/no-show/move). Uživo testirano u browseru (Zahtjevi tab, 2 uzastopna "Pomjeri" na
      različitim terminima) — bez konzolnih grešaka.

**Duplikat 1 — `initials(ime)` — 5+ nezavisnih implementacija, jedna DRIFTOVANA — [x]**
- [x] Postoji `initialsFromName` u `lib/session.ts` ali ga niko drugi ne koristi. Kopije: identične u
      `components/owner/salon-setup-content.tsx` (`initials()`), `components/owner/
      client-history-content.tsx` (`initialsOf()`), `components/client/client-profile-content.tsx`
      (inline, fali `.filter(Boolean)`); DRIFT u `components/owner/dashboard-content.tsx`
      (`initialsOf()` — fali `.filter(Boolean)` I `.toUpperCase()`, inicijali ispadaju malim slovima);
      inline bez helpera u `components/owner/statistics-content.tsx`,
      `components/booking/booking-wizard.tsx` (2x), `components/invite/worker-invite-content.tsx`
- [x] Fix: premjestiti `initialsFromName` u `lib/format.ts` (`lib/session.ts` je izgubio svoj lokalni
      re-export čim se ispostavilo da mu ništa više ne treba — svi pozivaoci sad uvoze direktno iz
      `lib/format.ts`), zamijeniti svih 7+ kopija. Usput dodan `firstName(name)` helper u
      `lib/format.ts`, zamijenjeno 5 ad-hoc `name.split(" ")[0]` ponavljanja (navbar.tsx, staff-card.tsx
      — lokalna varijabla preimenovana u `workerFirstName` da ne sjenči import, dashboard-content.tsx,
      booking-wizard.tsx ×2, plus jedan dodatni poziv izvučen u `lastUsedWorkerName` konst radi
      čitljivosti). Uzgred otkriveno i popravljeno: dashboard-content.tsx "Klijenti" tab i booking
      wizard staff picker su imali JOŠ DVIJE odvojene inline `initials` implementacije koje plan nije
      pobrojao (nisu bile "duplikat 5+" iz opisa, ali ista klasa problema) — sve sada kroz
      `initialsFromName`.

**Duplikat 2 — boja bedža statusa termina (`STATUS_TONE`) — 3 fajla, 2 RAZLIČITE šeme — [x]**
- [x] `components/client/my-bookings-content.tsx:33-40` (klijent): `completed`→"info", `no_show`→
      "warning". `components/owner/dashboard-content.tsx:82-89` i `components/owner/
      client-history-content.tsx:47-54` (vlasnik, 2/3 fajla): `completed`→"neutral", `no_show`→
      "danger". Stvarna vizuelna nekonzistentnost, ne samo duplikat — klijent i vlasnik vide drugu
      boju za isti status.
- [x] Fix: izdvojiti JEDNU `BOOKING_STATUS_TONE` mapu u `lib/format.ts` (tipizirana preko
      `BookingStatusTone` union, bez uvoza UI komponenti u `lib/` — čuva `lib/format.ts` React-free radi
      §16.2 mobile-ready cilja), uvezati na sva 3 mjesta. Kanonska šema: vlasnička (`neutral`/`danger`).

**Duplikat 3 — Modal overlay markup — identičan u 6 fajlova — [x]**
- [x] `fixed inset-0 z-30 ... bg-[var(--overlay-scrim)] backdrop-blur-sm` ručno pisan u
      `components/owner/edit-service-modal.tsx`, `components/owner/invite-worker-modal.tsx`,
      `components/owner/new-appointment-modal.tsx`, i inline u `dashboard-content.tsx`,
      `client-history-content.tsx`, `components/client/my-bookings-content.tsx`.
- [x] Fix: novi `components/ui/modal-overlay.tsx` (`<ModalOverlay className?>` wrapper + centrirani
      slot, `cn()` merge za padding override), zamijeniti svih 6 mjesta. Dva padding-varijanta iz
      originala (`p-4` vs `p-5`) sačuvana kroz `className="p-5"` override na 3 mjesta koja su ga imala.

**Duplikat 4 — Toast/snackbar markup — identičan u 5 fajlova — [x]**
- [x] Isti `fixed bottom-6 left-1/2 z-40 ... rounded-full bg-surface-inverse ... shadow-popover`
      markup u `dashboard-content.tsx`, `client-history-content.tsx`, `salon-setup-content.tsx`,
      `components/client/client-profile-content.tsx`, `components/client/my-bookings-content.tsx`.
- [x] Fix: novi `components/ui/toast.tsx` (`<Toast message>`), zamijenjeno svih 5 planiranih mjesta +
      2 DODATNA identična nalaza koje plan nije pobrojao: `components/auth/login-content.tsx` i
      `components/auth/registration-content.tsx` (isti markup, ista prilika za dedup — obuhvaćeno u
      istom prolazu). Ukupno 7 mjesta.

**Duplikat 5 — `Role`/`Page` tip redefinisan nezavisno + naziv-kolizija — [x]**
- [x] `Role = "owner"|"worker"` deklarisan nezavisno (identično, ali ne dijeljeno) u
      `dashboard-content.tsx:50` i `client-history-content.tsx:43`; `dashboard-content.tsx:49` ima i
      `Page` tip bez parnjaka. Odvojeno: `components/auth/registration-content.tsx:34` ima NEPOVEZAN
      `Role = "klijent"|"vlasnik"` — različita domena, ali isto ime zbunjuje pri čitanju više fajlova.
- [x] Fix: novi `types/dashboard.ts` (odvojeno od `types/entities.ts` — ovo su UI/view-state tipovi,
      ne stvarni API entiteti) sa `Role`/`Page`, uvezeno na oba mjesta i u oba `page.tsx` konzumenta
      (`app/[locale]/(owner)/dashboard/page.tsx`, `.../dashboard/klijenti/[ime]/page.tsx` — direktno iz
      `types/dashboard`, ne re-eksportovano kroz content komponente); lokalni tip u
      `registration-content.tsx` preimenovan u `RegistrationRole` (čisto preimenovanje).

**Duplikat 6 — hardkodirana mock imena vlasnika/radnika — raw literali u 6+ fajlova — [x]**
- [x] "Selma Hodžić"/"Lejla Hadžić" kao raw string literali u `dashboard-content.tsx`,
      `client-history-content.tsx`, `statistics-content.tsx`, `worker-invite-content.tsx` (+ već
      postojeća `SESSION_NAMES` mapa u `login-content.tsx` iz §15.2).
- [x] Fix: premjestiti `SESSION_NAMES` u `lib/session.ts` (eksportovanu), zamijeniti raw literale u
      sva 4 fajla + `login-content.tsx` sad uvozi odatle umjesto lokalne definicije. Uživo potvrđeno:
      quick-login kao vlasnik → Navbar "Selma" (firstName), dashboard sidebar "Selma Hodžić", Radnici
      tab initials "SH"/"AS"/"LH"/"MB".

**Nakon svake stavke u Fazi 1:** `npx tsc --noEmit` čist nakon svake (potvrđeno), uživo provjereno u
browseru (dashboard Zahtjevi/Klijenti/Radnici tabovi, booking wizard, login quick-login, pretraga
navbar) — bez konzolnih/server grešaka, ekrani vizuelno identični (osim namjerne unifikacije boje
statusa).

### 16.2 Faza 2 — rastavljanje "god-komponenti" + izvlačenje poslovne logike u `lib/` — [ ] POSLIJE FAZE 1 (Faza 1 gotova, push-ovana 2026-09-18, commit `2f8cbe9`)

Ovo je stvarna popravka za punu "mobile-ready" separaciju iz `docs/frontend.md`/`docs/mobile.md`, ali
značajno veći i rizičniji zahvat od Faze 1 (rastavljanje velikih komponenti, izvlačenje ~10-ak čistih
funkcija u `lib/`, dosta re-testiranja) — namjerno odvojeno da ne uđe u kod prije nego je dogovoreno.

**NAČIN RADA (dogovoreno sa korisnikom 2026-09-18):** STVAR PO STVAR, da korisnik može ispratiti šta se
tačno mijenja. Pravila:
1. Radi se JEDNA pod-stavka odjednom, nikad dvije paralelno. Prije početka pod-stavke kratko reći šta
   će se dirati.
2. Na kraju svake pod-stavke: `npx tsc --noEmit` čist, `npx eslint .` bez NOVIH grešaka (6 pre-existing
   ostaju, vidi §16.1), uživo provjera dirnutog ekrana u browseru (desktop+mobile), potvrda da se
   ponašanje NIJE promijenilo. Čist refaktor — bez novih feature-a i bez vizuelnih promjena.
3. Nakon svake pod-stavke: ažurirati ovaj fajl (`[ ]` → `[x]` + kratke napomene šta je izvučeno gdje),
   pa STATI i sačekati korisnikovo "sljedeća" prije prelaska na iduću stavku. Git add/commit/push samo
   na korisnikov eksplicitan zahtjev (predlog: jedan commit po pod-stavci radi lakšeg vraćanja).
4. Ako se usput nađe nešto van obima (bug, dodatni duplikat) — ne popravljati tiho, nego upisati ovdje
   i pitati.

**PREDLOŽENI REDOSLIJED** (od najmanjeg rizika ka najvećem — korisnik može promijeniti):
1. [x] Validacija formi → novi `lib/validation.ts` — GOTOVO (obim proširen na SVE forme, ne samo login +
   registraciju, po korisnikovom zahtjevu; vidi detalj u bullet-u "Forma-validacija" ispod)
2. [x] `salon-setup-content.tsx` — konstante u `lib/constants/` — GOTOVO (vidi bullet ispod)
3. [x] `client-history-content.tsx` — agregacije u `lib/` — GOTOVO (vidi bullet ispod)
4. `booking-wizard.tsx` — pod-komponenta po koraku + date helperi u `lib/`
5. `dashboard-content.tsx` — najveća, 7 tabova, radi se zadnja kad je obrazac već uhodan

(Redoslijed lista ispod je originalni iz audita, ne redoslijed izvršenja. Trenutne veličine nakon
Faze 1: dashboard 868, booking-wizard 708, client-history 603, salon-setup 593 linija.)

- [ ] `components/owner/dashboard-content.tsx` (868 linija) — jedna `DashboardContent` komponenta
      renderuje svih 7 tabova (kalendar/zahtjevi/klijenti/usluge/radnici/vrijeme/statistika) kroz
      `page === "..."` grane u istoj funkciji ("god component"). Lokalni helperi (`contactFor`,
      `startOfDay`, `timeOf`, `endTimeOf`; `initialsOf` već uklonjen u Fazi 1) i inline agregacije (no-show brojevi,
      booked-minutes, prihod, per-radnik tally na linijama 203-216, 728-749) trebaju u `lib/`. Plan:
      rastaviti po tabu u pod-komponente, izvući date helpere i agregacije u `lib/api/bookings.ts`
      ili novi `lib/dashboard-stats.ts`.
- [ ] `components/booking/booking-wizard.tsx` (707 linija) — jedna komponenta za cijeli booking flow
      (usluga→radnik→termin→potvrda); lokalni `startOfDay`/`isSameDay`/`freeWord` helperi umjesto u
      `lib/`. Plan: pod-komponenta po koraku, date helperi u `lib/format.ts`/`lib/api/availability.ts`.
- [x] `components/owner/client-history-content.tsx` (603 → 565 linija) — GOTOVO (2026-09-18).
      **Novi `lib/api/booking-metrics.ts`** (list-modul bez zavisnosti od `bookings.ts` runtime-a, da
      `bookings.ts` i `statistics.ts` oba mogu da ga koriste bez kružne/obrnute zavisnosti): 3 primitive koje
      su bile ispisane inline u 6 fajlova — `bookingAmount(b)` (šta klijent plaća: cijena minus popust),
      `completedRevenue(bookings)` (prihod = samo obavljeni), `countNoShows(bookings, window?)` (sa opcionim
      prozorom `{now, days}`). `statistics.ts` ih koristi umjesto 3 svoje kopije formule (`bucketBar`,
      `topServicesByCount`, `staffStatsRows`) i `rateBreakdown` za nedolaske. Novi `lib/date.ts`
      (`startOfDay`, `addDays`, lokalno vrijeme, ne UTC) — zamijenio privatne kopije u `statistics.ts`.
      **Novi `lib/api/client-history.ts`**: `NO_SHOW_THRESHOLD` (3) / `NO_SHOW_WINDOW_DAYS` (90), tip
      `HistoryFilter` + mapa filter→statusi (bila je nanovo kreirana na svakom renderu),
      `sortNewestFirst`, `filterHistory`, `summarizeClientHistory(bookings, now)` → `{completedCount,
      totalRevenue, lastCompletedAt, firstBookingAt, noShowsInWindow, thresholdReached}`.
      **`lib/format.ts`**: `formatTimeOfDay(iso)` i `formatDateShort(iso)` (ex lokalni `timeOf`/`dateLabel`).
      **Novi `components/owner/booking-status-icon.ts`** (`BOOKING_STATUS_ICON`, ex lokalni `STATUS_ICON`) —
      namjerno uz komponente a ne u `lib/` jer sadrži React ikone (lib/ mora ostati React-free radi mobile).
      Ručno građen `clientSummary` (isti oblik kao `summarizeClients`) zamijenjen pozivom
      `summarizeClients(allBookings)`; uklonjeni nekorišteni `Check`/`CircleX` importi.
      **Provjera:** `tsc` čist, `eslint` = isti 6 pre-existing; 18.543 poređenja stara-vs-nova logika na
      nasumičnim podacima (stara logika prepisana iz `git show HEAD:`, a cijela stara `statistics.ts` učitana
      iz HEAD-a i poređena sa novom za `buildRevenueBars`/`topServicesByCount`/`staffStatsRows`/
      `rateBreakdown`), uklj. tačnu granicu prozora (booking na tačno -90d ulazi, -90d-1min ne ulazi);
      uživo: Emina Pašić (prag 3/3, 56 KM, banner, filteri 4/1/0/3 termina, komentar, novi termin 4→5,
      blokada), Sanela Kovačević u ulozi radnika ("Predloži blokadu", 91 KM), 404 za nepostojećeg klijenta,
      i ekran Statistika (dirnut preko `statistics.ts`) bez grešaka.
      **Dodatno čišćenje istog dana (korisnik odobrio, kopije van planiranih stavki):** `statistics-content.tsx`
      (2× prihod → `completedRevenue`, uklonjen nekorišteni `getEffectivePrice` import),
      `my-bookings-content.tsx` (2× cijena → `bookingAmount`), `lib/api/bookings.ts` `summarizeClients` i
      `statistics.ts` `rateBreakdown` (ručno brojanje nedolazaka → `countNoShows`),
      `new-appointment-modal.tsx` (lokalni `startOfDay` → `lib/date.ts`). Provjera: ukupno 26.216
      poređenja stara-vs-nova logika (uklj. `summarizeClients` iz HEAD-a na miksu više klijenata, cijene,
      prihod, `startOfDay`/`addDays` na 800 datuma + prelazi na ljetno/zimsko vrijeme); uživo: Statistika
      (Sedmica/Mjesec/Danas/Raspon; sedmica identična ranijim brojevima 207 KM/+158,8%/6 termina),
      Moji termini (cijene 35/35/56 KM i historija 56/25/30/15/35 KM identične ranijim), dashboard
      "Klijenti" (Emina "Rizik nedolaska", Sanela "Redovan klijent"), modal novog termina (Danas/19.9./20.9.).
      **Preostale kopije ISTIH formula — SVE su u fajlovima koje dobijaju sljedeće stavke:**
      `dashboard-content.tsx` (stavka 5): `timeOf` (→ `formatTimeOfDay`), `startOfDay` (→ `lib/date.ts`),
      `STATUS_ICON` (→ `BOOKING_STATUS_ICON`), prihod-reduce r.736 (→ `completedRevenue`), nedolasci sa
      prozorom od 30 dana r.198 (→ `countNoShows(.., {now, days: 30})`), ukupni nedolasci r.730
      (→ `countNoShows`), cijena u redu r.273 (→ `bookingAmount`); `booking-wizard.tsx` (stavka 4):
      lokalni `startOfDay` (→ `lib/date.ts`).
- [x] `components/owner/salon-setup-content.tsx` (607 → 572 linija) — GOTOVO (2026-09-18). Domain podaci
      izvučeni iz komponente: novi `lib/constants/salon-setup.ts` (`SERVICE_DURATION_OPTIONS_MINUTES`,
      `WORKING_TIME_OPTIONS`, `WEEKDAY_LABELS_MON_FIRST`, `PHOTO_PLACEHOLDER_CAPTIONS`; imena su
      pojašnjena jer su sad globalni exporti, npr. `DURATIONS`/`DAYS_BS` bi bila nejasna), plus podaci
      koji su bili "zakopani" kao magični brojevi/literali: `MAX_SALON_PHOTOS` (10, bio hardkodiran na 2
      mjesta), `INITIAL_PHOTO_COUNT`, `DEFAULT_SERVICE_DURATION_MINUTES` (45), `DEFAULT_OPEN_TIME`/
      `DEFAULT_CLOSE_TIME`/`DEFAULT_OPEN_WEEKDAYS_COUNT`, početni demo nacrti `INITIAL_DRAFT_SERVICES`/
      `INITIAL_DRAFT_STAFF` i `createDefaultWeek()`. Novi `types/salon-setup.ts` (`DraftService`,
      `DraftStaff`, `DayHours`, `StaffStatus` — UI nacrti, ne API entiteti, zato odvojeno od
      `types/entities.ts`). Validacija (druga polovina originalnog opisa) je već riješena u stavci 1.
      Namjerno ostavljeno u komponenti: `TOTAL_STEPS`/`Step` (strukturni dio UI-ja, vezan za 5 ekrana),
      `SALON_NAME`/`SALON_CITY` (placeholder identitet, dokumentovan u §12) i jednolinijski state
      handleri (`applyMondayToAll`, `setDay`) — izvlačenje bi dodalo indirekciju bez koristi.
      **Provjera:** `tsc` čist, `eslint` = isti 6 pre-existing; 17 provjera da su premještene vrijednosti
      IDENTIČNE onima iz zadnjeg commit-a (izvučene iz `git show HEAD:` teksta, uklj. početne nacrte i
      default sedmicu); uživo kroz svih 5 koraka + "Pošalji na verifikaciju": 3/10 slika pa limit 10 i
      nestanak dugmeta, ciklični natpisi, 3 demo usluge/radnika, trajanja 15–120 sa 45 kao default,
      radno vrijeme Pon–Sub 09:00–19:00 / Ned zatvoreno sa 13 opcija vremena, pregled "6 radnih dana".
      Mobile layout nije posebno provjeravan jer se markup nije mijenjao.
      **Uočeno, van obima (nije mijenjano):** `stRole.trim() || "Radnik"` u `addStaff` upisuje hardkodiran
      bosanski tekst u podatak (kršenje pravila "svi UI tekstovi kroz translation", docs/CLAUDE.md #6);
      demo nacrti u `INITIAL_DRAFT_*` su takođe bosanski literali (prihvatljivo kao mock, ali ide u
      `lib/mock-data` kad backend krene).
- [x] Forma-validacija — GOTOVO (2026-09-18). Obim proširen sa login/registracije na SVE forme, i
      dopunjen novim pravilima tamo gdje forma nije imala nikakvu validaciju (korisnikova odluka: sve
      popraviti prije prelaska na sljedeću stavku).
      Novi `lib/validation.ts`: čiste funkcije (bez React/DOM/i18n). `validate*` vraćaju `null` ili KOD
      greške (komponenta ga mapira na prijevod), `is*` vraćaju boolean za forme sa onemogućenim
      dugmetom. Forme sa "Pošalji" dugmetom prikazuju toast, forme sa onemogućenim dugmetom prikazuju
      kratku poruku ispod polja tek kad je polje popunjeno a neispravno. 14+2 nova ključa u
      `messages/bs.json` (invalid*Toast/Hint, missingFieldsToast, nameRequiredToast).
      **Pravila:** email `x@y.zz`; mobitel 8–15 cifara, dozvoljeno `+`, razmaci, `-`, `()`, `/`, `.`
      (prolazi "061 234 567" i "+387 61 234 567"); kontakt = email ILI mobitel; lozinka min 8 i NIKAD se
      ne trimuje (razmaci mogu biti dio lozinke — ista pravila u registraciji, loginu, profilu i
      pozivnici); gost ime ≥2 znaka; popust 1–90; cijena teksta > 0 i prihvata bosanski decimalni zarez
      ("25,5" — `parsePriceInput`).
      **Povezano po formi:** login (`validateLogin`, sad provjerava i format kontakta), registracija
      klijent/vlasnik (`validateAccountFields` / `validateSalonBasics` — sad i format kontakta/mobitela
      salona / `validateTermsAccepted`), profil "Sačuvaj" (`validateProfile` — ime obavezno, email
      ispravan, mobitel opcion ali ispravan ako je unesen) + promjena lozinke (`validatePasswordChange`),
      pozivnica radniku (`validateNewPassword`), modal usluge (`validateServiceEdit`; `min`/`max` na
      inputu vezani za iste konstante), novi termin za gosta (`isGuestClientValid` + hintovi), modal
      pozivnice (`isWorkerInviteValid`), booking wizard korak 4 (`isGuestBookingDetailsValid` + hintovi
      za ime/mobitel/email), salon-setup (cijena usluge obavezna i > 0, email radnika opcion ali
      ispravan), bilješka klijenta (`hasText`), recenzija (`isRatingSelected`). Pravilo za lozinku je
      prije bilo kopirano u 3 fajla — sad jedno.
      **Ispravljene nedosljednosti iz prve verzije:** prazna polja za lozinku (profil, pozivnica) sad
      pokazuju "popuni polja" umjesto pogrešne poruke "lozinke se ne poklapaju"; lozinka od samih
      razmaka se više ne tretira različito u registraciji i profilu.
      Ostavljeno namjerno: `parseBsDate` za statistiku već je u `lib/api/statistics.ts`; preostali
      `.trim()` u `review-form`/`invite-worker-modal`/`salon-setup-content` su normalizacija unosa.
      **Provjera:** `tsc` čist; `eslint` = isti 6 pre-existing; 115 tvrdnji o pravilima (ispravni +
      neispravni primjeri, granice 7/8 i 15/16 cifara, redoslijed grešaka) i provjera da SVIH 38
      mobitela/emailova iz `lib/mock-data` zadovoljava nova pravila (da demo ne odbija vlastite podatke);
      uživo u browseru: login, registracija klijent + vlasnik (korak 2), profil (ime/email/mobitel/lozinka),
      pozivnica radniku, modal usluge, salon-setup (cijena sa zarezom, email radnika), booking wizard
      korak 4, novi termin za gosta, modal pozivnice. Nije uživo klikano: recenzija i bilješka klijenta
      (samo `hasText`/`isRatingSelected`, nepromijenjeno ponašanje).
      **Napomena o testovima:** projekat nema test runner (nema vitest/jest), pa su provjere pravila
      pokretane kao jednokratna skripta van repoa, NISU u repou. Preporuka: kad se uvede test runner,
      prvi test-fajl treba biti `lib/validation.ts`.
      **Uočeno, van obima (nije mijenjano):** salon-setup lista usluga prikazuje cijenu kao "25.5 KM"
      (tačka) umjesto "25,5 KM" jer ne koristi `formatPrice`; `stEmail` u salon-setup se validira ali
      se nigdje ne koristi/šalje.
      **VAŽNO za backend:** sva ova pravila su frontend-only iz mock faze. Kad backend krene, MORAJU se
      uskladiti sa Laravel Form Requests (`docs/backend.md`, `docs/frontend.md`) — posebno format
      mobitela, min dužina lozinke i raspon popusta.
      Napomena: `next dev` (Turbopack) se jednom srušio internim panic-om usred testa — restart je
      riješio, nije vezano za kod.
- [ ] Nakon svake pod-stavke: `npx tsc --noEmit` čist, pun vizuelni regresioni prolaz kroz dirnuti
      ekran (desktop+mobile), potvrda da se ponašanje NIJE promijenilo (ovo je čist refaktor, ne
      feature rad).

## Napomena o obimu / redoslijedu

Redoslijed rada: setup (§1) → migracije/modeli (§2) → auth (§3) → salon CRUD (§4) → booking engine (§5,
najkritičniji) → notifikacije (§6) → ostali ekrani/moduli (§7–12). Ne raditi V2+ funkcionalnost
(payment, Meilisearch, multi-lokacija UI, loyalty, waiting lista) — vidi `docs/specifikacija.md` §4 za
punu listu šta NIJE u V1.
