# Specifikacija — SrediMe

<!-- applyTo: ** -->

Ovo je izvor istine za funkcionalni obim, poslovna pravila i prioritete SrediMe platforme. Sadržaj je izveden iz produktne specifikacije v1.0 i naknadnih odluka.

## 1. Vizija

Platforma koja zamjenjuje telefon i svesku vlasnika salona: automatsko, 24/7 zakazivanje termina, s podacima koji se pretvaraju u veći prihod (manje no-showova, popunjeniji termini, vjerniji klijenti).

**Problem koji rješavamo:**
- Vlasnik/radnik gubi vrijeme na telefonske pozive
- Klijent nema uvid u realnu dostupnost i mora "pogađati"
- Nema digitalnog traga o klijentu, historiji, preferencama

**Model:** Two-sided marketplace (klijenti ↔ saloni). Cold start problem (platforma bez salona je beskorisna klijentima i obrnuto) rješava se ručnim onboardingom prvih 15–30 salona u jednom gradu prije javne registracije klijenata — ovo je go-to-market pitanje, ne blokira tehnički razvoj.

**Ciljna grupa V1:** mali/srednji saloni (1–10 radnika/stolica), BiH region. NE fransize/lanci (to je V5+ Enterprise).

## 2. Uloge (personas)

### 2.1 Klijent
Traži i zakazuje uslugu. Cilj: naći slobodan termin brzo, bez poziva.

### 2.2 Vlasnik salona
Vlasnik jednog salona (V1) ili više salona (kardinalitet podržan od V1, UI za upravljanje s više dolazi u V2). Cilj: popuniti kalendar, smanjiti no-show, imati uvid u zaradu bez ručne evidencije.

### 2.3 Radnik
Zaposlenik salona s vlastitim kalendarom. **Ima ista prava izmjene termina kao vlasnik** (potvrda/otkazivanje/pomjeranje, bez ograničenja) — razlika između uloga postoji samo na administrativnom nivou (upravljanje salonom, radnicima, cijenama). Nalog se otvara isključivo putem pozivnice vlasnika — radnik ne može samostalno registrovati nalog.

### 2.4 Administrator platforme
Interni tim koji upravlja mrežom salona (ne pojedinačnim salonom): odobrava nove salone, moderira recenzije/prijave, prati zdravlje platforme. U ranoj fazi (mali broj salona) većina ovih operacija se obavlja direktno kroz bazu, bez posebnog UI-ja (vidi 5.4 Admin Panel).

## 3. Poslovna pravila i statusni model

### 3.1 Statusi rezervacije (Booking)

| Status | Ko postavlja | Opis |
|---|---|---|
| `PENDING` | Sistem (automatski pri kreiranju) | Klijent zatražio termin; čeka potvrdu salona (ako salon koristi režim potvrde) ili odmah postaje `CONFIRMED` (auto-potvrda) |
| `CONFIRMED` | Vlasnik / Radnik / Sistem (auto) | Termin potvrđen, blokira slot u kalendaru |
| `COMPLETED` | Sistem (automatski nakon vremena termina) ili ručno | Usluga obavljena. Okida podsjetnik za recenziju |
| `CANCELLED_BY_CLIENT` | Klijent | Otkazivanje je UVIJEK besplatno, bez penala, bez obzira kada se desi |
| `CANCELLED_BY_SALON` | Vlasnik / Radnik | Salon otkazao. Obavezno automatsko obavještenje klijentu + prijedlog novog termina |
| `NO_SHOW` | Vlasnik / Radnik (ručno označava) | Klijent se nije pojavio. Jedini status koji utiče na blacklist prijedlog |

**PRAVILO — otkazivanje:** Uvijek besplatno, bez ikakvog penala, bez obzira koliko kasno se desi. Rok obavještavanja je dinamički konfigurabilan po salonu (svaki salon postavlja svoju preporučenu granicu), ali to je isključivo informativna/UX poruka — nikad se ne pretvara u penal, naknadu ili automatski upis u blacklist.

**PRAVILO — izmjena termina bez ograničenja:** I radnik i vlasnik mogu slobodno, bez ikakvog limita, potvrđivati, otkazivati i pomjerati termine. Nema limita broja izmjena mjesečno.

**Buduće pravilo (V3, kad se uvede depozit):** Kad online plaćanje/depozit bude uveden, salon će moći konfigurisati da kasno otkazivanje i/ili NO_SHOW rezultira gubitkom dijela/cijelog depozita. Do tada ovo pravilo NE postoji — ne implementirati preventivno.

### 3.2 Blacklist

Vezan isključivo za `NO_SHOW`. Kasna otkazivanja se NE bilježe i ne utiču na blacklist. Vlasnik može ručno blokirati klijenta u bilo kom trenutku (jednim klikom). Sistem dodatno *predlaže* blokiranje (nikad ne blokira automatski) nakon što klijent dostigne konfigurabilni prag NO_SHOW-ova (podrazumijevano: 3 u zadnjih 90 dana — broj ostaje podesiv po salonu).

Radnik po defaultu NE može blokirati klijenta — samo šalje prijedlog vlasniku. Vlasnik može po pojedinačnom radniku uključiti opciju da radnik direktno blokira.

### 3.3 Model dozvola (permissions)

Vidi `docs/permissions.md` za punu tabelu i implementacione detalje.

### 3.4 Verifikacija salona

Novi salon prolazi kroz ručnu verifikaciju administratora platforme prije nego postane vidljiv klijentima. U ranoj fazi ovo se radi direktno kroz bazu, bez posebnog admin UI-ja.

### 3.5 Interni komentar o klijentu

Vlasnik/radnik može dodati interni komentar o klijentu (npr. historija ponašanja). Vidi ga isključivo taj salon — nije dijeljen s drugim salonima na platformi niti vidljiv klijentu. Ostaje trajno vidljiv dok ga neko ručno ne obriše (nema automatskog isteka).

## 4. Funkcionalni obim po modulima i verzijama

Legenda: **MVP** (=V1) **V2** **V3** **V4** **V5+**

### 4.1 Auth & Korisnici — MVP
- Registracija/prijava (email/mobitel + lozinka)
- Tri tipa naloga: klijent, vlasnik, radnik
- Reset lozinke
- Onboarding wizard po ulozi (klijent, vlasnik, radnik)
- Social login (Google/Apple)
- Radnik se registruje isključivo putem pozivnice vlasnika

### 4.2 Saloni (kreiranje i profil) — MVP
- Kreiranje salona (naziv, opis, adresa, grad, kategorija)
- Upload do 10 slika
- Dodavanje radnika (ime, slika, pozicija, bio)
- Dodavanje usluga (naziv, cijena, trajanje, slika)
- Trajanje usluge + buffer vrijeme između termina
- Radno vrijeme po danima (ponavljajuće)
- Radno vrijeme/pauze po radniku (godišnji, bolovanje, odsustvo)
- Cjenovnik i galerija kao samostalna, dijeljiva stranica
- V2: Preview salona ("Ovako te klijenti vide"), više salona pod jednim vlasnikom (UI)

### 4.3 Booking Engine (jezgro) — MVP
- Globalni real-time filter po datumu/satu
- 3-Click Booking: usluga → radnik → termin → potvrda
- Statusi rezervacije (vidi 3.1)
- Zabrana duplih termina istog klijenta u isto vrijeme
- Otkazivanje (vidi 3.1)
- Ručno dodavanje/izmjena termina od strane vlasnika/radnika (telefonska narudžba)
- Blokiranje vremena u kalendaru (pauza, slobodan dan, godišnji)
- Deep linking iz emaila direktno u aplikaciju/rezervaciju
- Zakaži ponovo (One-Tap Rebook)
- V3: Waiting lista. V4: Last-Minute Panic Button, Quick Match. V5+: S.O.S. hitan termin

### 4.4 Klijent profil — MVP
- Nadolazeće i prošle rezervacije, otkazivanje iz profila
- Uređivanje ličnih podataka, promjena lozinke
- V2: Omiljeni saloni. V3: Export u Google/Apple Calendar

### 4.5 Notifikacije — MVP (email only)
- Email: potvrda rezervacije (klijent, vlasnik, radnik)
- Email: podsjetnik prije termina
- Email: obavještenje pri otkazivanju
- Email: obavještenje pri promjeni termina od salona
- V2: Email poziv na recenziju (30 min nakon termina, automatski)
- V3: Push notifikacije, SMS (Infobip), obavijest o kašnjenju — sve vezano za postojanje mobilne app (V3+)
- V5+: In-app chat

**Napomena:** Push notifikacije zahtijevaju mobilnu app ili web push — dolaze tek kad mobilna app bude dostupna. Do tada email je jedini kanal.

### 4.6 Vlasnik/Radnik Dashboard — MVP
- Pregled nadolazećih rezervacija
- Označavanje NO_SHOW
- CRUD radnici, usluge, radno vrijeme
- Potvrda/otkazivanje/promjena termina (bez ograničenja)
- Statistika (ne)potvrđenih termina od radnika
- Upravljanje radnicima (koji radnik radi koju uslugu)
- Historija klijenata s internim komentarom (vidi 3.5)
- V3: Statistika ručnog unosa termina (indikator da klijenti ne koriste app dovoljno)

### 4.7 Pretraga i Discovery — MVP
- Pretraga po gradu i kategoriji/usluzi
- Filter "Slobodno danas"/"Slobodno sada"
- Filter po ocjeni, cijeni, dostupnosti
- Pretraga po nazivu usluge
- V2: Lokacijska pretraga "blizu mene" (GPS), mapa (Google Maps)
- V3: Meilisearch integracija — **ne graditi u V1**, standardni SQL upit je dovoljan dok baza salona nije velika

### 4.8 Portfolio radnika — V2
Galerija radova po radniku, vidljiva klijentu prije rezervacije.

### 4.9 Recenzije — MVP
- Verified review: recenzija dostupna samo za `COMPLETED` termine
- Ocjena 1–5 + komentar
- Prikaz na profilu salona
- V2: Automatski email poziv na recenziju
- **Uklonjeno iz obima:** Javni odgovor vlasnika na recenziju — neće se implementirati

### 4.10 Loyalty program — V3/V4
Salon konfiguriše i finansira (npr. svaki 10. termin gratis), platforma samo prati brojače — platforma NE subvencionira nagrade (nema riješen revenue model za to). **Ne graditi u V1.**

### 4.11 Online plaćanje — V3+ (ne graditi u V1)
- V3: Depozit pri rezervaciji (20–30%, konfigurabilno po salonu), automatski refund pri otkazivanju na vrijeme, Monri gateway
- V4: Stripe (za EU firme), digitalni poklon bonovi
- V5+: Subscription model
- V1: puni iznos plativ na licu mjesta (jedina opcija)

**Napomena za buduću implementaciju:** Kad se ovaj modul bude gradio, dizajnirati gateway-agnostic (podržati i Monri i Stripe od početka te implementacije), ne hardkodirati na jedan provider.

### 4.12 Statistike i izvještaji (vlasnik) — MVP
- Analitika prihoda i popularnosti termina
- Prihod po danu/sedmici/mjesecu
- Najpopularnije usluge i radnici
- Stopa otkazivanja i no-showova
- Izvještaji po radniku (produktivnost, prihod)
- V3: Novi vs. povratni klijenti. V4: Export PDF/Excel

### 4.13 Admin Panel (interni tim) — MVP funkcionalno, BEZ posebnog UI-ja
- Pregled i odobravanje novih salona
- Moderacija recenzija
- Suspenzija salona
- Obrada prijava/žalbi klijenata na salon
- Osnovne statistike platforme

**Sve navedeno je funkcionalno potrebno od V1, ali se u ranoj fazi radi direktno kroz bazu (SQL/Tinker) — ne graditi admin UI dok obim (broj salona/prijava) to ne opravda.**

### 4.14 Multi-lokacijski saloni — V2 (kardinalitet pripremljen od V1)
- V2: Jedan vlasnik, više lokacija, svaka sa svojim radnicima i radnim vremenom
- V5+ (Enterprise): Fransize/lanci (10+ lokacija), centralizovano upravljanje

**Napomena:** `Salon.owner_id` → `User` kardinalitet (1:N) postoji od V1 (vidi `docs/architecture.md`), ali UI/logika za upravljanje s više salona istovremeno se NE gradi u V1.

### 4.15 B2B i integracije — V5+
API za saloni sa vlastitim softverom, webhooks, white-label. Ne razmatrati u V1.

### 4.16 AI funkcionalnosti — MVP (osnovna verzija), V5+ (napredno)
- MVP: Jednostavan podsjetnik "Prošlo je X dana od zadnje posjete" baziran na jednoj prethodnoj rezervaciji, BEZ prave prediktivne logike (nema dovoljno istorijskih podataka u V1 da bi prava predikcija imala smisla)
- V5+: Smart Pricing, pametne preporuke, predviđanje no-showova, chatbot

### 4.17 Dodatne funkcionalnosti
- V2: Promocije/popusti definisani od salona
- V4: Paketi usluga (npr. manikir+pedikir), happy hours
- V5+: Lost & Found, referral program

## 5. Nefunkcionalni zahtjevi

- **Performanse:** pretraga slobodnih termina mora vraćati rezultate pod 1 sekundom za standardnu pretragu grad+kategorija
- **Skalabilnost:** arhitektura mora podržati rast s jednog grada na više gradova/regija bez redizajna — multi-tenant od početka
- **Sigurnost:** lozinke isključivo hashovane (bcrypt/argon2); podaci o plaćanju (V3+) nikad direktno čuvani, koristiti tokenizaciju gateway-a; role-based pristup na nivou API-ja
- **GDPR/privatnost:** interni komentari o klijentima vidljivi samo osoblju salona; Privacy Policy i Terms of Service obavezni prije javnog lansiranja; pravo na brisanje naloga ("right to be forgotten")
- **Vrijeme:** sva vremena u bazi kao UTC; konverzija na prikaz mora biti konzistentna (pažnja na ljetno/zimsko vrijeme)
- **Lokalizacija:** UI tekstovi translation-ready od početka (trenutno samo BS), i18n arhitektura za punu višejezičnost dolazi u V5+

## 6. Otvorena pitanja koja NE blokiraju V1 development

- Model monetizacije (provizija vs. pretplata) — trenutno: B2B pretplata putem ugovora/fakture, van aplikacije
- Cold start strategija (pilot grad, ručni onboarding 15–30 salona) — go-to-market pitanje, ne tehničko
- Da li kućne usluge ulaze u proizvod (mijenja data model — adresa klijenta, radijus) — van opsega dok se ne odluči
- Konkretan diferencijator naspram Booksy/Fresha/Treatwell — go-to-market pitanje

Ova pitanja se rješavaju odvojeno od development procesa i ne zahtijevaju tehničku pripremu u V1 kodu.
