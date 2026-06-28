/**
 * NusaQuest RPG — Player State Types
 * Runtime game session state, persisted to localStorage.
 * Ref: nusaquest_02_mekanisme_game.md — "Alur Gameplay Utama"
 */

import type { CharacterRole } from "./character";

export type AppLanguage = "id" | "en";

export interface PlayerState {
  name: string;
  selectedCharacterId: CharacterRole | null;
  level: number;
  currentXp: number;
  totalPoints: number;
  gold: number;
  completedQuestIds: string[];
  activeQuestIds: string[];
  obtainedBadgeIds: string[];
  obtainedRewardIds: string[];
  unlockedStoryIds: string[];
  selectedDestination: string;
  language: AppLanguage;
  hasCompletedOnboarding: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  characterId: CharacterRole;
  level: number;
  totalPoints: number;
  questsCompleted: number;
  isCurrentPlayer: boolean;
}
