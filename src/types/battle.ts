/**
 * NusaQuest RPG — Battle / Challenge Types
 * Educational quiz-based battles (no combat violence).
 * Ref: nusaquest_02_mekanisme_game.md — "Battle / Challenge System"
 */

import type { BilingualText } from "./character";

export type BattleType =
  | "knowledge" | "eco" | "culinary" | "heritage"
  | "umkm" | "puzzle" | "social";

export interface BattleQuestion {
  id: string;
  question: BilingualText;
  options: BilingualText[];
  correctIndex: number;
  explanation: BilingualText;
}

export interface Battle {
  id: string;
  title: BilingualText;
  type: BattleType;
  description: BilingualText;
  questions: BattleQuestion[];
  timeLimit: number;
  rewardXp: number;
  rewardPoints: number;
  passingScore: number;
}
