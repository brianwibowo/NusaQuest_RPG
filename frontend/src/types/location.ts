/**
 * NusaQuest RPG — Location Types
 * Tourism destination locations for the interactive Leaflet map.
 * Ref: nusaquest_02_mekanisme_game.md — "Explore Map"
 */

import type { BilingualText } from "./character";

export type LocationCategory =
  | "wisata_budaya" | "wisata_kuliner" | "wisata_sejarah"
  | "ekowisata" | "umkm" | "hidden_spot";

export interface Location {
  id: string;
  name: BilingualText;
  description: BilingualText;
  category: LocationCategory;
  latitude: number;
  longitude: number;
  imageUrl: string;
  questIds: string[];
  umkmIds: string[];
  address?: BilingualText;
}
