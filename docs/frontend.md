# Frontend — SrediMe (Next.js)

<!-- applyTo: sredime-frontend/** -->

Ovaj dokument pokriva TEHNIČKU strukturu web frontenda. Vizuelni dizajn (boje, tipografija, komponenta biblioteka, brand) je u `docs/design.md` i trenutno je placeholder — ne čekati taj fajl da se počne s tehničkom strukturom.

## Stack

- Next.js (App Router), odvojena aplikacija od Laravel backenda
- Komunikacija s backendom isključivo preko REST API-ja (`/api/v1/...`), auth kroz Sanctum token (čuvan npr. u httpOnly cookie ili secure storage — finalna odluka o tačnom mehanizmu ostaje otvorena do implementacije, ali token se NIKAD ne čuva u plain localStorage bez razmatranja XSS rizika)

## Struktura foldera (App Router konvencija)

```
app/
  (public)/              # javne, indeksirane rute — SEO bitan
    saloni/[slug]/        # profil salona
    pretraga/              # discovery/search stranica
  (auth)/
    prijava/
    registracija/
  (client)/               # zaštićene rute za klijenta
    profil/
    rezervacije/
  (owner)/                # zaštićene rute za vlasnika/radnika
    dashboard/
    kalendar/
    radnici/
    usluge/
    statistika/
components/
  ui/                     # generičke komponente (dugme, input, modal...)
  booking/                # komponente vezane za booking flow
  salon/                  # komponente vezane za prikaz salona
hooks/
lib/
  api/                    # API client, request wrapperi
i18n/
```

**Napomena o SEO:** Stranice profila salona i pretrage su javne i moraju biti indeksirane na Google-u (klijenti trebaju NAĆI salon) — koristiti Next.js server components/SSR za te rute, ne client-only rendering. Dashboard/rezervacije (iza login-a) mogu biti client-heavy jer SEO tamo nije relevantan.

## State management

- **Server state** (podaci s backenda — saloni, bookinzi, korisnik): React Query (TanStack Query) — cache, refetch, optimistic updates za akcije poput potvrde/otkazivanja termina
- **Client state** (UI stanje — otvoren modal, koraci u booking wizard-u): React state/Context, bez potrebe za dodatnom bibliotekom u V1 obimu

## API komunikacija

- Centralizovan API klijent u `lib/api/` — sve komponente pozivaju kroz njega, ne direktan `fetch` razbacan po komponentama
- Token se automatski dodaje na svaki zahtjev kroz interceptor/wrapper
- Error handling konzistentan — 401 (istekao token) preusmjerava na login, 403 (nema dozvolu) prikazuje jasnu poruku, ne generic error

## Booking flow (3-Click Booking)

Vidi `docs/specifikacija.md` §4.3 — usluga → radnik → termin → potvrda. Implementirati kao wizard komponenta (`components/booking/`) koja čuva izabrane korake u lokalnom state-u dok se ne pošalje finalni zahtjev. Real-time provjera dostupnosti (da slot još nije zauzet) prije finalne potvrde.

## i18n

Next.js i18n routing od početka (`/bs/...` čak i ako je trenutno jedini jezik), svi tekstovi kroz translation fajlove (`i18n/`), nikad hardkodiran tekst u komponenti. Ovo omogućava dodavanje HR/SR/EN kasnije (V5+) bez redizajna.

## Konvencije komponenti

- Server components po defaultu (Next.js App Router), `'use client'` samo gdje je interaktivnost stvarno potrebna
- Forme: kontrolisane komponente + validacija koja odgovara Laravel Form Request pravilima na backendu (ne dupliciraj pravila ručno bez sinhronizacije — provjeri `docs/backend.md` za validaciju na dotičnom endpointu)
- Loading/error state: konzistentan pattern kroz cijelu aplikaciju (skeleton loaders za liste, jasne error poruke), ne ad-hoc po komponenti

## Mobile reuse (napomena za budućnost)

Next.js frontend nije direktno reusable u React Native (V3+, vidi `docs/mobile.md`), ali poslovna logika (API pozivi, validacija, tipovi/interfejsi za entitete) treba biti odvojena od UI komponenti gdje god je moguće (npr. `lib/api/`, tipovi u `types/`) da se ta logika kasnije može podijeliti kroz shared paket s mobilnom aplikacijom.

## Šta NE implementirati u V1

- Payment/checkout UI (nema Payment modela na backendu)
- Search UI vezan za Meilisearch (standardna pretraga kroz postojeći API endpoint je dovoljna)
- Push notification permission/handling (nema mobilne app, nema web push u V1 obimu)

## Vizuelni dizajn

Trenutno TBD — vidi `docs/design.md`. Dok se ne popuni, koristiti neutralan, čist UI (Tailwind CSS kao osnova) bez finalnih brand odluka, da se ne gradi UI koji će trebati potpuni redizajn kad dizajn faza bude gotova.
