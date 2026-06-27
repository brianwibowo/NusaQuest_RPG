/**
 * ==========================================================================
 * NusaQuest RPG — Type Definitions Barrel Export
 * ==========================================================================
 *
 * Central re-export file for all type definitions.
 * Import from "@/types" instead of individual files.
 *
 * Usage:
 *   import type { Quest, Character, PlayerState } from "@/types";
 * ==========================================================================
 */

// --- Character System ---
export type { BilingualText, Character, CharacterRole } from "./character";

// --- Quest System ---
export type {
  Quest,
  QuestDifficulty,
  QuestObjective,
  QuestReward,
  QuestStatus,
  QuestType,
  ObjectiveType,
} from "./quest";

// --- Location / Map ---
export type { Location, LocationCategory } from "./location";

// --- Level Progression ---
export type { LevelDefinition } from "./level";

// --- Reward System ---
export type { Reward, RewardType } from "./reward";

// --- Battle / Challenge System ---
export type { Battle, BattleQuestion, BattleType } from "./battle";

// --- Story / Narrative ---
export type { Story, StoryCategory } from "./story";

// --- UMKM Integration ---
export type { Umkm, UmkmCategory } from "./umkm";

// --- Player State ---
export type {
  PlayerState,
  LeaderboardEntry,
  AppLanguage,
} from "./player";
