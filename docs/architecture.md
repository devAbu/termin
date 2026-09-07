# Architecture — SrediMe

<!-- applyTo: sredime-backend/**, sredime-frontend/** -->

## Pregled sistema

SrediMe je two-sided marketplace realizovan kao dvije odvojene aplikacije koje komuniciraju preko REST API-ja:

```
┌─────────────────┐         REST API          ┌──────────────────┐
│  Next.js (web)   │ ◄──────(Sanctum token)───► │  Laravel 11 API   │
│  sredime-frontend│                            │  sredime-backend  │
└─────────────────┘                            └──────────────────┘
                                                         │
                                                         ▼
                                                   ┌───────────┐
                                                   │  MySQL 8  │
                                                   └───────────┘
```

Nema server-side renderinga unutar Laravel-a. Next.js je potpuno odvojen sloj — razlog: budući reuse komponenti/logike s React Native mobilnom aplikacijom (V3+), i konzistentnost sa KlubDesk pristupom.

## Multi-tenant model

**Tenant = Salon.** Nema Organizacija sloja (za razliku od KlubDeska) — u V1 je model jednostavan: `Salon.owner_id` → `User`.

**Izolacija je aplikativna, ne DB-level.** Nema RLS (Row-Level Security), nema Postgres-a. Razlog: tenant model ovdje nema kompleksnost kakvu je imao KlubDesk (Organizacija/Staff/UNION) — nema radnika koji rade preko više salona, svaki Worker pripada tačno jednom Salonu. Aplikativna izolacija kroz `salon_id` scope je dovoljna.

**Pravilo:** Svaki upit koji dira Booking, Worker, Service, Review, BlacklistEntry, LoyaltyAccount, ili bilo koji entitet vezan za salon MORA biti filtriran po `salon_id`. Implementirati kao Eloquent global scope na modelima (`BelongsToSalon` trait/scope) — ne oslanjati se na to da svaki developer ručno doda `where` na svaki upit.

## Owner → Salon kardinalitet (1:N od V1)

`Salon.owner_id` referencira `User.id`. Jedan `User` (vlasnik) može imati više `Salon` zapisa.

**Šta je pripremljeno u V1:**
- FK kardinalitet u bazi (Salon → owner)
- Eloquent relationship: `$user->salons()` (hasMany), `$salon->owner()` (belongsTo)

**Šta NIJE u V1 (dolazi u V2):**
- UI za prebacivanje između salona u dashboardu
- Agregatna statistika preko više salona istog vlasnika
- Bilo kakva logika koja pretpostavlja da vlasnik upravlja s više salona istovremeno u istoj sesiji

**Razlog za ovu podjelu:** Kardinalitet je jeftino postaviti sad (isti trud kao 1:1), a skupo mijenjati kasnije (migracija na postojećim podacima + kod koji svuda pretpostavlja 1:1). UI/logika za multi-salon upravljanje je skuplja i nema smisla graditi je prije nego je stvarno zatražena.

**Ne raditi:** Ne pisati kod koji stavlja `salon_id` na `User` tabelu (to bi bilo obrnuto — 1:1 iz pogrešnog smjera i blokiralo bi buduće multi-salon proširenje).

## Booking kao centralni entitet

Booking je entitet oko kojeg se vrti gotovo cijeli sistem — notifikacije, statistike, loyalty (kasnije), recenzije i blacklist svi čitaju ili pišu Booking status. Promjene statusnog modela nakon produkcije su skupe (postojeći podaci, postojeća logika koja se oslanja na trenutne statuse) — vidi `docs/database.md` za pun statusni model i vidi `docs/specifikacija.md` §3.1 prije bilo kakve izmjene statusa ili prelaza između statusa.

## Regionalna priprema (jeftina "osiguranja" urađena u V1)

Ovo su strukturne pripreme koje ne mijenjaju V1 funkcionalnost, ali sprječavaju skupu migraciju kasnije:

- **`country_code`** na `Salon` — omogućava buduću ekspanziju izvan BiH bez redizajna filtera za pretragu. U V1 uvijek popunjeno (npr. `BA`), ali kolona postoji od početka.
- **`currency`** na `Service`/`Payment`-related poljima gdje se novac pojavljuje — u V1 uvijek `BAM`, ali nije hardkodirano u logici.
- **Translation-ready tekstovi** — svi UI stringovi idu kroz i18n sistem od početka (Laravel `__()`, Next.js i18n), čak i kad postoji samo bosanski jezik. Dodavanje HR/SR/EN kasnije znači dodavanje prevoda, ne redizajn.
- **Queue-based email** — Laravel Queue (Redis/DB driver) od početka za sve emailove/notifikacije, umjesto sinhronog slanja. Sprječava da rast broja korisnika blokira request-response ciklus, i sprječava skupo refaktorisanje stotina mjesta u kodu koja bi inače direktno slala mail.

## Šta se namjerno NE priprema strukturno u V1

Razlika između "jeftino osiguranje" (gore) i "gradim strukturu za feature koji nema odluku iza sebe" (ovo dolje) — vidi princip u `docs/specifikacija.md` §6:

- **Payment tabela/entitet** — model monetizacije (provizija vs. pretplata, iznos depozita) nije odlučen. Graditi šemu sad znači rizik migracije ako se odluka promijeni. Kad V3 dođe na red, Payment tabela se dizajnira gateway-agnostic (podržava Monri i Stripe od početka te implementacije).
- **Search infrastruktura (Meilisearch)** — standardni MySQL upit s indexima (vidi `docs/database.md`) je dovoljan za V1 obim. Dodaje se kao odvojeni indeksni sloj kasnije, bez promjene postojećeg data modela.
- **Multi-lokacijski UI/logika** — vidi sekciju gore o owner→salon kardinalitetu.

## Skalabilnost — šta se rješava na nivou infrastrukture, ne koda

Ovo su odluke koje se donose na deployment nivou kad zatreba, i ne zahtijevaju promjenu šeme ili aplikativnog koda napisanog danas:

- Read replike MySQL baze (kad čitanje/pretraga poraste)
- CDN/multi-region hosting (kad geografska latencija postane relevantna)
- Meilisearch (kad standardni SQL postane spor — realno tek pri desetinama hiljada salona, ne korisnika)

Funkcionalno, korisnik iz Sarajeva i korisnik iz bilo kog drugog grada/države prolaze kroz identičan kod — region utiče samo na podatke (jezik, valuta, gateway), ne na logiku aplikacije.
