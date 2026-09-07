# Permissions — SrediMe

<!-- applyTo: sredime-backend/app/Policies/**, sredime-backend/app/Http/Middleware/** -->

## Uloge

`client`, `owner`, `worker`, `admin` — čuvano na `User.role`.

## Tabela dozvola

| Akcija | Vlasnik | Radnik | Admin platforme |
|---|---|---|---|
| Kreiranje/uređivanje salona | Da | Ne | Ne (osim moderacije) |
| Dodavanje/uklanjanje radnika | Da | Ne | Ne |
| Uređivanje vlastitog radnog vremena | Da | Da (samo svoje) | Ne |
| Potvrda/otkazivanje/pomjeranje termina | Da (svi termini salona) | Da (svi termini salona, bez ograničenja) | Ne |
| Pristup finansijskoj statistici salona | Da | Ne (osim ako vlasnik eksplicitno dozvoli) | Da — pun pristup (kroz app ili direktno kroz bazu) |
| Blokiranje klijenta (blacklist) | Da | Ne po defaultu — šalje prijedlog vlasniku. Vlasnik može po radniku uključiti `can_block_clients` da radnik direktno blokira | Ne |
| Odobravanje novih salona na platformi | Ne | Ne | Da |
| Moderacija recenzija / suspenzija salona | Ne | Ne | Da |

**Važno:** Radnik ima ista prava kao vlasnik nad SVIM terminima salona (ne samo svojim) po pitanju potvrde/otkazivanja/pomjeranja — bez ograničenja broja izmjena. Razlika između vlasnika i radnika je isključivo na administrativnom nivou (upravljanje salonom, radnicima, cijenama).

## Implementacija (Laravel Policy)

Svaka akcija vezana za salon prolazi kroz Policy koja provjerava:
1. Da li je korisnik autentifikovan (Sanctum token)
2. Da li korisnikova rola dozvoljava akciju (tabela gore)
3. Da li korisnik pripada tačno tom `salon_id` (vlasnik salona ili radnik zaposlen u tom salonu) — nikad se ne oslanjati samo na rolu bez provjere pripadnosti salonu

Primjer principa (`BookingPolicy`):
- `update()` — dozvoljeno ako je `user.id === booking.salon.owner_id` ILI (`user.role === 'worker'` I `user` je Worker zapis vezan za `booking.salon_id`)
- Admin nikad ne dobija `update` pravo nad terminima — admin upravlja platformom, ne pojedinačnim salonom

**Ovo pravilo se primjenjuje na nivou API-ja (Middleware + Policy), nikad samo kroz frontend rutiranje.** Radnik ne smije moći pozvati API endpoint rezervisan za vlasnika čak i ako direktno pogodi URL/endpoint.

## Radnik — registracija isključivo putem pozivnice

Radnik ne može samostalno kreirati nalog. Vlasnik generiše pozivnicu (link/kod) prilikom dodavanja radnika u `docs/backend.md` flow-u. Implementacija: `WorkerInvitation` tabela/token, radnik završava registraciju kroz taj token, čime se automatski veže na `salon_id` i `worker_id` zapis kojeg je vlasnik unaprijed kreirao.

## Blacklist — tok odlučivanja

1. Sistem prati broj `NO_SHOW` statusa po klijentu po salonu (vidi `docs/database.md` — Booking.status)
2. Kad broj dostigne konfigurabilni prag (default: 3 u zadnjih 90 dana), sistem generiše prijedlog vlasniku — nikad ne blokira automatski
3. Vlasnik (uvijek) ili radnik (samo ako `can_block_clients = true` na njegovom Worker zapisu) može kreirati `BlacklistEntry`
4. Kasna otkazivanja NIKAD ne ulaze u ovaj brojač — samo `no_show` status

## Admin uloga — V1 obim

Admin funkcije (odobravanje salona, moderacija, suspenzija — vidi `docs/specifikacija.md` §4.13) su funkcionalno dio V1, ali BEZ posebnog admin UI-ja. U praksi:
- Admin Policy/Middleware postoji i štiti eventualne admin-only endpointe ako se ipak pravi minimalni API za to
- Realno izvršavanje (odobravanje salona, suspenzija) se u ranoj fazi radi direktno kroz bazu (Tinker/SQL), ne kroz UI
- Ne graditi admin dashboard osim ako se eksplicitno zatraži
