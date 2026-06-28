/**
 * NusaQuest RPG — Character Types
 * Defines the 7 playable character archetypes.
 * Ref: nusaquest_02_mekanisme_game.md — "Karakter Pemain"
 */

import type { QuestType } from "./quest";

// Bilingual text — used across all user-facing strings
export interface BilingualText {
  id: string;
  en: string;
}

export type CharacterRole =
  | "explorer"
  | "cultural_guardian"
  | "culinary_hunter"
  | "eco_warrior"
  | "heritage_seeker"
  | "local_hero"
  | "treasure_seeker";

export interface Character {
  id: CharacterRole;
  name: BilingualText;
  role: BilingualText;
  specialPower: BilingualText;
  suitableQuestTypes: QuestType[];
  avatarUrl: string;
  description: BilingualText;
}
