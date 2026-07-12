/**
 * NusaQuest RPG — Central Category Styling Helpers
 * Standardized coloring, icons, and labels for all location categories.
 */

import type { LocationCategory } from "@/types";

export interface CategoryStyle {
  label: string;
  emoji: string;
  lightBg: string;
  lightText: string;
  lightBorder: string;
  glassBg: string;
  glassText: string;
  glassBorder: string;
  solidBg: string;
}

export const CATEGORY_STYLES: Record<LocationCategory, CategoryStyle> = {
  wisata_sejarah: {
    label: "Wisata Sejarah",
    emoji: "🏛️",
    lightBg: "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100",
    lightText: "text-blue-800",
    lightBorder: "border-blue-200",
    glassBg: "bg-blue-600/80 border-blue-400/30 text-blue-50",
    glassText: "text-blue-50",
    glassBorder: "border-blue-400/30",
    solidBg: "bg-blue-600",
  },
  wisata_budaya: {
    label: "Wisata Budaya",
    emoji: "🔮",
    lightBg: "bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100",
    lightText: "text-purple-800",
    lightBorder: "border-purple-200",
    glassBg: "bg-purple-600/80 border-purple-400/30 text-purple-50",
    glassText: "text-purple-50",
    glassBorder: "border-purple-400/30",
    solidBg: "bg-purple-600",
  },
  wisata_kuliner: {
    label: "Wisata Kuliner",
    emoji: "🍳",
    lightBg: "bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100",
    lightText: "text-orange-800",
    lightBorder: "border-orange-200",
    glassBg: "bg-orange-600/80 border-orange-400/30 text-orange-50",
    glassText: "text-orange-50",
    glassBorder: "border-orange-400/30",
    solidBg: "bg-orange-600",
  },
  ekowisata: {
    label: "Ecowisata",
    emoji: "🌿",
    lightBg: "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100",
    lightText: "text-emerald-800",
    lightBorder: "border-emerald-200",
    glassBg: "bg-emerald-600/80 border-emerald-500/30 text-emerald-50",
    glassText: "text-emerald-50",
    glassBorder: "border-emerald-500/30",
    solidBg: "bg-emerald-600",
  },
  umkm: {
    label: "UMKM Mitra",
    emoji: "🏪",
    lightBg: "bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100",
    lightText: "text-indigo-800",
    lightBorder: "border-indigo-200",
    glassBg: "bg-indigo-600/80 border-indigo-400/30 text-indigo-50",
    glassText: "text-indigo-50",
    glassBorder: "border-indigo-400/30",
    solidBg: "bg-indigo-600",
  },
  hidden_spot: {
    label: "Hidden Spot",
    emoji: "📍",
    lightBg: "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100",
    lightText: "text-slate-800",
    lightBorder: "border-slate-200",
    glassBg: "bg-slate-700/80 border-slate-600/30 text-slate-50",
    glassText: "text-slate-50",
    glassBorder: "border-slate-600/30",
    solidBg: "bg-slate-700",
  },
};

/**
 * Returns complete styling object for a given category. Falls back to hidden_spot styles.
 */
export function getCategoryStyle(cat: string): CategoryStyle {
  return CATEGORY_STYLES[cat as LocationCategory] || CATEGORY_STYLES.hidden_spot;
}
