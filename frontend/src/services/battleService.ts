import { apiFetch } from "@/lib/api";
import type { Battle } from "@/types";

export async function getBattleById(id: string): Promise<Battle> {
  return apiFetch<Battle>(`/api/battles/${id}`);
}

export async function getBattleByQuestId(questId: string): Promise<Battle> {
  return apiFetch<Battle>(`/api/battles/quest/${questId}`);
}
