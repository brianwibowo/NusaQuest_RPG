# NusaQuest RPG — Implementation Plan

> **Dokumen ini adalah panduan lengkap untuk membangun aplikasi web NusaQuest RPG.**
> Ditulis agar dapat dipahami oleh developer manapun atau model AI lain tanpa konteks tambahan.

---

## 1. Konteks Proyek

### 1.1 Apa itu NusaQuest RPG?

NusaQuest RPG adalah **aplikasi wisata digital berbasis Role-Playing Game (RPG)** di mana wisatawan tidak hanya berkunjung ke destinasi wisata, tetapi juga berperan sebagai karakter dalam sebuah dunia permainan yang dibangun berdasarkan keunikan lokal suatu daerah.

Pemetaan konsep utama:
- **Kota/destinasi wisata** → Dunia permainan / game world
- **Tempat wisata** → Arena misi / quest area
- **Wisatawan** → Pemain / player
- **Budaya lokal** → Storyline utama
- **Sejarah lokal** → Lore atau narasi permainan
- **UMKM** → Merchant / NPC / quest partner
- **Kuliner** → Item / reward / culinary quest
- **Aktivitas wisata** → Mission / quest
- **Kunjungan lokasi** → Checkpoint
- **Pemerintah/pengelola** → Game master / dashboard admin

### 1.2 Storyline Utama

Pemain adalah seorang **Penjelajah Nusantara** yang mendapatkan misi untuk menghidupkan kembali **"Peta Warisan Lokal"**. Peta tersebut berisi cerita, budaya, kuliner, sejarah, dan kearifan lokal yang mulai terlupakan. Untuk membuka setiap bagian peta, pemain harus:
1. Mengunjungi destinasi wisata
2. Menyelesaikan quest
3. Berinteraksi dengan UMKM
4. Menjaga lingkungan
5. Menjawab kuis budaya
6. Menemukan artefak digital yang tersembunyi di berbagai lokasi

### 1.3 Cakupan Pengerjaan Saat Ini

Proyek ini memiliki roadmap 5 tahun. **Saat ini kita mengerjakan Tahun 1** — yaitu prototype visual dan fungsional yang mendemonstrasikan semua mekanisme game, **dengan struktur kode yang siap dilanjutkan ke Tahun 2 (MVP fungsional dengan backend Supabase)**.

Yang akan dibangun sekarang:
- ✅ Seluruh halaman dan navigasi aplikasi
- ✅ Seluruh mekanisme game berjalan dengan data lokal (mock data)
- ✅ Sistem karakter, quest, level, reward, battle/challenge, storyline
- ✅ Peta interaktif dengan Leaflet + OpenStreetMap
- ✅ Bilingual (Indonesia + English)
- ✅ Responsif mobile-first
- ⏳ Belum terhubung ke backend/database (disiapkan strukturnya untuk Supabase di Tahun 2)
- ⏳ Belum ada autentikasi sungguhan (simulasi login dengan data lokal)

### 1.4 Destinasi Awal

Konten quest, lokasi wisata, UMKM, dan storyline akan menggunakan **Jakarta** sebagai destinasi awal. Konten meliputi:
- Wisata budaya Betawi (Setu Babakan, Museum Fatahillah, Kota Tua)
- Kuliner khas Jakarta (kerak telor, soto Betawi, bir pletok)
- UMKM lokal Jakarta
- Sejarah kota (VOC, Batavia, kemerdekaan)
- Ekowisata (Taman Suropati, Ragunan, Mangrove PIK)

---

## 2. Keputusan Teknis yang Sudah Dikonfirmasi

| Keputusan | Pilihan | Alasan |
|:---|:---|:---|
| Platform | Responsive Web App (mobile-first) | Budget kecil, mudah diakses tanpa install |
| Framework | React + TypeScript + Vite | SPA ringan, build statis, hemat RAM VPS |
| Komponen UI | shadcn/ui (copy ke project) | Konsistensi desain terjaga, fully customizable |
| Styling | Vanilla CSS (via shadcn/ui CSS variables) | Ringan, tanpa dependensi tambahan |
| Font | Poppins (Google Fonts) | Modern, clean, mudah dibaca di layar kecil |
| Tema Visual | Light theme, clean & modern | Sesuai permintaan user |
| Peta | Leaflet + OpenStreetMap | Gratis, tanpa API key |
| Bahasa | Bilingual (Indonesia + English, bisa toggle) | Sesuai permintaan user |
| Backend (saat ini) | Data lokal / mock data (JSON + React state) | Tahun 1 belum butuh backend |
| Backend (masa depan) | Supabase | Struktur disiapkan agar mudah integrasi |
| Hosting awal | Vercel (gratis) | Deploy instan untuk staging/demo |
| Hosting produksi | VPS + Docker | User sudah punya VPS |

---

## 3. Tech Stack Lengkap

```
react@19           — UI library
react-dom@19       — React DOM renderer
react-router-dom@7 — Client-side routing (SPA)
typescript@5       — Type safety
vite@7             — Build tool & dev server

shadcn/ui          — Komponen UI (Button, Card, Dialog, Sheet, Tabs, dll.)
tailwindcss@4      — Utility CSS (diperlukan oleh shadcn/ui)
lucide-react       — Ikon (dipakai shadcn/ui)
class-variance-authority — Variant styling (dipakai shadcn/ui)
clsx + tailwind-merge — Class utility (dipakai shadcn/ui)

react-leaflet      — Wrapper React untuk Leaflet map
leaflet            — Library peta interaktif

i18next            — Framework internasionalisasi
react-i18next      — Binding React untuk i18next
```

> [!NOTE]
> shadcn/ui membutuhkan Tailwind CSS sebagai dependensinya. Jadi kita akan menggunakan **Tailwind CSS** (bukan Vanilla CSS murni) karena ini adalah kebutuhan teknis dari shadcn/ui. Tailwind hanya digunakan sebagai engine di balik shadcn/ui, bukan sebagai utility class utama yang ditulis manual di mana-mana.

---

## 4. Struktur Direktori Proyek

```
NusaQuest_RPG/
├── index.html                    # Entry HTML, meta tags, Google Fonts
├── vite.config.ts                # Konfigurasi Vite
├── tsconfig.json                 # Konfigurasi TypeScript
├── tailwind.config.ts            # Konfigurasi Tailwind (tema NusaQuest)
├── package.json
├── Dockerfile                    # Multi-stage build untuk VPS
├── docker-compose.yml            # Orkestrasi Docker
├── .env.example                  # Template environment variables
│
├── public/
│   ├── favicon.ico
│   ├── manifest.json             # PWA manifest (disiapkan)
│   └── images/                   # Aset gambar statis (ikon karakter, dll.)
│
├── src/
│   ├── main.tsx                  # Entry point React
│   ├── App.tsx                   # Router utama + layout
│   ├── index.css                 # Global styles + Tailwind imports
│   │
│   ├── components/               # Komponen UI reusable
│   │   ├── ui/                   # Komponen shadcn/ui (Button, Card, dll.)
│   │   ├── layout/
│   │   │   ├── AppShell.tsx      # Layout utama (header + content + bottom nav)
│   │   │   ├── BottomNav.tsx     # Navigasi bawah mobile ala game
│   │   │   └── Header.tsx        # Header atas (logo, level, notifikasi)
│   │   ├── game/
│   │   │   ├── CharacterCard.tsx  # Panel status karakter (avatar, XP bar, level)
│   │   │   ├── QuestCard.tsx      # Card misi (judul, tipe, progress, reward)
│   │   │   ├── QuestDetail.tsx    # Detail misi lengkap + challenge/battle
│   │   │   ├── BadgeDisplay.tsx   # Tampilan badge yang diperoleh
│   │   │   ├── XpBar.tsx          # Progress bar XP (animasi)
│   │   │   ├── LevelIndicator.tsx # Indikator level circular
│   │   │   ├── RewardCard.tsx     # Card reward (voucher, badge, collectible)
│   │   │   ├── StoryCard.tsx      # Card cerita lokal yang bisa dibuka
│   │   │   ├── BattleQuiz.tsx     # Komponen kuis interaktif (Knowledge Battle)
│   │   │   ├── LeaderboardRow.tsx # Baris leaderboard
│   │   │   └── UmkmCard.tsx       # Card UMKM (nama, produk, lokasi, rating)
│   │   └── common/
│   │       ├── LanguageToggle.tsx # Toggle bahasa ID/EN
│   │       └── StatBadge.tsx      # Badge kecil untuk menampilkan angka (poin, gold)
│   │
│   ├── pages/                    # Halaman-halaman utama
│   │   ├── HomePage.tsx           # Home — ringkasan karakter, misi aktif, statistik
│   │   ├── ExploreMapPage.tsx     # Explore Map — peta Leaflet + marker quest/UMKM
│   │   ├── QuestsPage.tsx         # Quest — daftar quest per kategori (tab)
│   │   ├── QuestDetailPage.tsx    # Detail quest + challenge/battle interaktif
│   │   ├── CharacterPage.tsx      # Character — profil karakter, skill, badge, level
│   │   ├── CharacterSelectPage.tsx # Pemilihan karakter di awal (onboarding)
│   │   ├── RewardsPage.tsx        # Reward — toko poin, voucher, collectibles
│   │   ├── StoryPage.tsx          # Story — kumpulan cerita lokal yang sudah terbuka
│   │   ├── StoryDetailPage.tsx    # Detail satu cerita lokal
│   │   ├── UmkmPage.tsx           # UMKM — daftar merchant partner
│   │   ├── UmkmDetailPage.tsx     # Detail satu UMKM
│   │   ├── LeaderboardPage.tsx    # Leaderboard — peringkat pemain
│   │   ├── ProfilePage.tsx        # Profile — data pengguna, riwayat, sertifikat
│   │   └── OnboardingPage.tsx     # Halaman onboarding awal (pilih destinasi + karakter)
│   │
│   ├── data/                     # Mock data lokal (JSON-like)
│   │   ├── characters.ts         # Data 7 karakter RPG
│   │   ├── quests.ts             # Data quest Jakarta (main, side, cultural, dll.)
│   │   ├── locations.ts          # Data lokasi wisata Jakarta (lat/lng, deskripsi)
│   │   ├── stories.ts            # Data cerita budaya/sejarah Jakarta
│   │   ├── rewards.ts            # Data reward (badge, voucher, collectible)
│   │   ├── umkm.ts               # Data UMKM Jakarta
│   │   ├── battles.ts            # Data kuis/challenge untuk battle system
│   │   ├── levels.ts             # Data level system (syarat, nama, reward)
│   │   └── leaderboard.ts        # Data leaderboard dummy
│   │
│   ├── types/                    # TypeScript type definitions
│   │   ├── character.ts
│   │   ├── quest.ts
│   │   ├── location.ts
│   │   ├── story.ts
│   │   ├── reward.ts
│   │   ├── umkm.ts
│   │   ├── battle.ts
│   │   ├── level.ts
│   │   ├── player.ts             # State pemain (karakter dipilih, XP, poin, dll.)
│   │   └── index.ts              # Re-export semua types
│   │
│   ├── context/                  # React Context untuk game state
│   │   ├── PlayerContext.tsx      # State pemain (karakter, XP, poin, level, quest aktif)
│   │   └── LanguageContext.tsx    # State bahasa (id/en) — atau langsung pakai i18next
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── usePlayer.ts          # Hook untuk akses & update state pemain
│   │   ├── useQuests.ts          # Hook untuk filter & manage quest
│   │   └── useGeolocation.ts     # Hook untuk akses GPS browser (disiapkan)
│   │
│   ├── i18n/                     # Internasionalisasi
│   │   ├── index.ts              # Konfigurasi i18next
│   │   ├── id.json               # Terjemahan Bahasa Indonesia
│   │   └── en.json               # Terjemahan English
│   │
│   ├── lib/                      # Utility functions
│   │   ├── utils.ts              # Utility umum (cn helper dari shadcn/ui)
│   │   ├── xp.ts                 # Kalkulasi XP, level up, syarat level
│   │   └── quest.ts              # Logic quest (cek completion, filter by type)
│   │
│   └── assets/                   # Aset yang di-bundle Vite
│       └── (gambar karakter, ikon quest — akan diisi tim desain)
│
├── nusaquest_01_overview_dan_roadmap.md         # Dokumen sumber
├── nusaquest_02_mekanisme_game.md               # Dokumen sumber
└── nusaquest_03_teori_metodologi_bisnis.md      # Dokumen sumber
```

---

## 5. Data Models (TypeScript Types)

Berikut adalah semua entitas game yang harus direpresentasikan dalam kode. Setiap type dirancang agar kompatibel dengan skema database Supabase di masa depan.

### 5.1 Karakter Pemain (Character)

Ada 7 karakter yang dapat dipilih wisatawan. Masing-masing memiliki peran, kekuatan khusus, dan jenis quest yang cocok.

```typescript
// src/types/character.ts

type CharacterRole =
  | "explorer"
  | "cultural_guardian"
  | "culinary_hunter"
  | "eco_warrior"
  | "heritage_seeker"
  | "local_hero"
  | "treasure_seeker";

interface Character {
  id: CharacterRole;
  name: {
    id: string; // Bahasa Indonesia
    en: string; // English
  };
  role: {
    id: string;
    en: string;
  };
  specialPower: {
    id: string;
    en: string;
  };
  suitableQuestTypes: QuestType[];  // Jenis quest yang cocok
  avatarUrl: string;                // Path ke gambar avatar
}
```

Data 7 karakter sesuai dokumen:

| ID | Nama | Peran | Kekuatan Khusus | Quest Cocok |
|:---|:---|:---|:---|:---|
| `explorer` | Explorer | Penjelajah destinasi | Membuka peta lokasi lebih cepat | Location quest, hidden spot quest |
| `cultural_guardian` | Cultural Guardian | Penjaga budaya | Bonus XP dari misi budaya | Cultural quest, heritage quest |
| `culinary_hunter` | Culinary Hunter | Pemburu kuliner | Reward khusus dari UMKM kuliner | Culinary quest, UMKM quest |
| `eco_warrior` | Eco Warrior | Pejuang lingkungan | Poin tambahan dari misi ramah lingkungan | Eco quest, sustainability quest |
| `heritage_seeker` | Heritage Seeker | Pencari sejarah | Membuka narasi sejarah tersembunyi | Historical quest, puzzle quest |
| `local_hero` | Local Hero | Sahabat masyarakat lokal | Reward dari interaksi sosial | Social quest, community quest |
| `treasure_seeker` | Treasure Seeker | Pemburu harta digital | Item digital dari AR treasure hunt | AR quest, scan quest |

### 5.2 Quest (Misi)

```typescript
// src/types/quest.ts

type QuestType =
  | "main"
  | "side"
  | "cultural"
  | "historical"
  | "culinary"
  | "umkm"
  | "eco"
  | "photo"
  | "ar_treasure"
  | "social"
  | "educational"
  | "daily"
  | "seasonal";

type QuestStatus = "locked" | "available" | "in_progress" | "completed";

interface QuestReward {
  xp: number;
  points: number;
  badgeId?: string;       // ID badge yang diperoleh (opsional)
  voucherId?: string;     // ID voucher UMKM (opsional)
  collectibleId?: string; // ID digital collectible (opsional)
  storyUnlockId?: string; // ID cerita yang terbuka (opsional)
}

interface Quest {
  id: string;
  title: { id: string; en: string };
  description: { id: string; en: string };
  type: QuestType;
  status: QuestStatus;
  locationId: string;         // Lokasi quest di peta
  objectives: QuestObjective[];
  reward: QuestReward;
  requiredLevel: number;      // Level minimum untuk membuka quest
  estimatedDuration: string;  // Estimasi waktu (e.g., "30 menit")
  difficulty: "easy" | "medium" | "hard";
  battleId?: string;          // ID battle/challenge (jika ada)
  relatedUmkmId?: string;     // ID UMKM terkait (jika ada)
}

interface QuestObjective {
  id: string;
  description: { id: string; en: string };
  type: "visit_location" | "scan_qr" | "answer_quiz" | "take_photo"
      | "buy_product" | "write_review" | "eco_action" | "social_interact";
  completed: boolean;
}
```

### 5.3 Lokasi Wisata

```typescript
// src/types/location.ts

interface Location {
  id: string;
  name: { id: string; en: string };
  description: { id: string; en: string };
  category: "wisata_budaya" | "wisata_kuliner" | "wisata_sejarah"
          | "ekowisata" | "umkm" | "hidden_spot";
  latitude: number;
  longitude: number;
  imageUrl: string;
  questIds: string[];     // Quest yang tersedia di lokasi ini
  umkmIds: string[];      // UMKM yang ada di/dekat lokasi ini
}
```

### 5.4 Sistem Level

```typescript
// src/types/level.ts

interface LevelDefinition {
  level: number;           // 1-6
  name: { id: string; en: string };
  requiredXp: number;      // Total XP kumulatif untuk mencapai level ini
  description: { id: string; en: string }; // Syarat umum
  rewardDescription: { id: string; en: string };
}
```

Data level sesuai dokumen:

| Level | Nama | Syarat XP (kumulatif) | Reward |
|:---|:---|:---|:---|
| 1 | New Traveler | 0 | Badge awal |
| 2 | Local Explorer | 500 | Poin tambahan |
| 3 | Cultural Adventurer | 1500 | Unlock story |
| 4 | Heritage Guardian | 3500 | Voucher UMKM |
| 5 | Tourism Champion | 7000 | Sertifikat digital |
| 6 | Nusantara Legend | 12000 | Premium badge + special reward |

### 5.5 Sistem Reward

```typescript
// src/types/reward.ts

type RewardType =
  | "badge"
  | "voucher_umkm"
  | "ticket_discount"
  | "digital_collectible"
  | "certificate"
  | "story_unlock"
  | "eco_reward";

interface Reward {
  id: string;
  name: { id: string; en: string };
  description: { id: string; en: string };
  type: RewardType;
  imageUrl: string;
  pointCost?: number;     // Jika reward bisa ditukar dengan poin
  obtained: boolean;      // Apakah pemain sudah mendapatkannya
}
```

### 5.6 Battle / Challenge System

```typescript
// src/types/battle.ts

type BattleType =
  | "knowledge"   // Kuis budaya, sejarah, lingkungan
  | "eco"         // Tantangan ramah lingkungan
  | "culinary"    // Kuis tentang kuliner lokal
  | "heritage"    // Teka-teki sejarah
  | "umkm"        // Misi bantu UMKM
  | "puzzle"      // Menyusun petunjuk dari beberapa lokasi
  | "social";     // Interaksi dengan masyarakat lokal

interface BattleQuestion {
  id: string;
  question: { id: string; en: string };
  options: { id: string; en: string }[];  // 4 pilihan jawaban
  correctIndex: number;                    // Index jawaban benar (0-3)
  explanation: { id: string; en: string }; // Penjelasan setelah menjawab
}

interface Battle {
  id: string;
  title: { id: string; en: string };
  type: BattleType;
  description: { id: string; en: string };
  questions: BattleQuestion[];   // Untuk type knowledge/culinary/heritage
  timeLimit?: number;            // Batas waktu dalam detik (opsional)
  rewardXp: number;
  rewardPoints: number;
  passingScore: number;          // Jumlah jawaban benar minimum untuk lulus
}
```

### 5.7 Cerita Lokal (Story)

```typescript
// src/types/story.ts

interface Story {
  id: string;
  title: { id: string; en: string };
  content: { id: string; en: string };   // Narasi lengkap
  category: "budaya" | "sejarah" | "legenda" | "kuliner" | "lingkungan";
  imageUrl: string;
  locationId: string;          // Lokasi terkait
  unlocked: boolean;           // Apakah sudah dibuka oleh pemain
  unlockedByQuestId: string;   // Quest yang membuka cerita ini
}
```

### 5.8 UMKM

```typescript
// src/types/umkm.ts

interface Umkm {
  id: string;
  name: string;                // Nama UMKM tidak perlu diterjemahkan
  description: { id: string; en: string };
  category: "kuliner" | "suvenir" | "kerajinan" | "fashion" | "jasa";
  products: string[];          // Daftar produk utama
  locationId: string;          // Lokasi UMKM di peta
  imageUrl: string;
  rating: number;              // 1-5
  voucherAvailable: boolean;   // Apakah ada voucher aktif
  questIds: string[];          // Quest terkait UMKM ini
}
```

### 5.9 State Pemain (Player)

```typescript
// src/types/player.ts

interface PlayerState {
  name: string;
  selectedCharacterId: CharacterRole | null;  // null jika belum memilih
  level: number;
  currentXp: number;
  totalPoints: number;
  gold: number;
  completedQuestIds: string[];
  activeQuestIds: string[];
  obtainedBadgeIds: string[];
  obtainedRewardIds: string[];
  unlockedStoryIds: string[];
  selectedDestination: string;   // "jakarta" (untuk saat ini)
  language: "id" | "en";
}
```

---

## 6. Design System

### 6.1 Warna (Light Theme — Clean & Modern)

```
Background utama     : #FAFBFC (abu sangat terang)
Card/Surface         : #FFFFFF (putih)
Card border          : #E5E7EB (abu muda)
Text primary         : #111827 (hitam gelap)
Text secondary       : #6B7280 (abu)
Accent primary       : #10B981 (emerald green — tema petualangan/alam)
Accent secondary     : #F59E0B (amber/gold — tema reward/achievement)
Accent danger/quest  : #EF4444 (merah — quest penting/urgent)
Accent info          : #3B82F6 (biru — info/educational)
Accent eco           : #22C55E (hijau terang — eco quest)
Accent cultural      : #8B5CF6 (ungu — budaya/heritage)
Accent culinary      : #F97316 (oranye — kuliner)
```

### 6.2 Typography

```
Font family   : 'Poppins', sans-serif (Google Fonts)
Heading 1     : 24px / Bold (700)
Heading 2     : 20px / SemiBold (600)
Heading 3     : 16px / SemiBold (600)
Body          : 14px / Regular (400)
Caption/small : 12px / Regular (400)
Stats/angka   : 14-20px / Bold (700) — poin, XP, level
```

### 6.3 Spacing & Border Radius

```
Spacing unit  : 4px (kelipatan: 4, 8, 12, 16, 20, 24, 32)
Card radius   : 12px
Button radius : 8px
Badge radius  : 9999px (pill)
```

---

## 7. Routing (Halaman & Navigasi)

### 7.1 Rute Aplikasi

```
/                        → OnboardingPage (jika belum pilih karakter)
/                        → HomePage (jika sudah pilih karakter)
/onboarding              → OnboardingPage (pilih destinasi + karakter)
/onboarding/character    → CharacterSelectPage
/explore                 → ExploreMapPage (peta interaktif Leaflet)
/quests                  → QuestsPage (daftar quest, filter by type)
/quests/:questId         → QuestDetailPage (detail + challenge/battle)
/character               → CharacterPage (profil karakter, badge, level)
/rewards                 → RewardsPage (toko reward, tukar poin)
/story                   → StoryPage (kumpulan cerita lokal)
/story/:storyId          → StoryDetailPage (baca cerita)
/umkm                    → UmkmPage (daftar UMKM)
/umkm/:umkmId            → UmkmDetailPage (detail UMKM)
/leaderboard             → LeaderboardPage (ranking pemain)
/profile                 → ProfilePage (data pemain, riwayat, sertifikat)
```

### 7.2 Bottom Navigation (5 menu utama, selalu terlihat)

| Posisi | Ikon | Label | Rute |
|:---|:---|:---|:---|
| 1 | 🏠 Home | Home | `/` |
| 2 | 🗺️ Map | Explore | `/explore` |
| 3 | ⚔️ Sword | Quests | `/quests` |
| 4 | 🎒 Backpack | Rewards | `/rewards` |
| 5 | 👤 User | Profile | `/profile` |

Menu tambahan (Character, Story, UMKM, Leaderboard) diakses dari dalam halaman-halaman utama tersebut (misalnya dari Home atau dari menu hamburger/drawer).

---

## 8. Fase Implementasi (Urutan Pengerjaan)

### Fase 1: Inisialisasi Proyek
1. Jalankan `npm create vite@latest ./ -- --template react-ts` di direktori proyek
2. Install dependencies: `react-router-dom`, `leaflet`, `react-leaflet`, `i18next`, `react-i18next`
3. Setup shadcn/ui (init + install komponen: Button, Card, Badge, Tabs, Sheet, Dialog, Progress, Avatar)
4. Tambahkan Google Fonts Poppins di `index.html`
5. Konfigurasi `tsconfig.json` path aliases (`@/` → `src/`)

### Fase 2: Type Definitions & Mock Data
1. Buat semua file di `src/types/` sesuai Section 5
2. Buat semua file di `src/data/` dengan mock data Jakarta:
   - 7 karakter RPG
   - Minimal 10 quest (campuran semua tipe)
   - Minimal 8 lokasi wisata Jakarta (dengan koordinat lat/lng nyata)
   - Minimal 5 cerita lokal Jakarta
   - Minimal 6 reward (badge, voucher, collectible)
   - Minimal 5 UMKM Jakarta
   - Minimal 3 battle/challenge (dengan pertanyaan kuis nyata tentang Jakarta)
   - 6 level definition
   - Data leaderboard dummy (10 pemain fiktif)

### Fase 3: State Management & i18n
1. Buat `PlayerContext.tsx` dengan `useReducer` untuk mengelola seluruh state pemain
2. Buat actions: `SELECT_CHARACTER`, `START_QUEST`, `COMPLETE_OBJECTIVE`, `COMPLETE_QUEST`, `GAIN_XP`, `GAIN_POINTS`, `UNLOCK_STORY`, `OBTAIN_BADGE`, `LEVEL_UP`
3. Buat custom hooks: `usePlayer`, `useQuests`
4. Setup i18next dengan file terjemahan `id.json` dan `en.json`
5. Simpan state pemain ke `localStorage` agar tidak hilang saat refresh

### Fase 4: Layout & Navigasi
1. Buat `AppShell.tsx` — layout wrapper (header + content area + bottom nav)
2. Buat `BottomNav.tsx` — 5 tab navigasi bawah dengan ikon (aktif/inaktif)
3. Buat `Header.tsx` — logo NusaQuest, level badge, toggle bahasa, notifikasi
4. Setup React Router di `App.tsx` dengan semua rute dari Section 7.1
5. Pastikan navigasi smooth tanpa full page reload

### Fase 5: Komponen Game UI
Buat semua komponen di `src/components/game/`:
1. `XpBar.tsx` — progress bar horizontal dengan animasi mengisi, menampilkan current/max XP
2. `LevelIndicator.tsx` — lingkaran/badge yang menampilkan angka level saat ini
3. `CharacterCard.tsx` — panel besar: avatar, nama, role, XP bar, level, poin, gold
4. `QuestCard.tsx` — card: ikon tipe quest, judul, deskripsi singkat, difficulty, status, reward preview
5. `QuestDetail.tsx` — detail lengkap: objectives checklist, lokasi di peta mini, reward, tombol mulai
6. `BattleQuiz.tsx` — komponen kuis interaktif: tampilkan pertanyaan, 4 opsi, timer, feedback benar/salah, skor akhir
7. `BadgeDisplay.tsx` — grid badge yang diperoleh vs yang terkunci
8. `RewardCard.tsx` — card reward: gambar, nama, tipe, status (obtained/redeemable)
9. `StoryCard.tsx` — card cerita: gambar, judul, kategori, status terkunci/terbuka
10. `UmkmCard.tsx` — card UMKM: foto, nama, kategori, rating, voucher indicator
11. `LeaderboardRow.tsx` — baris ranking: posisi, avatar, nama, level, poin

### Fase 6: Halaman-Halaman Utama
Buat semua halaman di `src/pages/`:

1. **OnboardingPage** — Pemain baru disambut dengan narasi singkat tentang "Peta Warisan Lokal", lalu memilih destinasi (Jakarta), lalu memilih salah satu dari 7 karakter RPG. Tampilkan card karakter dengan deskripsi peran dan kekuatan khusus masing-masing.

2. **HomePage** — Menampilkan: CharacterCard (avatar + stats), misi aktif saat ini (max 3 quest), statistik ringkas (quest selesai, badge, poin), tombol cepat ke Explore Map dan Quest. Ini adalah "dashboard" pemain.

3. **ExploreMapPage** — Peta Leaflet full-width yang menampilkan marker di lokasi wisata Jakarta. Klik marker → popup info singkat + tombol "Lihat Quest". Marker diberi warna berbeda sesuai kategori (budaya=ungu, kuliner=oranye, eco=hijau, sejarah=biru). Filter marker by kategori.

4. **QuestsPage** — Tab filter: All, Main, Side, Cultural, Culinary, Eco, Historical, dll. Setiap tab menampilkan daftar QuestCard. Quest yang belum memenuhi level requirement ditampilkan terkunci (greyed out).

5. **QuestDetailPage** — Detail quest lengkap: deskripsi, lokasi di peta mini, objectives checklist (cek/uncek), tombol untuk memulai battle/challenge (jika ada). Saat semua objectives selesai → tampilkan reward yang diperoleh + XP gained + animasi level up (jika naik level).

6. **CharacterPage** — Profil karakter yang dipilih: avatar besar, nama, role, kekuatan khusus, level progress, daftar badge yang diperoleh (BadgeDisplay), statistik lengkap.

7. **RewardsPage** — Tab: Badges, Vouchers, Collectibles, Certificates. Menampilkan semua reward (obtained & available). Reward yang bisa ditukar dengan poin menampilkan tombol "Tukar".

8. **StoryPage** — Grid cerita lokal. Yang sudah terbuka bisa diklik untuk dibaca. Yang terkunci menampilkan hint quest mana yang harus diselesaikan.

9. **StoryDetailPage** — Tampilan baca cerita: gambar besar, judul, konten narasi panjang, kategori, lokasi terkait.

10. **UmkmPage** — Daftar UMKM Jakarta. Filter by kategori (kuliner, suvenir, dll.). Setiap card menampilkan info singkat + indicator voucher.

11. **UmkmDetailPage** — Detail UMKM: foto, deskripsi, produk, lokasi di peta mini, voucher aktif, quest terkait.

12. **LeaderboardPage** — Tabel ranking pemain. Highlight posisi pemain saat ini. Top 3 ditampilkan khusus.

13. **ProfilePage** — Nama pemain, karakter, level, total XP, total poin, quest selesai, badge diperoleh, riwayat quest, tombol logout (reset state).

### Fase 7: Interaksi Game (Fungsionalitas Inti)
Implementasi logika game yang menghubungkan semua komponen:
1. **Alur memulai quest:** Klik "Mulai Quest" → quest masuk ke activeQuests → objectives muncul sebagai checklist
2. **Alur menyelesaikan objective:** Klik checkbox objective → objective ditandai completed
3. **Alur battle/challenge:** Jika quest memiliki battleId → tampilkan BattleQuiz → pemain menjawab pertanyaan → skor dihitung → jika lulus, objective terkait auto-complete
4. **Alur menyelesaikan quest:** Semua objectives completed → quest pindah ke completedQuests → reward diberikan (XP, poin, badge, story unlock) → cek apakah naik level
5. **Alur level up:** Jika currentXp >= requiredXp level berikutnya → level naik → tampilkan notifikasi/animasi level up
6. **Alur unlock story:** Jika quest memberikan storyUnlockId → story bersangkutan berubah status dari locked ke unlocked
7. **Persistence:** Seluruh PlayerState disimpan ke localStorage setiap kali berubah

### Fase 8: Docker & Deployment Config
1. Buat `Dockerfile` (multi-stage: node alpine build → nginx alpine serve)
2. Buat `docker-compose.yml`
3. Buat `.env.example` (template untuk Supabase keys di masa depan)
4. Pastikan `npm run build` berhasil
5. Deploy ke Vercel (connect GitHub repo)

---

## 9. Verification Plan

### Build Verification
```bash
npm run build
```
Harus berhasil tanpa error TypeScript dan tanpa warning kritis.

### Manual Verification Checklist
- [ ] Onboarding: bisa pilih destinasi Jakarta dan pilih karakter
- [ ] Home: menampilkan CharacterCard, misi aktif, statistik
- [ ] Explore Map: peta Leaflet memuat marker lokasi Jakarta dengan benar
- [ ] Quests: tab filter berfungsi, quest terkunci ditampilkan dengan benar
- [ ] Quest Detail: bisa mulai quest, checklist objectives, battle quiz berjalan
- [ ] Level up: XP bertambah setelah quest selesai, level naik jika memenuhi syarat
- [ ] Rewards: badge/voucher muncul setelah quest selesai
- [ ] Story: cerita terbuka setelah quest terkait selesai
- [ ] UMKM: daftar dan detail UMKM tampil dengan benar
- [ ] Leaderboard: ranking tampil
- [ ] Profile: statistik pemain akurat
- [ ] Language toggle: semua teks berubah antara ID dan EN
- [ ] Responsive: tampilan baik di mobile (375px) dan desktop (1440px)
- [ ] LocalStorage: state pemain tersimpan setelah refresh browser
- [ ] Docker: `docker compose up --build` berhasil dan aplikasi dapat diakses

---

## 10. Catatan untuk Pengembangan Masa Depan (Tahun 2+)

Struktur kode di atas dirancang agar mudah diintegrasikan dengan backend Supabase:

1. **Autentikasi:** Ganti simulasi login dengan `@supabase/supabase-js` auth
2. **Database:** Ganti file `src/data/*.ts` dengan query ke tabel Supabase
3. **File types:** TypeScript types di `src/types/` bisa langsung dipakai sebagai skema tabel
4. **PlayerContext:** Ganti localStorage persistence dengan Supabase realtime sync
5. **QR Check-in:** Tambahkan fitur scan QR menggunakan `html5-qrcode` library
6. **GPS Check-in:** Gunakan `useGeolocation` hook yang sudah disiapkan
7. **Dashboard Pengelola:** Buat rute terpisah `/admin/*` dengan halaman-halaman sesuai dokumen (Quest Management, UMKM Management, Content Management, dll.)
