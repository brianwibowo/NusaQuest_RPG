/**
 * NusaQuest RPG — Level System Types
 * 6-tier progression: New Traveler → Nusantara Legend
 * Ref: nusaquest_02_mekanisme_game.md — "Sistem Level"
 */

import type { BilingualText } from "./character";

export interface LevelDefinition {
  level: number;
  name: BilingualText;
  requiredXp: number;
  description: BilingualText;
  rewardDescription: BilingualText;
}
