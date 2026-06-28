/**
 * ==========================================================================
 * NusaQuest RPG — Character Data
 * ==========================================================================
 *
 * Mock data for the 7 playable character archetypes.
 * Each character has a unique role, special power, and quest affinity.
 *
 * In production (Tahun 2+), this data will come from Supabase.
 * ==========================================================================
 */

import type { Character } from "@/types";

/**
 * All 7 playable characters in NusaQuest RPG.
 *
 * Characters are ordered by exploration style:
 * 1. Explorer        — general exploration
 * 2. Cultural Guardian — culture & traditions
 * 3. Culinary Hunter  — food & cuisine
 * 4. Eco Warrior      — environment & sustainability
 * 5. Heritage Seeker  — history & heritage
 * 6. Local Hero       — community & social
 * 7. Treasure Seeker  — AR & digital treasures
 */
export const CHARACTERS: Character[] = [
  {
    id: "explorer",
    name: { id: "Explorer", en: "Explorer" },
    role: { id: "Penjelajah Destinasi", en: "Destination Explorer" },
    specialPower: {
      id: "Membuka peta lokasi lebih cepat",
      en: "Unlocks location maps faster",
    },
    suitableQuestTypes: ["main", "side"],
    avatarUrl: "/images/characters/explorer.png",
    description: {
      id: "Petualang sejati yang haus akan penemuan baru. Jelajahi setiap sudut destinasi wisata dan temukan tempat-tempat tersembunyi.",
      en: "A true adventurer hungry for new discoveries. Explore every corner of tourist destinations and find hidden spots.",
    },
  },
  {
    id: "cultural_guardian",
    name: { id: "Cultural Guardian", en: "Cultural Guardian" },
    role: { id: "Penjaga Budaya", en: "Culture Keeper" },
    specialPower: {
      id: "Mendapat bonus XP dari misi budaya",
      en: "Earns bonus XP from cultural missions",
    },
    suitableQuestTypes: ["cultural", "historical"],
    avatarUrl: "/images/characters/cultural_guardian.png",
    description: {
      id: "Pelindung warisan budaya Nusantara. Dalami tradisi, adat, dan kekayaan budaya lokal yang tak ternilai.",
      en: "Protector of Nusantara's cultural heritage. Dive deep into traditions, customs, and invaluable local culture.",
    },
  },
  {
    id: "culinary_hunter",
    name: { id: "Culinary Hunter", en: "Culinary Hunter" },
    role: { id: "Pemburu Kuliner", en: "Culinary Hunter" },
    specialPower: {
      id: "Mendapat reward khusus dari UMKM kuliner",
      en: "Earns special rewards from culinary UMKM",
    },
    suitableQuestTypes: ["culinary", "umkm"],
    avatarUrl: "/images/characters/culinary_hunter.png",
    description: {
      id: "Pencinta cita rasa Nusantara. Temukan kuliner legendaris, resep tersembunyi, dan dukung UMKM kuliner lokal.",
      en: "A lover of Nusantara's flavors. Discover legendary cuisine, hidden recipes, and support local culinary UMKM.",
    },
  },
  {
    id: "eco_warrior",
    name: { id: "Eco Warrior", en: "Eco Warrior" },
    role: { id: "Pejuang Lingkungan", en: "Environmental Champion" },
    specialPower: {
      id: "Mendapat poin tambahan dari misi ramah lingkungan",
      en: "Earns bonus points from eco-friendly missions",
    },
    suitableQuestTypes: ["eco", "educational"],
    avatarUrl: "/images/characters/eco_warrior.png",
    description: {
      id: "Pahlawan bumi yang peduli kelestarian alam. Selesaikan misi ramah lingkungan dan jadilah teladan wisata berkelanjutan.",
      en: "An earth hero who cares about nature. Complete eco-friendly missions and become a role model for sustainable tourism.",
    },
  },
  {
    id: "heritage_seeker",
    name: { id: "Heritage Seeker", en: "Heritage Seeker" },
    role: { id: "Pencari Sejarah", en: "History Seeker" },
    specialPower: {
      id: "Membuka narasi sejarah tersembunyi",
      en: "Unlocks hidden historical narratives",
    },
    suitableQuestTypes: ["historical", "educational"],
    avatarUrl: "/images/characters/heritage_seeker.png",
    description: {
      id: "Penelusur jejak masa lalu. Pecahkan teka-teki sejarah dan buka kembali bab-bab yang terlupakan dari Nusantara.",
      en: "A tracer of the past. Solve historical puzzles and reopen forgotten chapters of Nusantara's history.",
    },
  },
  {
    id: "local_hero",
    name: { id: "Local Hero", en: "Local Hero" },
    role: { id: "Sahabat Masyarakat Lokal", en: "Community Friend" },
    specialPower: {
      id: "Mendapat reward dari interaksi sosial",
      en: "Earns rewards from social interactions",
    },
    suitableQuestTypes: ["social", "umkm"],
    avatarUrl: "/images/characters/local_hero.png",
    description: {
      id: "Teman sejati masyarakat lokal. Bangun hubungan dengan warga, UMKM, dan komunitas untuk memperkuat ekonomi lokal.",
      en: "A true friend of local communities. Build relationships with residents, UMKM, and communities to strengthen the local economy.",
    },
  },
  {
    id: "treasure_seeker",
    name: { id: "Treasure Seeker", en: "Treasure Seeker" },
    role: { id: "Pemburu Harta Digital", en: "Digital Treasure Hunter" },
    specialPower: {
      id: "Mendapat item digital dari AR treasure hunt",
      en: "Earns digital items from AR treasure hunts",
    },
    suitableQuestTypes: ["ar_treasure", "photo"],
    avatarUrl: "/images/characters/treasure_seeker.png",
    description: {
      id: "Pemburu artefak digital yang tersembunyi di berbagai lokasi. Scan, temukan, dan kumpulkan koleksi digital eksklusif.",
      en: "A hunter of digital artifacts hidden across locations. Scan, find, and collect exclusive digital collectibles.",
    },
  },
];
