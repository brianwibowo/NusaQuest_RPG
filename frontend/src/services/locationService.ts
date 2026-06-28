import { apiFetch } from "@/lib/api";
import type { Location } from "@/types";

export async function getLocations(category?: string): Promise<Location[]> {
  const path = category ? `/api/locations?category=${category}` : "/api/locations";
  return apiFetch<Location[]>(path);
}

export async function getLocationById(id: string): Promise<Location> {
  return apiFetch<Location>(`/api/locations/${id}`);
}
