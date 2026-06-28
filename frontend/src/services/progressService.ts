import { apiFetch } from "@/lib/api";

export async function saveProgress(data: any): Promise<any> {
  return apiFetch<any>("/api/progress", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loadProgress(): Promise<any> {
  return apiFetch<any>("/api/progress");
}
