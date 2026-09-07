# Backend — SrediMe (Laravel 11 API)

<!-- applyTo: sredime-backend/** -->

## Stack

- Laravel 11, PHP
- Eloquent ORM, MySQL 8
- Laravel Sanctum za API auth (token-based — frontend je odvojena Next.js aplikacija, nema server-side sesija dijeljenih s Laravel-om)
- Laravel Queue (Redis driver preporučeno, DB driver kao fallback) — sve slanje emaila ide kroz Job, nikad sinhrono u request-response ciklusu
- Cloudflare R2 kao storage driver (S3-compatible — koristiti `s3` filesystem driver s R2 endpoint konfiguracijom, ne `local`)
- Resend kao mail driver

## Struktura

Standardna Laravel struktura (`app/Models`, `app/Http/Controllers`, `app/Http/Requests`, `app/Policies`, `app/Jobs`, `database/migrations`, `database/factories`, `database/seeders`).

Dodatno:
- `app/Scopes` — Eloquent global scope-ovi (npr. `BelongsToSalonScope` za tenant izolaciju)
- `app/Services` — poslovna logika koja ne pripada direktno modelu ili kontroleru (npr. `BookingStatusService` koji upravlja statusnim prelazima i validira pravila iz `docs/specifikacija.md` §3.1)

## API konvencije

- REST, resource controllere (`Route::apiResource`)
- Svaki endpoint koji vraća/mijenja podatke vezane za salon MORA prolaziti kroz Policy koja provjerava da li trenutni korisnik ima pristup tom `salon_id` (vidi `docs/permissions.md`)
- Validacija kroz Form Request klase (`app/Http/Requests`), ne inline u kontroleru
- API resource klase (`app/Http/Resources`) za formatiranje odgovora — frontend nikad ne prima sirove Eloquent modele
- Verzionisanje API-ja od početka: `/api/v1/...` (olakšava buduće breaking promjene bez rušenja postojećeg frontend/mobile klijenta)

## Tenant izolacija — implementacija

Global scope na modelima koji imaju `salon_id` (Worker, Service, Booking, Review, BlacklistEntry, ClientNote, LoyaltyAccount):

```php
// app/Scopes/BelongsToSalonScope.php — primjer principa, ne finalna implementacija
// Automatski dodaje WHERE salon_id = trenutni kontekst na svaki upit tog modela
```

Ovo je obavezno — ne oslanjati se na to da svaki kontroler ručno doda `->where('salon_id', ...)`. Scope sprječava propust.

## Eloquent konvencije

- **N+1 prevencija je obavezna.** Svaka lista koja učitava relaciju (salon → radnici, booking → klijent/radnik/usluga) mora koristiti eager loading: `Salon::with('workers', 'services')->get()`, ne petlju koja pristupa `$salon->workers` pojedinačno.
- **Money kao decimal.** Cast na modelu: `protected $casts = ['price' => 'decimal:2'];` — nikad float u kodu ili bazi.
- **Vremena kao UTC.** Laravel default `timezone` config ostaje `UTC`. Konverzija u BiH lokalno vrijeme (CET/CEST) dešava se isključivo na frontendu pri prikazu, nikad u backend logici ili upitu.
- **Status polja kao PHP enum** (Laravel 11 podržava native enum cast) — ne string konstante razbacane po kodu.

## Storage (Cloudflare R2)

Konfigurisati `filesystems.php` s `r2` diskom koristeći `s3` driver i R2 endpoint. Upload slika salona, radnika, usluga ide kroz ovaj disk, ne `local`/`public` disk — čak i u V1, da se izbjegne migracija fajlova kasnije.

## Email (Resend)

Laravel mail driver konfigurisan na Resend. Svi mailable-i (`app/Mail`) šalju se kroz Queue (`ShouldQueue` interface na Mailable klasi), nikad direktno `Mail::send()` sinhrono.

Notifikacije iz `docs/specifikacija.md` §4.5 (potvrda rezervacije, podsjetnik, otkazivanje, promjena termina) implementirati kao odvojeni Mailable + Job po tipu, s zapisom u `notifications` tabelu (vidi `docs/database.md`) radi audit traga.

## Queue

Redis driver preporučen za produkciju (DB driver dovoljan za lokalni development). Sav email/notification posao ide kroz `Job` klase u `app/Jobs`. Ovo je odluka donesena od V1 zbog buduće skalabilnosti (vidi `docs/architecture.md`), ne nešto što se dodaje naknadno.

## Auth (Sanctum)

Token-based auth. Registracija/login vraća token koji Next.js frontend čuva i šalje kroz `Authorization: Bearer` header na svaki API poziv. Role (`client`/`owner`/`worker`/`admin`) se čuva na `User` modelu i provjerava kroz Middleware/Policy kombinaciju — nikad samo kroz frontend rutiranje.

## Šta NE implementirati u V1

- Payment/gateway integracija (Monri/Stripe) — nema Payment modela, nema kontrolera za to
- Search servis (Meilisearch klijent) — standardni Eloquent upiti s indexima su dovoljni
- Push/SMS notification kanali — samo `email` u Notification enum-u

Vidi `docs/specifikacija.md` za pun V1 obim prije dodavanja bilo koje funkcionalnosti van gore navedenog.
