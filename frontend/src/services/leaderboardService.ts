import { apiFetch } from "@/lib/api";
import type { LeaderboardEntry } from "@/types";

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  return apiFetch<LeaderboardEntry[]>("/api/leaderboard");
}
