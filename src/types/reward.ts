/**
 * NusaQuest RPG — Reward Types
 * Badges, vouchers, collectibles, certificates earned from quests.
 * Ref: nusaquest_02_mekanisme_game.md — "Sistem Reward"
 */

import type { BilingualText } from "./character";

export type RewardType =
  | "badge" | "voucher_umkm" | "ticket_discount"
  | "digital_collectible" | "certificate" | "story_unlock" | "eco_reward";

export interface Reward {
  id: string;
  name: BilingualText;
  description: BilingualText;
  type: RewardType;
  imageUrl: string;
  pointCost?: number;
  obtained: boolean;
}
