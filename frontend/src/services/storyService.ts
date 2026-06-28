import { apiFetch } from "@/lib/api";
import type { Story } from "@/types";

export async function getStories(): Promise<Story[]> {
  return apiFetch<Story[]>("/api/stories");
}

export async function getStoryById(id: string): Promise<Story> {
  return apiFetch<Story>(`/api/stories/${id}`);
}
