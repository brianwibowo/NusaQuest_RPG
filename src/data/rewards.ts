/**
 * ==========================================================================
 * NusaQuest RPG — Reward Data
 * ==========================================================================
 *
 * Mock data for badges, vouchers, collectibles, and certificates.
 *
 * In production (Tahun 2+), this data will come from Supabase.
 * ==========================================================================
 */

import type { Reward } from "@/types";

export const REWARDS: Reward[] = [
  // ===== BADGES =====
  {
    id: "badge_starter",
    name: { id: "Petualang Baru", en: "New Adventurer" },
    description: {
      id: "Memulai perjalanan sebagai Penjelajah Nusantara",
      en: "Started the journey as a Nusantara Explorer",
    },
    type: "badge",
    imageUrl: "/images/rewards/badge_starter.png",
    obtained: false,
  },
  {
    id: "badge_history_buff",
    name: { id: "Pencinta Sejarah", en: "History Buff" },
    description: {
      id: "Menyelesaikan quest sejarah di Kota Tua Jakarta",
      en: "Completed the historical quest at Jakarta Old Town",
    },
    type: "badge",
    imageUrl: "/images/rewards/badge_history.png",
    obtained: false,
  },
  {
    id: "badge_culture_keeper",
    name: { id: "Penjaga Budaya", en: "Culture Keeper" },
    description: {
      id: "Menyelesaikan quest budaya Betawi",
      en: "Completed the Betawi cultural quest",
    },
    type: "badge",
    imageUrl: "/images/rewards/badge_culture.png",
    obtained: false,
  },
  {
    id: "badge_eco_warrior",
    name: { id: "Pejuang Lingkungan", en: "Eco Warrior" },
    description: {
      id: "Menyelesaikan misi ramah lingkungan",
      en: "Completed an eco-friendly mission",
    },
    type: "badge",
    imageUrl: "/images/rewards/badge_eco.png",
    obtained: false,
  },
  {
    id: "badge_independence",
    name: { id: "Patriot Merdeka", en: "Independence Patriot" },
    description: {
      id: "Mempelajari sejarah kemerdekaan di Monas",
      en: "Learned independence history at Monas",
    },
    type: "badge",
    imageUrl: "/images/rewards/badge_independence.png",
    obtained: false,
  },
  {
    id: "badge_mangrove_hero",
    name: { id: "Pahlawan Mangrove", en: "Mangrove Hero" },
    description: {
      id: "Berpartisipasi dalam pelestarian ekosistem mangrove",
      en: "Participated in mangrove ecosystem conservation",
    },
    type: "badge",
    imageUrl: "/images/rewards/badge_mangrove.png",
    obtained: false,
  },
  {
    id: "badge_green_guardian",
    name: { id: "Penjaga Hijau", en: "Green Guardian" },
    description: {
      id: "Melakukan aksi bersih-bersih di taman kota",
      en: "Performed a cleanup action at a city park",
    },
    type: "badge",
    imageUrl: "/images/rewards/badge_green.png",
    obtained: false,
  },
  {
    id: "badge_nusantara_explorer",
    name: { id: "Penjelajah Nusantara", en: "Nusantara Explorer" },
    description: {
      id: "Menjelajahi keragaman budaya Indonesia",
      en: "Explored Indonesia's cultural diversity",
    },
    type: "badge",
    imageUrl: "/images/rewards/badge_nusantara.png",
    obtained: false,
  },

  // ===== VOUCHERS =====
  {
    id: "voucher_kerak_telor",
    name: { id: "Voucher Kerak Telor", en: "Kerak Telor Voucher" },
    description: {
      id: "Diskon 20% untuk kerak telor di UMKM mitra",
      en: "20% discount for kerak telor at partner UMKM",
    },
    type: "voucher_umkm",
    imageUrl: "/images/rewards/voucher_kerak.png",
    obtained: false,
  },
  {
    id: "voucher_bakmi",
    name: { id: "Voucher Bakmi Legendaris", en: "Legendary Bakmi Voucher" },
    description: {
      id: "Gratis es teh untuk pembelian bakmi di UMKM mitra Glodok",
      en: "Free iced tea with bakmi purchase at Glodok partner UMKM",
    },
    type: "voucher_umkm",
    imageUrl: "/images/rewards/voucher_bakmi.png",
    obtained: false,
  },

  // ===== DIGITAL COLLECTIBLES =====
  {
    id: "collectible_kota_tua_frame",
    name: { id: "Bingkai Kota Tua", en: "Old Town Frame" },
    description: {
      id: "Bingkai foto digital bertema arsitektur kolonial Kota Tua",
      en: "Digital photo frame themed with Old Town colonial architecture",
    },
    type: "digital_collectible",
    imageUrl: "/images/rewards/collectible_frame.png",
    obtained: false,
  },
  {
    id: "collectible_peta_nusantara",
    name: { id: "Peta Nusantara Digital", en: "Digital Nusantara Map" },
    description: {
      id: "Peta digital eksklusif yang menampilkan keragaman budaya Indonesia",
      en: "Exclusive digital map showcasing Indonesia's cultural diversity",
    },
    type: "digital_collectible",
    imageUrl: "/images/rewards/collectible_map.png",
    pointCost: 500,
    obtained: false,
  },
];
