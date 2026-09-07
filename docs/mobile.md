# Mobile — SrediMe (React Native + Expo)

<!-- applyTo: sredime-mobile/** -->

**Status: V3+, ne gradi se u V1.** Ovaj fajl postoji kao referenca da Claude Code zna šta dolazi i zašto se određene odluke u backendu/frontendu prave na način koji olakšava ovu fazu — ne kao aktivan razvoj plan za sad.

## Zašto V3+

Iz `docs/specifikacija.md` §11.1: web-only start je namjerna odluka. Mobilna app dolazi kad postoji dokazana korisnička baza koja opravdava trošak održavanja dodatne platforme. Push notifikacije (§4.5) su direktno vezane za postojanje mobilne app-a — do V3 email ostaje jedini kanal.

## Planirani stack (kad dođe vrijeme)

- React Native + Expo
- Isti backend API (`sredime-backend`, `/api/v1/...`) — nema odvojenog mobile-specific API sloja planiranog, isti Sanctum token auth mehanizam (prilagođen mobile token storage-u, npr. Expo SecureStore)

## Component/logika reuse s Next.js frontendom

Next.js komponente se ne mogu direktno koristiti u React Native (različit rendering layer), ali sljedeće se može podijeliti kroz shared paket/biblioteku:

- Tipovi/interfejsi za entitete (User, Salon, Booking, itd.)
- API klijent logika (request wrapperi, error handling pattern) — ako je odvojena od React-specific koda u `lib/api/` na frontendu, prenosiva je
- Validaciona pravila koja ne zavise od DOM-a

Ovo je razlog zašto `docs/frontend.md` traži odvajanje poslovne logike od UI komponenti već u V1 — olakšava ovu fazu kad dođe.

## Šta NE raditi sad

- Ne kreirati `sredime-mobile` repo/projekat dok V1 web nije završen i dok se V3 eksplicitno ne pokrene
- Ne graditi push notification infrastrukturu na backendu prije nego mobile app postoji da je konzumira
