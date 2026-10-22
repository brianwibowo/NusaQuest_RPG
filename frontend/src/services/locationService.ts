import { apiFetch } from "@/lib/api";
import type { Location } from "@/types";
import { LOCATIONS } from "@/data/locations";

export async function getLocations(category?: string): Promise<Location[]> {
  try {
    const path = category ? `/api/locations?category=${category}` : "/api/locations";
    const data = await apiFetch<Location[]>(path);
    if (data && data.length > 0) return data;
    return LOCATIONS;
  } catch (err) {
    console.warn("Failed to fetch locations from backend, using fallback LOCATIONS:", err);
    return LOCATIONS;
  }
}

export async function getLocationById(id: string): Promise<Location> {
  try {
    return await apiFetch<Location>(`/api/locations/${id}`);
  } catch (err) {
    console.warn(`Failed to fetch location ${id} from backend, using fallback LOCATIONS:`, err);
    const fallback = LOCATIONS.find(l => l.id === id);
    if (fallback) return fallback;
    throw err;
  }
}
