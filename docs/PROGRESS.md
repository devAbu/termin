# PROGRESS — SrediMe

**OBAVEZNO PRVO ČITANJE na početku svake sesije** (vidi `docs/CLAUDE.md`). Statusi: `[ ]` nije počeo,
`[~]` u toku, `[x]` gotovo. Ažurirati odmah nakon svakog završenog zadatka, ne čekati kraj sesije.

## Sljedeći koraci (kraj sesije 2026-09-17, deveti krug)

**"Statistika" ekran je završen** (ruta `/statistika`, vidi §11/§12 ispod za detalje) — samostalni
izvještaj (period Danas/Sedmica/Mjesec/Raspon + filter po radniku), sve računato iz STVARNIH
`bookings.json` podataka (nema fabrikovanih brojeva kao u dizajn demo-u). `lib/mock-data/bookings.json`
prošireno sa ~18 novih historijskih termina za Studio Lux (zadnjih ~30 dana) da tjedni/mjesečni
izvještaji imaju realnu raspodjelu — vidi §12 napomenu. Nova `lib/api/statistics.ts` (bucketing po
satu/danu/sedmici, capacity/popunjenost, top usluge, stope otkazivanja/nedolazaka, izvještaj po radniku
— sve pure/testabilne funkcije). Dashboard-ova mini "Statistika" tab OSTAJE (različita svrha po
specifikaciji §4.6 — brz pregled potvrđenih/nepotvrđenih po radniku), sad dobija "Puni izvještaj →" link
ka novom ekranu umjesto starog "dolazi kasnije" teksta.

**Korisnikova eksplicitna odluka o redoslijedu: "Prijava" i "Registracija" (auth ekrani) idu ZADNJI, nakon
svih preostalih javnih/klijent/vlasnik ekrana.** Trenutno stanje — od 15 `.dc.html` ekrana, **11 gotovo**:
Home page, Pretraga salona, Salon profil, 3-Click Booking, Moji termini, Recenzija, Klijent profil,
Salon dashboard, Klijent historija, Salon setup, Statistika. **Preostalo je 4:**
- Marketing (public, bez auth-a): **Za salone** (landing za vlasnike)
- Vlasnik/salon upravljanje (isti sidebar kao "Salon dashboard"/"Klijent historija"/"Statistika"): **Pozivnica radniku**
- Zadnje po korisnikovom izboru: **Prijava**, **Registracija**

Korisnik bira sljedeći ekran na početku svake sesije — ne pretpostavljati redoslijed unutar preostalih 4.
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
- [ ] Prijava
- [ ] Registracija
- [ ] Pozivnica radniku
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
- [ ] Za salone (marketing/landing stranica za vlasnike)

## 13. Admin (funkcionalno, BEZ UI) — `docs/specifikacija.md` §4.13

- [ ] Salon status enum (`pending`/`active`/`suspended`) postoji i poštuje se u query-jima (salon
      nevidljiv klijentima dok nije `active`) — odobravanje se radi kroz Tinker/SQL, ne UI

## Napomena o obimu / redoslijedu

Redoslijed rada: setup (§1) → migracije/modeli (§2) → auth (§3) → salon CRUD (§4) → booking engine (§5,
najkritičniji) → notifikacije (§6) → ostali ekrani/moduli (§7–12). Ne raditi V2+ funkcionalnost
(payment, Meilisearch, multi-lokacija UI, loyalty, waiting lista) — vidi `docs/specifikacija.md` §4 za
punu listu šta NIJE u V1.
