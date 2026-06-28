/**
 * NusaQuest RPG — UMKM Types
 * Local businesses integrated as merchant NPCs / quest partners.
 * Ref: nusaquest_02_mekanisme_game.md — "UMKM" menu
 */

import type { BilingualText } from "./character";

export type UmkmCategory =
  | "kuliner" | "suvenir" | "kerajinan" | "fashion" | "jasa";

export interface Umkm {
  id: string;
  name: string;
  description: BilingualText;
  category: UmkmCategory;
  products: string[];
  locationId: string;
  imageUrl: string;
  rating: number;
  voucherAvailable: boolean;
  questIds: string[];
}
