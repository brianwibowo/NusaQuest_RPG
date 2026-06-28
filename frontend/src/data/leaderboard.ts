/**
 * ==========================================================================
 * NusaQuest RPG — Leaderboard Data
 * ==========================================================================
 *
 * Mock data for 10 dummy leaderboard entries.
 * The current player's entry will be merged in at runtime.
 *
 * In production (Tahun 2+), this data will come from Supabase.
 * ==========================================================================
 */

import type { LeaderboardEntry } from "@/types";

export const LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    name: "AyuBetawi",
    characterId: "cultural_guardian",
    level: 5,
    totalPoints: 8500,
    questsCompleted: 28,
    isCurrentPlayer: false,
  },
  {
    rank: 2,
    name: "RizkyExplorer",
    characterId: "explorer",
    level: 5,
    totalPoints: 7200,
    questsCompleted: 24,
    isCurrentPlayer: false,
  },
  {
    rank: 3,
    name: "SitiEcoWarrior",
    characterId: "eco_warrior",
    level: 4,
    totalPoints: 5800,
    questsCompleted: 19,
    isCurrentPlayer: false,
  },
  {
    rank: 4,
    name: "BudiHeritage",
    characterId: "heritage_seeker",
    level: 4,
    totalPoints: 5200,
    questsCompleted: 17,
    isCurrentPlayer: false,
  },
  {
    rank: 5,
    name: "DewiKuliner",
    characterId: "culinary_hunter",
    level: 3,
    totalPoints: 3800,
    questsCompleted: 13,
    isCurrentPlayer: false,
  },
  {
    rank: 6,
    name: "FajarLocal",
    characterId: "local_hero",
    level: 3,
    totalPoints: 3200,
    questsCompleted: 11,
    isCurrentPlayer: false,
  },
  {
    rank: 7,
    name: "GalihTreasure",
    characterId: "treasure_seeker",
    level: 3,
    totalPoints: 2900,
    questsCompleted: 10,
    isCurrentPlayer: false,
  },
  {
    rank: 8,
    name: "HaniCulture",
    characterId: "cultural_guardian",
    level: 2,
    totalPoints: 2100,
    questsCompleted: 7,
    isCurrentPlayer: false,
  },
  {
    rank: 9,
    name: "IrfanEco",
    characterId: "eco_warrior",
    level: 2,
    totalPoints: 1500,
    questsCompleted: 5,
    isCurrentPlayer: false,
  },
  {
    rank: 10,
    name: "JuliaTraveler",
    characterId: "explorer",
    level: 1,
    totalPoints: 800,
    questsCompleted: 3,
    isCurrentPlayer: false,
  },
];
