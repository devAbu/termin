# Design — SrediMe

<!-- applyTo: sredime-frontend/** -->

**Status: TBD — popunjava se tokom dizajn faze.** Ovaj fajl je skeleton koji će služiti kao kontekst/brief za dizajn proces (npr. import u Claude Design), po istom principu kao logo/brand brief kod KlubDeska.

Dok se ne popuni, `docs/frontend.md` traži neutralan, čist UI (Tailwind CSS osnova) bez finalnih brand odluka — ne graditi UI koji bi trebao redizajn nakon što ovaj dokument bude popunjen.

## Brand identitet

- Naziv: SrediMe (potvrđeno, vidi `docs/specifikacija.md`)
- Ton/vibe: TBD
- Logo: TBD

## Color Palette

TBD — primarna, sekundarna, accent, neutral/gray skala, semantic boje (success/error/warning).

## Tipografija

TBD — font familija (heading/body), skala veličina, weight-ovi.

## Spacing / Layout sistem

TBD — grid, spacing skala (najvjerovatnije Tailwind default 4px baza dok se ne odluči drugačije).

## Komponenta biblioteka

TBD — odluka između: custom komponente na čistom Tailwindu, shadcn/ui, ili druga biblioteka. Napomena: KlubDesk trenutno ne koristi gotovu biblioteku (vidi klubdesk beleške) — vrijedi razmotriti konzistentnost između projekata kad se ova odluka donese.

## Ikonografija

TBD.

## Referentni ekrani za prvu dizajn iteraciju

Kad dizajn faza počne, prioritet (po `docs/specifikacija.md` §14 — booking flow je najkritičniji dio UX-a):
1. Booking flow (3-Click Booking wizard)
2. Profil salona (javna, SEO-bitna stranica)
3. Vlasnik/Radnik dashboard (kalendar pregled)
4. Discovery/pretraga stranica

## Napomena

Ovaj fajl se ažurira postepeno kako se dizajn odluke donose — nije potrebno sve popuniti odjednom prije nego se krene u development tehničke strukture (backend/frontend fajlovi ne zavise od ovog fajla).
