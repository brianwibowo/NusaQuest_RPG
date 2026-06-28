/**
 * NusaQuest RPG — Quest Types
 * Core gameplay mechanic — missions players complete at locations.
 * Ref: nusaquest_02_mekanisme_game.md — "Jenis Quest dalam Aplikasi"
 */

import type { BilingualText } from "./character";

export type QuestType =
  | "main" | "side" | "cultural" | "historical" | "culinary"
  | "umkm" | "eco" | "photo" | "ar_treasure" | "social"
  | "educational" | "daily" | "seasonal";

export type QuestStatus = "locked" | "available" | "in_progress" | "completed";
export type QuestDifficulty = "easy" | "medium" | "hard";

export type ObjectiveType =
  | "visit_location" | "scan_qr" | "answer_quiz" | "take_photo"
  | "buy_product" | "write_review" | "eco_action" | "social_interact";

export interface QuestObjective {
  id: string;
  description: BilingualText;
  type: ObjectiveType;
  completed: boolean;
}

export interface QuestReward {
  xp: number;
  points: number;
  badgeId?: string;
  voucherId?: string;
  collectibleId?: string;
  storyUnlockId?: string;
}

export interface Quest {
  id: string;
  title: BilingualText;
  description: BilingualText;
  type: QuestType;
  status: QuestStatus;
  locationId: string;
  objectives: QuestObjective[];
  reward: QuestReward;
  requiredLevel: number;
  estimatedDuration: BilingualText;
  difficulty: QuestDifficulty;
  battleId?: string;
  relatedUmkmId?: string;
  imageUrl?: string;
  battle?: import("./battle").Battle;
  location?: import("./location").Location;
}
