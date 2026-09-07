# Database — SrediMe

<!-- applyTo: sredime-backend/database/**, sredime-backend/app/Models/** -->

MySQL 8, Eloquent ORM. Ovaj dokument je izvor istine za V1 šemu. Ne dodavati tabele/kolone za funkcionalnost koja nije u V1 obimu (vidi `docs/specifikacija.md`) bez eksplicitnog zahtjeva.

## Entiteti (V1)

### User
| Kolona | Tip | Napomena |
|---|---|---|
| id | bigint PK | |
| role | enum(`client`,`owner`,`worker`,`admin`) | |
| name | string | |
| email | string, unique | |
| phone | string, nullable | |
| password | string (hashed, bcrypt) | |
| email_verified_at | timestamp, nullable | |
| created_at, updated_at | timestamp | |

Napomena: jedan `User` s rolom `owner` može posjedovati više `Salon` zapisa (vidi Salon.owner_id). Jedan `User` s rolom `worker` je vezan na `Worker` zapis koji pripada tačno jednom Salonu.

### Salon
| Kolona | Tip | Napomena |
|---|---|---|
| id | bigint PK | |
| owner_id | bigint FK → users.id | **indexed** |
| name | string | |
| description | text | |
| address | string | |
| city | string | **indexed** — koristi se u pretrazi |
| country_code | string(2) | npr. `BA`. Priprema za regionalnu ekspanziju — u V1 uvijek popunjeno |
| category | string/enum | frizerski/kozmetički/nail/barbershop |
| status | enum(`pending`,`active`,`suspended`) | **indexed** — pending dok admin ne verifikuje |
| created_at, updated_at | timestamp | |

Slike salona (do 10) — odvojena tabela `salon_images` (salon_id FK, url, order).

### Worker
| Kolona | Tip | Napomena |
|---|---|---|
| id | bigint PK | |
| salon_id | bigint FK → salons.id | **indexed** |
| user_id | bigint FK → users.id, nullable | radnik može, ali ne mora imati svoj login nalog |
| position | string | |
| bio | text, nullable | |
| photo_url | string, nullable | |
| can_block_clients | boolean, default false | vidi `docs/permissions.md` — po defaultu radnik ne može blokirati klijenta |
| created_at, updated_at | timestamp | |

Radno vrijeme po radniku — odvojena tabela `worker_schedules` (worker_id FK, day_of_week, start_time, end_time) + `worker_time_off` (worker_id FK, start_date, end_date, type: godišnji/bolovanje/odsustvo).

### Service
| Kolona | Tip | Napomena |
|---|---|---|
| id | bigint PK | |
| salon_id | bigint FK → salons.id | **indexed** |
| name | string | |
| price | decimal(10,2) | nikad float |
| currency | string(3) | npr. `BAM`. Priprema za regionalnu ekspanziju |
| duration_minutes | integer | |
| buffer_minutes | integer, default 0 | vrijeme čišćenja/pripreme između termina |
| photo_url | string, nullable | |
| created_at, updated_at | timestamp | |

Veza radnik ↔ usluga (koji radnik radi koju uslugu): `worker_service` pivot tabela.

### Booking (centralni entitet)
| Kolona | Tip | Napomena |
|---|---|---|
| id | bigint PK | |
| client_id | bigint FK → users.id | **indexed** |
| salon_id | bigint FK → salons.id | **indexed** |
| worker_id | bigint FK → workers.id | **indexed** |
| service_id | bigint FK → services.id | |
| scheduled_at | datetime (UTC) | **indexed** — koristi se za real-time filter dostupnosti |
| status | enum(`pending`,`confirmed`,`completed`,`cancelled_by_client`,`cancelled_by_salon`,`no_show`) | **indexed** |
| manually_entered | boolean, default false | za statistiku "ručnog unosa" (V3 metrika, kolona može postojati od V1) |
| created_at, updated_at | timestamp | |

Statusni prelazi i pravila — vidi `docs/specifikacija.md` §3.1 prije bilo kakve izmjene logike statusa.

**Composite index preporučen:** (`salon_id`, `worker_id`, `scheduled_at`) — pokriva najčešći upit (dostupnost radnika u salonu za dati period).

### Review
| Kolona | Tip | Napomena |
|---|---|---|
| id | bigint PK | |
| booking_id | bigint FK → bookings.id, unique | jedan review po bookingu, samo za `completed` status |
| rating | tinyint (1–5) | |
| comment | text, nullable | |
| created_at | timestamp | |

### BlacklistEntry
| Kolona | Tip | Napomena |
|---|---|---|
| id | bigint PK | |
| salon_id | bigint FK → salons.id | **indexed** |
| client_id | bigint FK → users.id | **indexed** |
| reason | text, nullable | |
| created_at | timestamp | |

Vezano isključivo za NO_SHOW logiku — vidi `docs/specifikacija.md` §3.2.

### ClientNote (interni komentar o klijentu)
| Kolona | Tip | Napomena |
|---|---|---|
| id | bigint PK | |
| salon_id | bigint FK → salons.id | **indexed** |
| client_id | bigint FK → users.id | **indexed** |
| author_id | bigint FK → users.id | ko je napisao komentar |
| note | text | |
| created_at, updated_at | timestamp | |

Vidljivo isključivo salonu koji je napisao — nikad drugim salonima niti klijentu. Trajno dok se ručno ne obriše.

### LoyaltyAccount (V3/V4 — struktura može postojati, logika ne)
| Kolona | Tip | Napomena |
|---|---|---|
| id | bigint PK | |
| salon_id | bigint FK → salons.id | |
| client_id | bigint FK → users.id | |
| visit_count | integer, default 0 | |

Napomena: pravila (npr. "svaki 10. termin gratis") definiše salon — logika se implementira tek kad V3/V4 modul bude eksplicitno zatražen. Ne graditi UI ni pravila u V1.

### Notification (log)
| Kolona | Tip | Napomena |
|---|---|---|
| id | bigint PK | |
| user_id | bigint FK → users.id | **indexed** |
| type | string | npr. `booking_confirmed`, `booking_cancelled`, `reminder` |
| channel | enum(`email`) | u V1 samo email; `push`, `sms` dodaju se kao vrijednosti enum-a kad ti kanali budu implementirani (V3+) |
| status | enum(`pending`,`sent`,`failed`) | |
| created_at | timestamp | |

## NE graditi u V1 (namjerno izostavljeno)

- **Payment tabela** — model monetizacije nije odlučen (vidi `docs/specifikacija.md` §6). Kad V3 dođe, dizajnirati gateway-agnostic (podržati Monri i Stripe).
- **Search indeks tabele (Meilisearch)** — standardni MySQL upit + indexi ispod su dovoljni za V1 obim.
- **Bilo koja tabela vezana za kućne usluge** — van opsega dok se ne odluči (pravno pitanje).

## Indexing strategija (obavezno pravilo)

Svaka FK kolona i svaka kolona korištena u `WHERE`/filter/sortiranju MORA imati index. Konkretno u V1:

- `salons`: index na `owner_id`, `city`, `status`
- `workers`: index na `salon_id`
- `services`: index na `salon_id`
- `bookings`: index na `client_id`, `salon_id`, `worker_id`, `scheduled_at`, `status`; composite (`salon_id`, `worker_id`, `scheduled_at`)
- `reviews`: unique index na `booking_id`
- `blacklist_entries`: composite (`salon_id`, `client_id`)
- `client_notes`: composite (`salon_id`, `client_id`)
- `notifications`: index na `user_id`

Nedostatak indexa na filter/sort kolonama je najčešći uzrok sporih upita pri rastu podataka — provjeriti pri svakoj novoj migraciji da li nova kolona treba index.

## N+1 prevencija

Vidi `docs/backend.md` §Eloquent konvencije — pravilo je koristiti `with()`/eager loading za bilo koju relaciju koja se učitava u petlji ili listi (npr. lista salona s njihovim radnicima, lista bookinga s klijentom/radnikom/uslugom).

## Migracije — konvencija

Svaka migracija dodaje samo ono što je u ovom dokumentu ili eksplicitno zatraženo. Prije pisanja nove migracije za funkcionalnost van V1 obima (Payment, Search, kućne usluge), provjeriti `docs/specifikacija.md` da li je ta funkcionalnost stvarno zatražena za implementaciju sad, ili samo spomenuta kao buduća.
