# Design — SrediMe

<!-- applyTo: sredime-frontend/** -->

Ovaj fajl je vizuelni sistem SrediMe platforme — kontekst/brief za dizajn rad (npr. Claude Design) i referenca za frontend implementaciju. Svaka odluka ima obrazloženje ("zašto"), ne samo vrijednost, jer je psihologija boje/fonta/oblika namjerno ugrađena u izbor.

## Brand identitet

**Ton/vibe: mirno + moderno/pametno, wellness/beauty pravac.**

SrediMe je platforma za lične usluge (frizer, kozmetika, nokti, barbershop) — mjesto gdje se korisnik "sredi" i osjeća bolje. Vizuelni identitet nosi tu emociju (mirno, čisto, povjerenje), dok sama interakcija (booking flow, UI brzina) ostaje brza i jasna — mirnoća je u estetici, ne u sporosti interakcije.

**Istraženo naspram konkurencije** (Fresha, Booksy, Treatwell): nijedan veliki igrač ne ide na "spa/mirno" estetski pravac — Fresha i Booksy su neutralno-profesionalni (bijelo + jedan snažan accent), Treatwell je energično-vibrantan. SrediMe-ov "mirno + pametno" pravac je namjerni razmak od sve trojice, ne kopiranje nikoga.

## Color Palette

| Uloga | Boja | Hex | Zašto |
|---|---|---|---|
| Primarna | Deep indigo | `#2E2B72` | Rodno neutralna (bitno — ciljamo i žene i muškarce, hair/nail i barbershop klijentelu), nosi povjerenje i mir bez pretjeranog luksuza (izbjegnuto crno-zlatno) ili generičkog "SaaS" osjećaja (izbjegnuto svjetlije/zasićenije indigo poput #4F46E5) |
| Accent (CTA, highlights) | Topla zlatna | `#E8A855` | Unosi toplinu/energiju nasuprot hladnijoj primarnoj boji — sprječava da brend djeluje isključivo "korporativno hladno" |
| Tekst — primarni | `#0F172A` | Visok kontrast, čitljivost |
| Tekst — sekundarni | `#64748B` | Za opise, metapodatke, manje bitan tekst |
| Pozadina (canvas) | `#F8FAFC` | Blago siva, ne čisto bijela — daje "prostor za disanje", mirniji osjećaj od oštrog #FFFFFF svuda |
| Kartice | `#FFFFFF` | Sjenka `0px 4px 12px rgba(15,23,42,0.05)`, radius `20px` — mekan, moderan, "podignut" osjećaj bez agresivne sjenke |

**Semantic boje:**

| Stanje | Pozadina | Tekst/ikona | Kontekst upotrebe |
|---|---|---|---|
| Success | `#D1FAE5` | `#059669` | "Slobodno danas", potvrđena rezervacija |
| Danger | `#FFE4E6` | `#E11D48` | Otkazano, greška, popust badge |
| Warning | topao amber (npr. `#FEF3C7` / `#D97706`) | | Upozorenja, isticanje pažnje |

## Tipografija

**Plus Jakarta Sans — jedan font za sve, različiti weight-ovi.**

Istraženo: sans-serif fontovi nose percepciju modernosti/pristupačnosti (zato ih wellness/tech/healthcare brendovi dosljedno biraju, naspram serif fontova koji nose tradiciju/autoritet — banke, pravne firme). Plus Jakarta Sans je geometrijski sans-serif sa zaobljenim karakterima — dovoljno mekan za "mirno/wellness", dovoljno čist za "moderno/pametno".

Testirano naspram kombinacije s Inter za body tekst — razlika je bila zanemarljiva na obimu teksta koji SrediMe koristi (kartice, kratki opisi, cijene — ne dugi paragrafi), pa je jedan font jednostavnije i konzistentnije rješenje.

| Upotreba | Weight |
|---|---|
| Naslovi (h1, h2, kartice - imena salona) | 700 (Bold) |
| Podnaslovi, labele, dugmad | 500 (Medium) |
| Body tekst, opisi | 400 (Regular) |

## Spacing / Layout sistem

Standardna Tailwind skala (baza 4px): **4 / 8 / 12 / 16 / 24 / 32px**. Nema potrebe za custom skalom — ovo je već intuitivno korišteno kroz sve dizajn iteracije i radi dobro s "mirno/prostrano" pravcem (velikodušan padding unutar kartica, jasan razmak između sekcija).

## Komponenta biblioteka

**shadcn/ui** kao osnova, s custom komponentama za booking-specifične elemente.

- shadcn/ui za standardne elemente (button, input, modal, checkbox, select, dropdown) — komponente se kopiraju u projekat (nisu "crna kutija" paket), pa se boje/font/radius iz ove palete direktno namapiraju preko Tailwind config-a. Accessibility (keyboard nav, screen reader) je već riješen.
- Custom komponente za ono što shadcn/ui nema i što je specifično za SrediMe UX: 3-Click Booking wizard koraci, kalendar prikaz dostupnosti radnika, salon kartice u discovery listi.
- Moguće je i custom modifikovati bilo koju shadcn/ui komponentu (jer je to kod u projektu, ne tuđa biblioteka) kad zatreba nešto van standardnog ponašanja.

## Ikonografija

**Lucide** — outline stil (tanke linije, bez ispune).

Upoređeno naspram Tabler, Phosphor i Material Symbols. Lucide/Tabler/Heroicons su vizuelno gotovo nerazlučivi (tanka, konzistentna linija koja se uklapa u "mirno/moderno"). Material Symbols je namjerno izbjegnut — nosi prejaku, prepoznatljivu asocijaciju na Google/Android sistem, što bi razvodnilo SrediMe-ov sopstveni brand identitet. Phosphor je razmatran (mekši/zaobljeniji stil), ali Lucide je odabran kao stabilniji, nezavisniji, industrijski standardan izbor.

Boja ikona: primarna `#2E2B72` za neutralne/navigacione ikone, semantic boje (success/danger) za ikone koje nose to značenje (npr. check-circle u zelenoj).

## Referentni ekrani za prvu dizajn iteraciju

Prioritet (booking flow je najkritičniji dio UX-a — vidi `docs/specifikacija.md` §14):

1. **Booking flow** (3-Click Booking wizard) — usluga → radnik → termin → potvrda
2. **Profil salona** (javna, SEO-bitna stranica) — header, ocjena, lista usluga s cijenama, CTA dugme
3. **Vlasnik/Radnik dashboard** — kalendar pregled, upravljanje terminima
4. **Discovery/pretraga stranica** — lista salona, filteri, search

Rani mockup pravac (homepage/discovery koncept) je potvrđen: navbar (logo + prijava dugme), hero sekcija sa search barom, kartice salona (ime, kategorija, ocjena, badge "slobodno danas"/popust, cijene usluga, CTA dugme), footer.

## Napomena

`docs/ux-strategy.md` (onboarding tok, gdje ide social proof, friction reduction, ton komunikacije) je odvojen fajl koji se popunjava kasnije, usput — nije preduslov za početak frontend implementacije s ovim dizajn sistemom.
