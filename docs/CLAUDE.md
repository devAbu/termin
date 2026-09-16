# CLAUDE.md — SrediMe

Ovaj fajl je glavna ulazna tačka za Claude Code. Učitava se automatski na početku svake sesije. Ostali fajlovi u `docs/` se čitaju po potrebi — svaki ima jasno naznačeno kad se koristi.

## Šta je SrediMe

SrediMe (radni naziv u ranoj fazi: "JASKO") je platforma za zakazivanje termina u salonima ličnih usluga (frizerski, kozmetički, nail, barbershop) na BiH tržištu, s planom regionalne ekspanzije.

Model: **two-sided marketplace**. Klijenti pretražuju i rezervišu termine kod salona; saloni (vlasnici i radnici) upravljaju kalendarom, uslugama i radnicima. Cilj je da salon u potpunosti napusti telefonsko zakazivanje.

**Fokus V1:** mali i srednji saloni (1–10 radnika), BiH region, isključivo web platforma. Mobilna aplikacija dolazi tek u V3+.

## Tech stack

| Sloj | Tehnologija |
|---|---|
| Backend | Laravel 11 (PHP), Eloquent ORM, MySQL 8 |
| Web frontend | Next.js (odvojen repo/app od backenda, komunicira preko REST API-ja) |
| Mobile (V3+, ne graditi sad) | React Native + Expo |
| File storage | Cloudflare R2 (S3-compatible driver) |
| Email | Resend |
| Queue | Laravel Queue (Redis ili DB driver) — email/notifikacije idu kroz Job, nikad direktno sinhrono |
| Auth (API) | Laravel Sanctum (token-based, jer je frontend odvojena aplikacija) |

Detalji i obrazloženja u `docs/backend.md` i `docs/frontend.md`.

## Struktura repoa

Backend i frontend su **odvojeni projekti** (ne monorepo):

```
sredime-backend/     # Laravel 11 API
sredime-frontend/    # Next.js web app
sredime-mobile/      # React Native + Expo (ne postoji još — V3+)
```

Frontend komunicira s backendom isključivo preko REST API-ja (Sanctum token auth). Nema server-side renderovanja unutar Laravel-a (nema Blade/Inertia) — Next.js je potpuno odvojen sloj radi budućeg reuse-a komponenti s mobilnom aplikacijom.

## Globalna pravila i konvencije

1. **Tenant izolacija je aplikativna, ne DB-level.** Nema RLS, nema Postgres-a. Svaki upit koji dira podatke vezane za salon MORA filtrirati po `salon_id` (Eloquent global scope ili eksplicitan `where`). Ovo pravilo mora biti primijenjeno na nivou API-ja/backend logike, nikad se ne oslanjati samo na frontend da sakrije podatke.

2. **Owner → više salona je već podržano u data modelu od V1** (`Salon.owner_id` → `User`, kardinalitet 1:N), iako UI za upravljanje s više salona istovremeno dolazi tek u V2. Nikad ne pisati kod koji pretpostavlja "1 user = tačno 1 salon" (npr. `user.salon_id` na User tabeli je pogrešno — ide obrnuto, `salon.owner_id` na Salon tabeli).

3. **Ne graditi V2/V3/V4/V5 funkcionalnost prije vremena.** Vidi `docs/specifikacija.md` za tačnu podjelu po verzijama. Konkretno, u V1 se NE implementiraju:
   - Online plaćanje/depoziti (nema Payment tabele, nema Monri/Stripe integracije)
   - Meilisearch (standardni MySQL upiti su dovoljni za V1 obim)
   - Multi-lokacijski UI (kardinalitet postoji, ali ne i interfejs za upravljanje s više salona)
   - Push/SMS notifikacije (email je jedini kanal u V1)
   - Loyalty program, waiting lista, Quick Match, AI napredne funkcije
   
   Kad neka od ovih funkcionalnosti bude zatražena eksplicitno, gradi se tada — ne unaprijed.

4. **Admin Panel funkcije postoje funkcionalno od V1 (odobravanje salona, moderacija, suspenzija), ali BEZ posebnog admin UI-ja.** Te operacije se u ranoj fazi rade direktno kroz bazu (SQL) ili Laravel Tinker. Ne graditi admin dashboard u V1 osim ako se eksplicitno zatraži.

5. **Sva vremena u bazi čuvati u UTC.** Konverzija u lokalno vrijeme (BiH, CET/CEST) dešava se isključivo na prikazu (frontend), nikad u bazi ili backend logici. Ovo je posebno kritično oko prelaska na ljetno/zimsko vrijeme.

6. **Svi UI tekstovi idu kroz translation sistem od početka** (Laravel `__()` na backendu, Next.js i18n routing na frontendu), čak i ako V1 ima samo bosanski jezik. Nikad hardkodirati tekst direktno u komponentu/view.

7. **Money vrijednosti kao decimal, nikad float.** Sve cijene, iznosi — `decimal` kolone u bazi, string/decimal tipovi u kodu.

8. **Role-based pristup se primjenjuje na nivou API-ja (Laravel Policy/Middleware), nikad samo na frontendu.** Radnik ne smije moći pozvati API endpoint rezervisan za vlasnika, čak i ako zna URL.

9. **Password hashing isključivo bcrypt/argon2** (Laravel default), nikad plain tekst ni custom hashing.

10. **Indexing i N+1 prevencija su obavezni od prve linije koda**, ne naknadna optimizacija. Detalji u `docs/database.md` i `docs/backend.md`.

## Kad koji fajl čitati

| Fajl | Kad ga čitati |
|---|---|
| `docs/PROGRESS.md` | **OBAVEZNO PRVO, na početku SVAKE sesije**, prije bilo čega drugog — checklist stanja projekta (šta je gotovo, u toku, nije početo). Vrijedi bez obzira da li nastavlja ista osoba ili neko drugi preuzima rad. |
| `docs/specifikacija.md` | Pri bilo kojoj nedoumici oko obima (šta je V1 vs V2+), poslovnih pravila, ili prioriteta funkcionalnosti |
| `docs/architecture.md` | Prije bilo kakvog rada na tenant izolaciji, multi-salon logici, ili strukturnim odlukama |
| `docs/database.md` | Prije pisanja/mijenjanja migracija, modela, ili upita — sadrži pun data model i indexing pravila |
| `docs/backend.md` | Prije pisanja Laravel koda — konvencije, storage/mail/queue setup, API konvencije |
| `docs/frontend.md` | Prije rada na Next.js aplikaciji — struktura, state management, API komunikacija |
| `docs/permissions.md` | Prije implementacije bilo koje akcije vezane za uloge (vlasnik/radnik/klijent/admin) |
| `docs/mobile.md` | Samo kad se eksplicitno počne raditi na mobilnoj aplikaciji (V3+) — trenutno referentni dokument, ne aktivni razvoj |
| `docs/design.md` | Pri radu na vizuelnom dijelu frontenda — trenutno skeleton/placeholder, popunjava se tokom dizajn faze |

## Praćenje napretka (PROGRESS.md)

`docs/PROGRESS.md` je checklist svih glavnih zadataka projekta (setup, migracije, modeli, auth, booking engine, svaki ekran) sa statusima `[ ]`/`[~]`/`[x]`. Ažurira se nakon SVAKOG završenog zadatka, ne samo na kraju sesije. Ovo je mehanizam koji omogućava da se rad nastavi bez gubitka konteksta — bilo nakon pauze (isteknuti tokeni, nova sedmica) bilo kad drugi developer preuzme projekat. Ako `docs/PROGRESS.md` ne postoji, kreirati ga prije početka bilo kakvog rada.

## Status projekta

V1.0 specifikacija je finalizovana (avgust 2026), dizajn sistem i svih 15 ključnih ekrana su gotovi u Claude Design (3 kruga QA provjere), s otvorenim pitanjima dokumentovanim u `docs/specifikacija.md` (poglavlje 6) koja ne blokiraju V1 development. Tech stack potvrđen. Development (Claude Code) počinje.
