import { apiFetch } from "@/lib/api";
import type { Quest } from "@/types";

export async function getQuests(level?: number): Promise<Quest[]> {
  const path = level !== undefined ? `/api/quests?level=${level}` : "/api/quests";
  return apiFetch<Quest[]>(path);
}

export async function getQuestById(id: string): Promise<Quest> {
  return apiFetch<Quest>(`/api/quests/${id}`);
}
