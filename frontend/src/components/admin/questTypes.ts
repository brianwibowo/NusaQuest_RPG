// ── Shared Quest Types & Interfaces ──

export interface QuestObjective {
  id?: string;
  descId: string;
  descEn?: string;
  type: string;
  sortOrder: number;
}

export interface QuestReward {
  xp: number;
  points: number;
  badgeId?: string | null;
  voucherId?: string | null;
  collectibleId?: string | null;
  storyUnlockId?: string | null;
}

export interface QuestItem {
  id: string;
  titleId: string;
  titleEn: string;
  descId: string;
  descEn: string;
  type: string;
  difficulty: string;
  requiredLevel: number;
  availableLevels: number[];
  estimatedTimeId?: string;
  estimatedTimeEn?: string;
  imageUrl?: string;
  locationId: string;
  relatedUmkmId?: string;
  objectives: QuestObjective[];
  reward?: QuestReward;
  battleId?: string;
}

export interface LocationItem {
  id: string;
  nameId: string;
}

export interface UmkmItem {
  id: string;
  name: string;
}

export interface BattleItem {
  id: string;
  titleId: string;
}

export interface StoryItem {
  id: string;
  titleId: string;
}

// ── Constants ──

export const ITEMS_PER_PAGE = 9;

export const QUEST_TYPES = [
  { value: "main", label: "Misi Utama", color: "bg-indigo-600" },
  { value: "side", label: "Misi Sampingan", color: "bg-slate-500" },
  { value: "cultural", label: "Wisata Budaya", color: "bg-amber-600" },
  { value: "historical", label: "Wisata Sejarah", color: "bg-rose-600" },
  { value: "culinary", label: "Wisata Kuliner", color: "bg-orange-600" },
  { value: "eco", label: "Ecowisata", color: "bg-emerald-600" },
  { value: "umkm_quest", label: "Mitra UMKM", color: "bg-teal-600" },
  { value: "photo", label: "Tantangan Foto", color: "bg-purple-600" },
  { value: "ar_treasure", label: "AR Harta Karun", color: "bg-cyan-600" },
  { value: "educational", label: "Edukasi Warisan", color: "bg-blue-600" },
];

export const DIFFICULTIES = [
  { value: "easy", label: "Mudah", color: "text-emerald-600" },
  { value: "medium", label: "Sedang", color: "text-amber-600" },
  { value: "hard", label: "Sulit", color: "text-red-600" },
];

export const OBJECTIVE_TYPES = [
  { value: "visit_location", label: "Kunjungi Destinasi" },
  { value: "scan_qr", label: "Pindai Kode QR" },
  { value: "answer_quiz", label: "Jawab Kuis Pengetahuan" },
  { value: "take_photo", label: "Unggah Foto" },
  { value: "buy_product", label: "Beli Produk UMKM Lokal" },
  { value: "write_review", label: "Tulis Ulasan" },
  { value: "eco_action", label: "Aksi Ramah Lingkungan" },
  { value: "social_interact", label: "Bicara dengan Warga Lokal" },
];

export const STEP_LABELS = [
  { num: 1, title: "Informasi Dasar" },
  { num: 2, title: "Tugas & Tantangan" },
  { num: 3, title: "Hadiah & Bonus" },
];

export const REWARD_BADGES = [
  { value: "badge_history_buff", label: "Pelestari Sejarah" },
  { value: "badge_culture_keeper", label: "Penjaga Budaya" },
  { value: "badge_independence", label: "Pejuang Kemerdekaan" },
  { value: "badge_eco_warrior", label: "Pahlawan Ekologi" },
  { value: "badge_mangrove_hero", label: "Penyelamat Hutan Bakau" },
  { value: "badge_nusantara_explorer", label: "Penjelajah Nusantara" },
  { value: "badge_green_guardian", label: "Penjaga Bumi Hijau" },
];

export const REWARD_VOUCHERS = [
  { value: "voucher_kerak_telor", label: "Diskon Kerak Telor Mpok Ipah (10%)" },
  { value: "voucher_bakmi", label: "Diskon Bakmi Kota Tua (15%)" },
];

export const REWARD_COLLECTIBLES = [
  { value: "collectible_kota_tua_frame", label: "Bingkai Foto Profil 'Kota Tua'" },
  { value: "collectible_peta_nusantara", label: "Bingkai Foto Profil 'Peta Nusantara'" },
];

// ── Helpers ──

export const getTypeLabel = (val: string) =>
  QUEST_TYPES.find((t) => t.value === val)?.label || val;

export const getTypeColor = (val: string) =>
  QUEST_TYPES.find((t) => t.value === val)?.color || "bg-slate-600";

export const getDifficultyLabel = (val: string) =>
  DIFFICULTIES.find((d) => d.value === val)?.label || val;

export const getDifficultyColor = (val: string) =>
  DIFFICULTIES.find((d) => d.value === val)?.color || "text-slate-600";
