import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { usePlayer } from "@/context/PlayerContext";
import { getLocations } from "@/services/locationService";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { LocationCategory, Location } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Info } from "lucide-react";
import L from "leaflet";
import { useGeolocation } from "@/hooks/useGeolocation";
import { audioManager } from "@/lib/audio";
import { hapticsManager } from "@/lib/haptics";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// Custom Leaflet DivIcon helpers for clean RPG markers
const createCategoryIcon = (category: LocationCategory) => {
  const emojis: Record<LocationCategory, string> = {
    wisata_sejarah: "🏛️",
    wisata_budaya: "🎭",
    wisata_kuliner: "🍜",
    ekowisata: "🍃",
    umkm: "🛍️",
    hidden_spot: "✨",
  };

  const bgColors: Record<LocationCategory, string> = {
    wisata_sejarah: "bg-blue-500 border-blue-200",
    wisata_budaya: "bg-violet-500 border-violet-200",
    wisata_kuliner: "bg-orange-500 border-orange-200",
    ekowisata: "bg-emerald-500 border-emerald-200",
    umkm: "bg-amber-500 border-amber-200",
    hidden_spot: "bg-slate-500 border-slate-200",
  };

  const emoji = emojis[category] || "📍";
  const bg = bgColors[category] || "bg-emerald-500";

  return L.divIcon({
    html: `<div class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-md text-sm ${bg} hover:scale-110 transition-transform active:scale-95">${emoji}</div>`,
    className: "custom-div-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// Player Character Avatar GPS Marker Icon
const createPlayerIcon = (characterId: string | null) => {
  const avatars: Record<string, string> = {
    explorer: "🧭",
    cultural_guardian: "🛡️",
    culinary_hunter: "🍳",
    eco_warrior: "🌿",
    heritage_seeker: "🏛️",
    local_hero: "👥",
    treasure_seeker: "🔑",
  };
  const avatar = characterId ? (avatars[characterId] || "👤") : "👤";

  return L.divIcon({
    html: `<div class="relative flex items-center justify-center w-10 h-10 rounded-full border-2 border-white bg-slate-900 shadow-lg text-lg animate-bounce z-50">
             <span class="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20 animate-ping z-0"></span>
             <span class="relative z-10">${avatar}</span>
           </div>`,
    className: "player-gps-icon",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

export default function ExploreMapPage() {
  const { t } = useTranslation();
  const { player } = usePlayer();
  const lang = player.language || "id";

  const [locations, setLocations] = useState<Location[]>([]);
  const [activeFilter, setActiveFilter] = useState<LocationCategory | "all">("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getLocations()
      .then(setLocations)
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  // Track player coordinates via browser GPS
  const geo = useGeolocation();

  // Center coordinate of Jakarta
  const JAKARTA_CENTER: [number, number] = [-6.2088, 106.8456];

  // Filter locations by category
  const filteredLocations = activeFilter === "all"
    ? locations
    : locations.filter((loc) => loc.category === activeFilter);

  const handleFilterClick = (cat: LocationCategory | "all") => {
    audioManager.playClick();
    hapticsManager.triggerClick();
    setActiveFilter(cat);
  };

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

  if (isLoading) {
    return <LoadingSpinner message={player.language === "id" ? "Memuat peta petualangan..." : "Loading adventure map..."} />;
  }

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
            onClick={() => handleFilterClick("all")}
            className="cursor-pointer text-[10px] font-bold h-7 flex-shrink-0"
          >
            {t("map.all_locations")}
          </Badge>
          {(["wisata_sejarah", "wisata_budaya", "wisata_kuliner", "ekowisata"] as LocationCategory[]).map((cat) => (
            <Badge
              key={cat}
              variant={activeFilter === cat ? "default" : "outline"}
              onClick={() => handleFilterClick(cat)}
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
              {/* Premium cartography theme tiles */}
              <TileLayer
                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />

              {/* Real-time Player Avatar GPS Marker */}
              {geo.loaded && geo.coordinates && (
                <Marker
                  position={[geo.coordinates.lat, geo.coordinates.lng]}
                  icon={createPlayerIcon(player.selectedCharacterId)}
                >
                  <Popup>
                    <div className="p-1 text-center">
                      <span className="text-[10px] font-extrabold text-emerald-600 block uppercase tracking-wider">Posisi Kamu</span>
                      <span className="text-xs font-bold text-slate-800">{player.name}</span>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Destinasi Wisata Quest Markers */}
              {filteredLocations.map((loc) => (
                <Marker
                  key={loc.id}
                  position={[loc.latitude, loc.longitude]}
                  icon={createCategoryIcon(loc.category)}
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
