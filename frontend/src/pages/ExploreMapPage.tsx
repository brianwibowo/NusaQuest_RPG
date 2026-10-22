import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { usePlayer } from "@/context/PlayerContext";
import { getLocations } from "@/services/locationService";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { LocationCategory, Location } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Info, Store } from "lucide-react";
import L from "leaflet";
import { useGeolocation } from "@/hooks/useGeolocation";
import { audioManager } from "@/lib/audio";
import { hapticsManager } from "@/lib/haptics";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { getCategoryStyle } from "@/lib/categoryHelper";
import { calculateDistance } from "@/lib/geo";

// Custom Leaflet Recenter helper (with "woosh" cinematic zoom animation)
function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 12, {
      duration: 1.5,
      easeLinearity: 0.25
    });
  }, [center, map]);
  return null;
}

// Calculate bearing angle from coordinate A to coordinate B (0 = North, 90 = East, etc.)
const calculateAngle = (fromLat: number, fromLng: number, toLat: number, toLng: number) => {
  const dLng = toLng - fromLng;
  const y = Math.sin((dLng * Math.PI) / 180) * Math.cos((toLat * Math.PI) / 180);
  const x =
    Math.cos((fromLat * Math.PI) / 180) * Math.sin((toLat * Math.PI) / 180) -
    Math.sin((fromLat * Math.PI) / 180) *
      Math.cos((toLat * Math.PI) / 180) *
      Math.cos((dLng * Math.PI) / 180);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
};

// Calculate rectangular edge coordinates inside the map box using bearing angle
const getEdgeStyle = (angle: number): React.CSSProperties => {
  const standardAngle = 90 - angle;
  const rad = (standardAngle * Math.PI) / 180;

  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const absCos = Math.abs(cos);
  const absSin = Math.abs(sin);

  let scale = 1;
  if (absCos > 0.001 || absSin > 0.001) {
    scale = 1 / Math.max(absCos, absSin);
  }

  const x = cos * scale;
  const y = sin * scale;

  // Projects onto a rect border (Wiggle inside boundaries to keep it visible)
  const leftPercent = 50 + x * 43;
  const topPercent = 50 - y * 41;

  return {
    position: "absolute",
    left: `${leftPercent}%`,
    top: `${topPercent}%`,
    transform: "translate(-50%, -50%)",
    zIndex: 400
  };
};

// Custom Leaflet DivIcon helpers for clean RPG markers
const createCategoryIcon = (category: LocationCategory) => {
  const style = getCategoryStyle(category);
  const emoji = style.emoji || "📍";
  const bg = style.solidBg || "bg-emerald-500";

  return L.divIcon({
    html: `<div class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-md text-sm ${bg} text-white hover:scale-110 transition-transform active:scale-95">${emoji}</div>`,
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
  const [searchQuery, setSearchQuery] = useState("");
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

  // Center coordinate of Jakarta (Monas) & map center state
  const JAKARTA_CENTER: [number, number] = [-6.1754, 106.8272];
  const [mapCenter, setMapCenter] = useState<[number, number]>(JAKARTA_CENTER);

  // Filter locations by category and text search query
  const filteredLocations = locations.filter((loc) => {
    const matchesCategory = activeFilter === "all" || loc.category === activeFilter;
    const matchesSearch = (loc.name[lang] || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Center map on Jakarta initially
  useEffect(() => {
    setMapCenter(JAKARTA_CENTER);
  }, []);

  // Helper to extract city from location data
  const getCityFromLocation = (loc: Location): string => {
    const address = (loc.address?.id || loc.address?.en || "").toLowerCase();
    const name = (loc.name.id || loc.name.en || "").toLowerCase();

    if (address.includes("jakarta") || name.includes("jakarta")) return "Jakarta";
    if (address.includes("bandung") || name.includes("bandung")) return "Bandung";
    if (address.includes("semarang") || name.includes("semarang")) return "Semarang";
    if (address.includes("yogyakarta") || address.includes("jogja") || name.includes("yogyakarta") || name.includes("jogja")) return "Yogyakarta";
    if (address.includes("surabaya") || name.includes("surabaya")) return "Surabaya";
    if (address.includes("bogor") || name.includes("bogor")) return "Bogor";
    if (address.includes("tangerang") || name.includes("tangerang")) return "Tangerang";
    if (address.includes("depok") || name.includes("depok")) return "Depok";
    if (address.includes("bekasi") || name.includes("bekasi")) return "Bekasi";

    return lang === "id" ? "Lainnya" : "Other";
  };

  // Group locations by city/region to build quick jump shortcuts
  const citiesMap: Record<string, { count: number; firstLoc: Location }> = {};
  locations.forEach((loc) => {
    const city = getCityFromLocation(loc);
    if (!citiesMap[city]) {
      citiesMap[city] = { count: 0, firstLoc: loc };
    }
    citiesMap[city].count += 1;
  });

  const handleFilterClick = (cat: LocationCategory | "all") => {
    audioManager.playClick();
    hapticsManager.triggerClick();
    setActiveFilter(cat);
  };

  if (isLoading) {
    return <LoadingSpinner message={player.language === "id" ? "Memuat peta petualangan..." : "Loading adventure map..."} />;
  }

  return (
    <div className="space-y-4">
      {/* 1. Filter Badges & Search Input */}
      <div className="space-y-3">
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

        {/* Text Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder={lang === "id" ? "Cari nama destinasi..." : "Search destination..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
            className="w-full h-8 pl-8 pr-8 text-[10px] bg-white border border-slate-100 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold text-slate-800 placeholder-slate-400"
          />
          <svg
            className="absolute left-2.5 top-2 h-4 w-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2 text-[10px] font-black text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* City/Region Jump Selector */}
      {Object.keys(citiesMap).length > 1 && (
        <div className="space-y-1.5 pt-0.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Lompat ke Kota
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {Object.keys(citiesMap).map((cityName) => {
              const info = citiesMap[cityName];
              return (
                <Button
                  key={cityName}
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    audioManager.playClick();
                    hapticsManager.triggerClick();
                    setMapCenter([info.firstLoc.latitude, info.firstLoc.longitude]);
                  }}
                  className="h-8 px-3 text-[10px] font-bold border-rose-100 bg-rose-50/20 text-rose-700 hover:bg-rose-50 rounded-full flex-shrink-0 flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform cursor-pointer"
                >
                  <Navigation className="h-3 w-3 text-rose-500 fill-rose-500/10 rotate-45" />
                  <span>{cityName}</span>
                  <span className="h-4.5 min-w-4.5 px-1 rounded-full bg-rose-600 text-white font-extrabold flex items-center justify-center text-[9px] shadow-sm animate-pulse">
                    {info.count}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Interactive Map Leaflet */}
      <Card className="overflow-hidden border-slate-100 shadow-md bg-white">
        <CardContent className="p-0">
          <div className="h-[360px] w-full z-10 relative">
            <MapContainer
              center={mapCenter}
              zoom={12}
              scrollWheelZoom={true}
              className="h-full w-full"
            >
              <MapRecenter center={mapCenter} />
              {/* OpenStreetMap tiles (100% free, no API key required) */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
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
                    <div className="space-y-2.5 p-1 max-w-[220px]">
                      <div className="space-y-0.5">
                        <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider ${getCategoryStyle(loc.category).lightBg}`}>
                          {loc.category.replace("wisata_", "").replace("eko", "eco")}
                        </span>
                        <h4 className="font-bold text-slate-800 text-xs mt-1 leading-snug">{loc.name[lang]}</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal line-clamp-2 font-medium">{loc.description[lang]}</p>
                      
                      {/* Nearby/Related UMKM Section inside map popup */}
                      {(loc as any).umkms && (loc as any).umkms.length > 0 && (
                        <div className="pt-1.5 border-t border-slate-100 space-y-1 text-left">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">
                            Warung &amp; Toko Mitra
                          </span>
                          <div className="flex flex-col gap-0.5 max-h-[50px] overflow-y-auto pr-1">
                            {(loc as any).umkms.map((u: any) => (
                              <Link 
                                key={u.id}
                                to={`/umkm/${u.id}`}
                                className="text-[9px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                              >
                                <Store className="h-2.5 w-2.5 flex-shrink-0 text-emerald-500" />
                                <span className="truncate">{u.name}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {loc.questIds.length > 0 ? (
                        <Link
                          to={`/quests?locationId=${loc.id}`}
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

            {/* Out of bounds/Off-screen City Navigation Pointers overlay on the edges of the map box */}
            {Object.keys(citiesMap).map((cityName) => {
              const info = citiesMap[cityName];
              const firstLoc = info.firstLoc;
              
              // Calculate distance to determine if it is off-screen
              const distanceKm = calculateDistance(
                mapCenter[0],
                mapCenter[1],
                firstLoc.latitude,
                firstLoc.longitude
              ) / 1000;
              
              // Only display if the city is far enough (e.g. > 15km)
              if (distanceKm < 15) return null;

              const angle = calculateAngle(
                mapCenter[0],
                mapCenter[1],
                firstLoc.latitude,
                firstLoc.longitude
              );

              // Get absolute positioning along the map container edge
              const edgeStyle = getEdgeStyle(angle);

              return (
                <div
                  key={cityName}
                  style={edgeStyle}
                  onClick={() => {
                    audioManager.playClick();
                    hapticsManager.triggerClick();
                    setMapCenter([firstLoc.latitude, firstLoc.longitude]);
                  }}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  {/* Floating Circular Badge Pin */}
                  <div className="relative flex items-center justify-center h-8 w-8 rounded-full bg-white border border-slate-200/80 shadow-md hover:bg-slate-50 transition-all hover:scale-110 active:scale-95">
                    {/* Directional arrowhead (Navigation icon) */}
                    <Navigation 
                      className="h-4 w-4 text-rose-600 fill-rose-50" 
                      style={{ transform: `rotate(${angle - 45}deg)` }}
                    />

                    {/* Red counter badge showing number of places */}
                    <span className="absolute -top-1.5 -right-1.5 h-4.5 min-w-4.5 px-1 rounded-full bg-rose-600 text-white font-black flex items-center justify-center text-[9px] border border-white shadow-sm animate-pulse">
                      {info.count}
                    </span>
                  </div>
                  
                  {/* Hover city label */}
                  <span className="bg-slate-900/95 text-white text-[7px] font-bold px-1.5 py-0.5 rounded border border-slate-700/50 shadow shadow-slate-950/20 backdrop-blur-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                    {cityName}
                  </span>
                </div>
              );
            })}

            {/* Floating Recenter to Jakarta Button */}
            <Button
              size="icon"
              variant="secondary"
              onClick={() => {
                audioManager.playClick();
                hapticsManager.triggerClick();
                setMapCenter(JAKARTA_CENTER);
              }}
              className="absolute bottom-4 right-4 z-[400] rounded-full shadow-lg border border-slate-200 bg-white hover:bg-slate-50 h-9 w-9 flex items-center justify-center cursor-pointer"
              title={player.language === "id" ? "Pusatkan ke Jakarta" : "Center to Jakarta"}
            >
              <MapPin className="h-4.5 w-4.5 text-rose-600 fill-rose-600/10" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 3. Nearby Locations list preview */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {searchQuery 
              ? (lang === "id" ? `Hasil Pencarian (${filteredLocations.length})` : `Search Results (${filteredLocations.length})`)
              : `${t("map.all_locations")} (${filteredLocations.length})`}
          </span>
          {searchQuery && filteredLocations.length > 0 && (
            <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-widest flex items-center gap-0.5 animate-pulse">
              ✓ {lang === "id" ? "Ditemukan" : "Found"}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2.5">
          {filteredLocations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-1.5">
              <span className="text-xl">🔍</span>
              <p className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
                {lang === "id" ? "Destinasi Tidak Ditemukan" : "Destination Not Found"}
              </p>
              <p className="text-[9px] font-medium text-slate-400 max-w-[200px] leading-normal">
                {lang === "id" 
                  ? "Kata kunci atau kategori pencarian tidak cocok. Silakan coba cari destinasi lain!" 
                  : "No match for your search criteria. Please try another keyword!"}
              </p>
            </div>
          ) : (
            [...filteredLocations]
              .sort((a, b) => {
                if (geo.loaded && geo.coordinates) {
                  const distA = calculateDistance(geo.coordinates.lat, geo.coordinates.lng, a.latitude, a.longitude);
                  const distB = calculateDistance(geo.coordinates.lat, geo.coordinates.lng, b.latitude, b.longitude);
                  return distA - distB;
                }
                return 0;
              })
              .slice(0, 4)
              .map((loc) => {
                const distance = geo.loaded && geo.coordinates
                  ? (calculateDistance(geo.coordinates.lat, geo.coordinates.lng, loc.latitude, loc.longitude) / 1000).toFixed(1)
                  : null;

                return (
                  <div 
                    key={loc.id} 
                    onClick={() => {
                      audioManager.playClick();
                      hapticsManager.triggerClick();
                      setMapCenter([loc.latitude, loc.longitude]);
                    }}
                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-emerald-500 cursor-pointer transition-all active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-slate-800">{loc.name[lang]}</h4>
                        <span className="text-[9px] font-medium text-slate-400 block mt-0.5 truncate max-w-[200px]">
                          📍 {loc.address?.[lang] || (lang === "id" ? "Indonesia" : "Nusantara")} 
                          {distance && ` (${distance} km)`}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider whitespace-nowrap ${getCategoryStyle(loc.category).lightBg}`}>
                      {loc.category.replace("wisata_", "").replace("eko", "eco")}
                    </span>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}
