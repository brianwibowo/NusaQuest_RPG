/**
 * NusaQuest RPG — Story Types
 * Unlockable local narratives (culture, history, cuisine, environment).
 * Ref: nusaquest_02_mekanisme_game.md — "Story" menu
 */

import type { BilingualText } from "./character";

export type StoryCategory =
  | "budaya" | "sejarah" | "legenda" | "kuliner" | "lingkungan";

export interface Story {
  id: string;
  title: BilingualText;
  content: BilingualText;
  category: StoryCategory;
  imageUrl: string;
  locationId: string;
  unlocked: boolean;
  unlockedByQuestId: string;
}
