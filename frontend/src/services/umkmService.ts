import { apiFetch } from "@/lib/api";
import type { Umkm } from "@/types";

export async function getUmkmList(): Promise<Umkm[]> {
  return apiFetch<Umkm[]>("/api/umkm");
}

export async function getUmkmById(id: string): Promise<Umkm> {
  return apiFetch<Umkm>(`/api/umkm/${id}`);
}
