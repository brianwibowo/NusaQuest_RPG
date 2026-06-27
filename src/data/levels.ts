/**
 * ==========================================================================
 * NusaQuest RPG — Level Definitions Data
 * ==========================================================================
 *
 * Defines the 6-tier level progression system with XP thresholds.
 * Also provides utility functions for level calculations.
 *
 * In production (Tahun 2+), this data will come from Supabase.
 * ==========================================================================
 */

import type { LevelDefinition } from "@/types";

/**
 * Level definitions ordered by progression.
 *
 * XP thresholds are cumulative:
 *   Level 1 →  0 XP (starting level)
 *   Level 2 →  500 XP
 *   Level 3 →  1500 XP
 *   Level 4 →  3500 XP
 *   Level 5 →  7000 XP
 *   Level 6 →  12000 XP
 */
export const LEVELS: LevelDefinition[] = [
  {
    level: 1,
    name: { id: "New Traveler", en: "New Traveler" },
    requiredXp: 0,
    description: {
      id: "Membuat akun dan memilih karakter",
      en: "Create an account and choose a character",
    },
    rewardDescription: {
      id: "Badge awal",
      en: "Starter badge",
    },
  },
  {
    level: 2,
    name: { id: "Local Explorer", en: "Local Explorer" },
    requiredXp: 500,
    description: {
      id: "Menyelesaikan 3 quest",
      en: "Complete 3 quests",
    },
    rewardDescription: {
      id: "Poin tambahan",
      en: "Bonus points",
    },
  },
  {
    level: 3,
    name: { id: "Cultural Adventurer", en: "Cultural Adventurer" },
    requiredXp: 1500,
    description: {
      id: "Menyelesaikan quest budaya dan sejarah",
      en: "Complete cultural and historical quests",
    },
    rewardDescription: {
      id: "Membuka cerita lokal",
      en: "Unlock local stories",
    },
  },
  {
    level: 4,
    name: { id: "Heritage Guardian", en: "Heritage Guardian" },
    requiredXp: 3500,
    description: {
      id: "Menyelesaikan 10 quest lintas lokasi",
      en: "Complete 10 quests across locations",
    },
    rewardDescription: {
      id: "Voucher UMKM",
      en: "UMKM voucher",
    },
  },
  {
    level: 5,
    name: { id: "Tourism Champion", en: "Tourism Champion" },
    requiredXp: 7000,
    description: {
      id: "Menyelesaikan main quest destinasi",
      en: "Complete the destination's main quest",
    },
    rewardDescription: {
      id: "Sertifikat digital",
      en: "Digital certificate",
    },
  },
  {
    level: 6,
    name: { id: "Nusantara Legend", en: "Nusantara Legend" },
    requiredXp: 12000,
    description: {
      id: "Menyelesaikan quest di beberapa destinasi",
      en: "Complete quests across multiple destinations",
    },
    rewardDescription: {
      id: "Premium badge dan special reward",
      en: "Premium badge and special reward",
    },
  },
];

/**
 * Maximum level a player can achieve.
 */
export const MAX_LEVEL = LEVELS[LEVELS.length - 1].level;
