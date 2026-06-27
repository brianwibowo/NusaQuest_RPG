/**
 * NusaQuest RPG — Quest Utility Functions
 * Filtering, status checking, and completion logic for quests.
 */

import type { Quest, QuestType } from "@/types";

// Filter quests by type
export function filterQuestsByType(quests: Quest[], type: QuestType): Quest[] {
  return quests.filter((q) => q.type === type);
}

// Filter quests by status
export function filterQuestsByStatus(quests: Quest[], status: Quest["status"]): Quest[] {
  return quests.filter((q) => q.status === status);
}

// Check if all objectives in a quest are completed
export function isQuestComplete(quest: Quest): boolean {
  return quest.objectives.every((obj) => obj.completed);
}

// Count completed objectives
export function getCompletedObjectiveCount(quest: Quest): number {
  return quest.objectives.filter((obj) => obj.completed).length;
}

// Get quest progress as percentage (0-100)
export function getQuestProgress(quest: Quest): number {
  if (quest.objectives.length === 0) return 0;
  return Math.round(
    (getCompletedObjectiveCount(quest) / quest.objectives.length) * 100
  );
}

// Check if a quest is accessible based on player level
export function isQuestAccessible(quest: Quest, playerLevel: number): boolean {
  return playerLevel >= quest.requiredLevel;
}

// Get display color class for quest type
export function getQuestTypeColor(type: QuestType): string {
  const colors: Record<QuestType, string> = {
    main: "text-red-600 bg-red-50",
    side: "text-slate-600 bg-slate-50",
    cultural: "text-violet-600 bg-violet-50",
    historical: "text-blue-600 bg-blue-50",
    culinary: "text-orange-600 bg-orange-50",
    umkm: "text-amber-600 bg-amber-50",
    eco: "text-emerald-600 bg-emerald-50",
    photo: "text-pink-600 bg-pink-50",
    ar_treasure: "text-cyan-600 bg-cyan-50",
    social: "text-indigo-600 bg-indigo-50",
    educational: "text-teal-600 bg-teal-50",
    daily: "text-yellow-600 bg-yellow-50",
    seasonal: "text-rose-600 bg-rose-50",
  };
  return colors[type] ?? "text-slate-600 bg-slate-50";
}

// Get display label for quest type
export function getQuestTypeLabel(type: QuestType, lang: "id" | "en"): string {
  const labels: Record<QuestType, { id: string; en: string }> = {
    main: { id: "Utama", en: "Main" },
    side: { id: "Sampingan", en: "Side" },
    cultural: { id: "Budaya", en: "Cultural" },
    historical: { id: "Sejarah", en: "Historical" },
    culinary: { id: "Kuliner", en: "Culinary" },
    umkm: { id: "UMKM", en: "UMKM" },
    eco: { id: "Lingkungan", en: "Eco" },
    photo: { id: "Foto", en: "Photo" },
    ar_treasure: { id: "AR Treasure", en: "AR Treasure" },
    social: { id: "Sosial", en: "Social" },
    educational: { id: "Edukasi", en: "Educational" },
    daily: { id: "Harian", en: "Daily" },
    seasonal: { id: "Musiman", en: "Seasonal" },
  };
  return labels[type]?.[lang] ?? type;
}
