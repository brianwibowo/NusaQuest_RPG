import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { usePlayer } from "@/context/PlayerContext";
import { LOCATIONS } from "@/data/locations";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { LocationCategory } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Info } from "lucide-react";
import L from "leaflet";

// Leaflet default icon fix for build configuration
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadowUrl from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function ExploreMapPage() {
  const { t } = useTranslation();
  const { player } = usePlayer();
  const lang = player.language || "id";

  const [activeFilter, setActiveFilter] = useState<LocationCategory | "all">("all");

  // Center coordinate of Jakarta
  const JAKARTA_CENTER: [number, number] = [-6.2088, 106.8456];

  // Filter locations by category
  const filteredLocations = activeFilter === "all"
    ? LOCATIONS
    : LOCATIONS.filter((loc) => loc.category === activeFilter);

  // Helper to color categorize categories
  const getCategoryColor = (cat: LocationCategory) => {
    const colors: Record<LocationCategory, string> = {
      wisata_sejarah: "bg-blue-100 text-blue-800 border-blue-200",
      wisata_budaya: "bg-violet-100 text-violet-800 border-violet-200",
      wisata_kuliner: "bg-orange-100 text-orange-800 border-orange-200",
      ekowisata: "bg-emerald-100 text-emerald-800 border-emerald-200",
      umkm: "bg-amber-100 text-amber-800 border-amber-200",
      hidden_spot: "bg-slate-100 text-slate-800 border-slate-200",
    };
    return colors[cat] || "bg-slate-100 text-slate-800";
  };

  return (
    <div className="space-y-4">
      {/* 1. Filter Badges */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          {t("map.filter")}
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Badge
            variant={activeFilter === "all" ? "default" : "outline"}
            onClick={() => setActiveFilter("all")}
            className="cursor-pointer text-[10px] font-bold h-7 flex-shrink-0"
          >
            {t("map.all_locations")}
          </Badge>
          {(["wisata_sejarah", "wisata_budaya", "wisata_kuliner", "ekowisata"] as LocationCategory[]).map((cat) => (
            <Badge
              key={cat}
              variant={activeFilter === cat ? "default" : "outline"}
              onClick={() => setActiveFilter(cat)}
              className="cursor-pointer text-[10px] font-bold h-7 flex-shrink-0"
            >
              {cat.replace("wisata_", "").replace("eko", "eco").toUpperCase()}
            </Badge>
          ))}
        </div>
      </div>

      {/* 2. Interactive Map Leaflet */}
      <Card className="overflow-hidden border-slate-100 shadow-md">
        <CardContent className="p-0">
          <div className="h-[360px] w-full z-10 relative">
            <MapContainer
              center={JAKARTA_CENTER}
              zoom={11}
              scrollWheelZoom={true}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredLocations.map((loc) => (
                <Marker
                  key={loc.id}
                  position={[loc.latitude, loc.longitude]}
                  icon={defaultIcon}
                >
                  <Popup className="leaflet-custom-popup">
                    <div className="space-y-2 p-1 max-w-[200px]">
                      <div className="space-y-0.5">
                        <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider ${getCategoryColor(loc.category)}`}>
                          {loc.category.replace("wisata_", "").replace("eko", "eco")}
                        </span>
                        <h4 className="font-bold text-slate-800 text-xs mt-1 leading-snug">{loc.name[lang]}</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal line-clamp-2 font-medium">{loc.description[lang]}</p>
                      
                      {loc.questIds.length > 0 ? (
                        <Link
                          to="/quests"
                          className="flex items-center justify-center gap-1 w-full rounded-md bg-emerald-600 py-1 text-[9px] font-bold text-white hover:bg-emerald-700 transition-colors"
                        >
                          <Navigation className="h-3 w-3" />
                          <span>{t("map.view_quests")} ({loc.questIds.length})</span>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-1 justify-center text-[9px] font-bold text-slate-400 bg-slate-50 py-1 rounded border border-slate-100">
                          <Info className="h-3 w-3" />
                          <span>No Quests</span>
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* 3. Nearby Locations list preview */}
      <div className="space-y-2.5">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          {t("nav.explore")} ({filteredLocations.length})
        </span>
        <div className="flex flex-col gap-2.5">
          {filteredLocations.slice(0, 3).map((loc) => (
            <div key={loc.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{loc.name[lang]}</h4>
                  <span className="text-[9px] font-medium text-slate-400 block mt-0.5 truncate max-w-[200px]">
                    📍 {loc.address?.[lang] || "Jakarta"}
                  </span>
                </div>
              </div>
              <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider whitespace-nowrap ${getCategoryColor(loc.category)}`}>
                {loc.category.replace("wisata_", "").replace("eko", "eco")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
