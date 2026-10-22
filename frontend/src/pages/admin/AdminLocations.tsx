import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, MapPin, Loader2, Search, ChevronLeft, ChevronRight, Check, HelpCircle, BookOpen, Compass, Utensils, Leaf, Store, Sparkles, ExternalLink, X, ChevronDown, Eye } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import FieldGroup from "@/components/admin/FieldGroup";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { getCategoryStyle } from "@/lib/categoryHelper";

interface LocationItem {
  id: string;
  nameId: string;
  nameEn: string;
  descId: string;
  descEn: string;
  category: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  addressId?: string;
  addressEn?: string;
}

const ITEMS_PER_PAGE = 9;
const DEFAULT_CENTER: [number, number] = [-6.1754, 106.8272]; // Monas, Jakarta

// Custom Leaflet DivIcon for red pointer selector
const customPinIcon = L.divIcon({
  html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-rose-600 border-2 border-white shadow-lg text-white text-sm font-bold animate-bounce">📍</div>`,
  className: "custom-div-icon",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Map Recenter Component
function MapRecenter({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, 14);
  }, [position, map]);
  return null;
}

// Map Click Handler Component
function MapClickSelector({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Draggable Marker Component
function DraggableMarker({
  position,
  onPositionChange,
}: {
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
}) {
  const markerRef = useRef<any>(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          onPositionChange(latLng.lat, latLng.lng);
        }
      },
    }),
    [onPositionChange]
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      icon={customPinIcon}
      ref={markerRef}
    />
  );
}

export default function AdminLocations() {
  const toast = useToast();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LocationItem | null>(null);

  // Stepper State
  const [formStep, setFormStep] = useState(1);

  // Filter & Page State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  // UX & UAT Enhancement States
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [wasValidated, setWasValidated] = useState(false);
  const [viewLoc, setViewLoc] = useState<LocationItem | null>(null);
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [mapSearching, setMapSearching] = useState(false);

  // Feature Onboarding Tour States
  const [tourActiveStep, setTourActiveStep] = useState<number | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  const tourSteps = [
    {
      title: "Selamat Datang di Kelola Lokasi! 🗺️",
      content: "Tur singkat ini akan memandu Anda secara interaktif memahami fitur-fitur utama di halaman Kelola Lokasi Wisata. Klik 'Selanjutnya' untuk memulai!",
      selector: null
    },
    {
      title: "Pencarian & Filter Kategori 🔍",
      content: "Gunakan panel filter ini untuk memotong list lokasi: ketik nama tempat untuk pencarian teks secara instan atau pilih kategori wisata untuk menyaring data.",
      selector: "#filter-bar"
    },
    {
      title: "Tambah Destinasi Baru ➕",
      content: "Klik tombol ini untuk mendaftarkan destinasi wisata baru. Di dalam form, Anda dapat mencari alamat otomatis di peta Leaflet, memosisikan pin GPS, serta mengunggah berkas foto (termasuk konversi otomatis format Apple HEIC/HEIF ke JPEG).",
      selector: "#add-location-btn"
    },
    {
      title: "Daftar Lokasi Wisata 🗺️",
      content: "Destinasi wisata yang terdaftar ditampilkan di sini. Anda dapat mengubah data, menghapus lewat dialog kustom, atau mengeklik cover foto untuk melihat pratinjau resolusi penuh.",
      selector: "#locations-grid"
    },
    {
      title: "Tur Selesai! 🎉",
      content: "Sekarang Anda siap mengelola destinasi wisata SinopiQuest dengan efisien. Selamat bekerja!",
      selector: null
    }
  ];

  useEffect(() => {
    // Remove previous highlighted class
    const prevHighlighted = document.querySelectorAll(".tour-highlighted");
    prevHighlighted.forEach(el => el.classList.remove("tour-highlighted"));

    if (tourActiveStep === null) {
      return;
    }

    const step = tourSteps[tourActiveStep];

    // Wait slightly for DOM rendering
    const timer = setTimeout(() => {
      if (step.selector) {
        const element = document.querySelector(step.selector);
        if (element) {
          element.classList.add("tour-highlighted");
          const rect = element.getBoundingClientRect();

          // Position tooltip below element (or above if not enough viewport room)
          const showAbove = rect.bottom + 260 > window.innerHeight;
          const topPos = showAbove
            ? rect.top - 240 + window.scrollY
            : rect.bottom + 12 + window.scrollY;

          setTooltipStyle({
            position: "absolute",
            top: `${topPos}px`,
            left: `${Math.max(16, Math.min(window.innerWidth - 380, rect.left + window.scrollX))}px`,
            zIndex: 9999,
            width: "350px",
            transition: "all 0.3s ease-in-out"
          });

          element.scrollIntoView({ block: "center", behavior: "smooth" });
          return;
        }
      }

      // Default centered overlay styling
      setTooltipStyle({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 9999,
        width: "350px",
        transition: "all 0.3s ease-in-out"
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      const highlighted = document.querySelectorAll(".tour-highlighted");
      highlighted.forEach(el => el.classList.remove("tour-highlighted"));
    };
  }, [tourActiveStep]);

  // Form Fields
  const [nameId, setNameId] = useState("");
  const [descId, setDescId] = useState("");
  const [category, setCategory] = useState("wisata_sejarah");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [addressId, setAddressId] = useState("");
  const [uploading, setUploading] = useState(false);

  const categories = [
    { value: "wisata_sejarah", label: "Wisata Sejarah", color: "bg-rose-600" },
    { value: "wisata_budaya", label: "Wisata Budaya", color: "bg-amber-600" },
    { value: "wisata_kuliner", label: "Wisata Kuliner", color: "bg-orange-600" },
    { value: "ekowisata", label: "Ecowisata", color: "bg-emerald-600" },
    { value: "umkm", label: "UMKM Mitra", color: "bg-indigo-600" },
    { value: "hidden_spot", label: "Hidden Spot", color: "bg-slate-700" },
  ];

  const stepLabels = [
    { num: 1, title: "Informasi Utama" },
    { num: 2, title: "Peta & Media" },
  ];

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/locations");
      const data = await res.json();
      setLocations(data);
    } catch (err) {
      console.error("Gagal memuat data lokasi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormStep(1);
    setWasValidated(false);
    setNameId("");
    setDescId("");
    setCategory("wisata_sejarah");
    setLatitude("-6.1754"); // Default center Monas
    setLongitude("106.8272");
    setImageUrl("");
    setAddressId("");
    setMapSearchQuery("");
    setIsOpen(true);
  };

  const handleOpenEdit = (item: LocationItem) => {
    setEditingItem(item);
    setFormStep(1);
    setWasValidated(false);
    setNameId(item.nameId);
    setDescId(item.descId);
    setCategory(item.category);
    setLatitude(item.latitude.toString());
    setLongitude(item.longitude.toString());
    setImageUrl(item.imageUrl || "");
    setAddressId(item.addressId || "");
    setMapSearchQuery("");
    setIsOpen(true);
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    let fileToUpload = file;
    const isHeic = file.name.toLowerCase().endsWith(".heic") || file.name.toLowerCase().endsWith(".heif");

    if (isHeic) {
      toast.info("Mengonversi berkas HEIC/HEIF ke JPEG...");
      try {
        const { convertHeicToJpeg } = await import("@/lib/imageHelper");
        fileToUpload = await convertHeicToJpeg(file);
      } catch (err) {
        console.error(err);
        toast.error("Gagal mengonversi gambar HEIC. Harap gunakan format JPG/PNG.");
        setUploading(false);
        return;
      }
    }

    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("entity", "locations");

    const token = localStorage.getItem("sinopiquest_token");

    try {
      const res = await fetch("/api/uploads", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setImageUrl(data.url);
      toast.success("Gambar berhasil diunggah!");
    } catch {
      toast.error("Gagal mengunggah gambar");
    } finally {
      setUploading(false);
    }
  };

  // Reverse Geocoding using free Nominatim API
  const handleReverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await res.json();
      if (data && data.display_name) {
        setAddressId(data.display_name);
      }
    } catch (err) {
      console.warn("Reverse geocode failed:", err);
    }
  };

  // Forward Geocoding Search using Nominatim API
  const handleMapSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapSearchQuery.trim()) return;

    setMapSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(mapSearchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setLatitude(parseFloat(lat).toFixed(6));
        setLongitude(parseFloat(lon).toFixed(6));
        setAddressId(display_name);
        toast.success("Lokasi ditemukan!");
      } else {
        toast.error("Lokasi tidak ditemukan di peta.");
      }
    } catch {
      toast.error("Gagal menghubungi layanan pencarian peta.");
    } finally {
      setMapSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWasValidated(true);

    if (formStep < 2) {
      if (!nameId.trim() || !descId.trim()) {
        toast.error("Harap lengkapi informasi utama terlebih dahulu!");
        return;
      }
      setFormStep(2);
      return;
    }

    if (!latitude.trim() || !longitude.trim()) {
      toast.error("Harap tentukan koordinat lokasi di peta!");
      return;
    }

    const token = localStorage.getItem("sinopiquest_token");
    const payload = {
      nameId,
      descId,
      category,
      latitude: parseFloat(latitude) || 0,
      longitude: parseFloat(longitude) || 0,
      imageUrl,
      addressId,
    };

    const method = editingItem ? "PUT" : "POST";
    const url = editingItem ? `/api/locations/${editingItem.id}` : "/api/locations";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Request failed");
      setIsOpen(false);
      toast.success(editingItem ? "Data lokasi berhasil diperbarui!" : "Lokasi baru berhasil ditambahkan!");
      fetchLocations();
    } catch {
      toast.error("Gagal menyimpan data lokasi");
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("sinopiquest_token");

    try {
      const res = await fetch(`/api/locations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");
      toast.success("Lokasi berhasil dihapus!");
      fetchLocations();
    } catch {
      toast.error("Gagal menghapus lokasi");
    }
  };

  // ── Filter and Pagination ──
  const filteredLocs = locations.filter((loc) => {
    const matchSearch = !searchQuery ||
      loc.nameId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = !filterCategory || loc.category === filterCategory;
    return matchSearch && matchCat;
  });

  const totalPages = Math.max(1, Math.ceil(filteredLocs.length / ITEMS_PER_PAGE));
  const paginatedLocs = filteredLocs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getCatLabel = (val: string) => categories.find(c => c.value === val)?.label || val;

  const getCatIcon = (cat: string) => {
    switch (cat) {
      case "wisata_sejarah":
        return <BookOpen className="h-3 w-3 mr-1 shrink-0" />;
      case "wisata_budaya":
        return <Compass className="h-3 w-3 mr-1 shrink-0" />;
      case "wisata_kuliner":
        return <Utensils className="h-3 w-3 mr-1 shrink-0" />;
      case "ekowisata":
        return <Leaf className="h-3 w-3 mr-1 shrink-0" />;
      case "umkm":
        return <Store className="h-3 w-3 mr-1 shrink-0" />;
      default:
        return <Sparkles className="h-3 w-3 mr-1 shrink-0" />;
    }
  };

  // Reusable input classes with wasValidated styling support
  const inputClass = "h-10 text-sm border-slate-200 bg-white text-slate-800 focus-visible:ring-emerald-500 font-normal rounded-xl placeholder:text-slate-400";
  const selectClass = "w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:outline-none font-normal transition-all";
  const textareaClass = "w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-normal focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:outline-none resize-none transition-all";

  // Compute map center position securely
  const mapCenterPosition = useMemo((): [number, number] => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      return [lat, lng];
    }
    return DEFAULT_CENTER;
  }, [latitude, longitude]);

  const handleSelectMapPosition = (lat: number, lng: number) => {
    setLatitude(lat.toFixed(6));
    setLongitude(lng.toFixed(6));
    handleReverseGeocode(lat, lng);
  };

  return (
    <div className="space-y-5 text-left animate-in fade-in duration-300">
      {/* Dynamic onboarding highlight styles */}
      <style>{`
        @keyframes tour-pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .tour-highlighted {
          position: relative !important;
          z-index: 9999 !important;
          background-color: white !important;
          pointer-events: none !important;
          border-color: #10b981 !important;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.4) !important;
          animation: tour-pulse 2.2s infinite !important;
          border-radius: 12px;
        }
        /* Make sure highlighted Leaflet map zoom controls don't overlap awkwardly */
        #map-container-group.tour-highlighted {
          background-color: transparent !important;
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center gap-4 w-full">
          <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Kelola Lokasi Wisata</h2>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              onClick={() => setTourActiveStep(0)}
              variant="outline"
              className="h-9 w-9 sm:h-10 sm:w-10 p-0 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm transition-all flex items-center justify-center cursor-pointer"
              title="Mulai Tur Fitur"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button
              id="add-location-btn"
              type="button"
              onClick={handleOpenAdd}
              className="h-9 sm:h-10 px-3.5 sm:px-5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm transition-all hover:shadow-md cursor-pointer"
            >
              <Plus className="h-4 w-4" strokeWidth={3} />
              <span>Tambah Lokasi</span>
            </Button>
          </div>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-normal leading-relaxed">
          Kelola data destinasi, marker GPS, dan koordinat peta secara interaktif.
        </p>
      </div>

      {/* Filter Bar */}
      <div id="filter-bar" className="grid grid-cols-5 gap-2.5 sm:gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors duration-200">
        <div className="relative col-span-3">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama lokasi..."
            className="h-10 pl-9 text-xs border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-white focus-visible:ring-emerald-500 font-normal placeholder:text-slate-400 rounded-full"
          />
        </div>
        <div className="relative col-span-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full h-10 pl-3 sm:pl-4 pr-8 sm:pr-10 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:outline-none font-normal transition-all cursor-pointer appearance-none"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.value} value={c.value} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{c.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 sm:right-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-normal px-1">
        Menampilkan <span className="font-semibold text-slate-600 dark:text-slate-300">{paginatedLocs.length}</span> dari {filteredLocs.length} lokasi
      </p>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col justify-between shadow-sm rounded-2xl animate-pulse">
              <div>
                <div className="h-44 bg-slate-105 dark:bg-slate-800 w-full" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-slate-200/70 dark:bg-slate-800 rounded-lg w-2/3" />
                  <div className="h-3 bg-slate-200/70 dark:bg-slate-800 rounded-lg w-1/3" />
                  <div className="space-y-2 pt-2">
                    <div className="h-3 bg-slate-200/70 dark:bg-slate-800 rounded-lg w-full" />
                    <div className="h-3 bg-slate-200/70 dark:bg-slate-800 rounded-lg w-[90%]" />
                    <div className="h-3 bg-slate-200/70 dark:bg-slate-800 rounded-lg w-[70%]" />
                  </div>
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                    <div className="h-3 bg-slate-200/70 dark:bg-slate-800 rounded-lg w-1/4" />
                    <div className="h-3 bg-slate-200/70 dark:bg-slate-800 rounded-lg w-1/4" />
                  </div>
                </div>
              </div>
              <div className="p-5 pt-0 flex gap-2">
                <div className="h-9 bg-slate-100 dark:bg-slate-800 rounded-lg flex-1" />
                <div className="h-9 bg-slate-100 dark:bg-slate-800 rounded-lg flex-1" />
              </div>
            </div>
          ))}
        </div>
      ) : paginatedLocs.length === 0 ? (
        <div className="py-16 px-4 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/85 dark:border-slate-800 shadow-sm max-w-md mx-auto my-8 flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-400 shadow-inner">
            <MapPin className="h-7 w-7 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="space-y-1.5 max-w-xs">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              {searchQuery || filterCategory ? "Lokasi Tidak Ditemukan" : "Belum Ada Lokasi"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
              {searchQuery || filterCategory
                ? "Tidak ada destinasi yang cocok dengan kata kunci pencarian atau filter kategori Anda."
                : "Daftar lokasi wisata masih kosong. Mulai tambahkan dengan mengeklik tombol di atas."}
            </p>
          </div>
          {(searchQuery || filterCategory) && (
            <Button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setFilterCategory("");
              }}
              variant="outline"
              className="h-9 px-4 text-xs font-semibold border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 rounded-full transition-all cursor-pointer shadow-xs"
            >
              Reset Filter & Pencarian
            </Button>
          )}
        </div>
      ) : (
        <div id="locations-grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginatedLocs.map((loc) => {
            const isBroken = !!brokenImages[loc.id];
            return (
              <div key={loc.id} className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-300 relative group rounded-2xl">
                <div>
                  <div
                    onClick={() => loc.imageUrl && !isBroken && setPreviewImageUrl(loc.imageUrl)}
                    className={`h-44 bg-gradient-to-br from-slate-100 to-slate-50 relative overflow-hidden ${loc.imageUrl && !isBroken ? "cursor-zoom-in" : ""
                      }`}
                  >
                    {loc.imageUrl && !isBroken ? (
                      <img
                        src={loc.imageUrl}
                        alt={loc.nameId}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={() => setBrokenImages(prev => ({ ...prev, [loc.id]: true }))}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <MapPin className="h-10 w-10 animate-pulse" />
                      </div>
                    )}

                    {/* Glassmorphic Category Badge */}
                    <span className={`absolute top-3 left-3 text-[8px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg shadow-md flex items-center backdrop-blur-md border z-10 ${getCategoryStyle(loc.category).glassBg}`}>
                      {getCatIcon(loc.category)}
                      {getCatLabel(loc.category)}
                    </span>
                    {/* View Detail button */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setViewLoc(loc); }}
                      className="absolute top-3 right-3 z-30 p-2 bg-white/95 dark:bg-slate-800 hover:bg-emerald-600 text-slate-600 dark:text-slate-300 hover:text-white rounded-full shadow-md border border-slate-100/50 dark:border-slate-700/50 hover:border-emerald-600 hover:scale-105 transition-all duration-200 cursor-pointer"
                      title="Lihat Detail Selengkapnya"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>

                    {/* Zoom Overlay Indicator */}
                    {loc.imageUrl && !isBroken && (
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 pointer-events-none z-10">
                        <span className="text-[9px] bg-white/95 text-slate-800 font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-auto">
                          🔍 Pratinjau Foto
                        </span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5 space-y-2.5">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{loc.nameId}</h3>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5 font-normal">{loc.nameEn}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 font-normal">
                      {loc.descId}
                    </p>

                    {/* Maps & Address Metadata */}
                    <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Buka koordinat di Google Maps"
                          className="text-[9px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 flex items-center gap-1 transition-colors"
                        >
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span>GPS: {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}</span>
                          <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                        </a>
                      </div>
                      {loc.addressId && (
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-normal line-clamp-1 flex items-center gap-1 leading-normal" title={loc.addressId}>
                          <span className="truncate">{loc.addressId}</span>
                        </p>
                      )}
                    </div>
                  </CardContent>
                </div>

                <div className="p-5 pt-0 flex gap-2">
                  <Button
                    onClick={() => handleOpenEdit(loc)}
                    variant="outline"
                    className="flex-1 h-9 text-xs font-semibold text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 bg-white dark:bg-slate-900 rounded-lg"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Ubah</span>
                  </Button>
                  <Button
                    onClick={() => setDeleteConfirmId(loc.id)}
                    variant="ghost"
                    className="flex-1 h-9 text-xs font-semibold text-red-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-1.5 rounded-lg"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Hapus</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination (Always rendered when matching data exists) */}
      {filteredLocs.length > 0 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="h-9 text-xs font-semibold border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1 rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all ${page === currentPage
                  ? "bg-emerald-600 text-white shadow-sm font-bold"
                  : "text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
              >
                {page}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="h-9 text-xs font-semibold border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1 rounded-xl"
          >
            <span className="hidden sm:inline">Selanjutnya</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Dialog Form */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-white border border-slate-200/80 text-slate-800 w-[92%] sm:max-w-xl overflow-y-auto max-h-[90vh] rounded-2xl shadow-2xl p-0 gap-0">
          <DialogHeader className="px-6 sm:px-8 pt-6 pb-0">
            <DialogTitle className="text-lg font-black text-slate-800 tracking-tight">
              {editingItem ? "Ubah Lokasi Wisata" : "Tambah Lokasi Wisata Baru"}
            </DialogTitle>
          </DialogHeader>

          {/* Stepper Progress */}
          <div className="px-6 sm:px-8 pt-5 pb-3">
            <div className="flex items-center gap-0">
              {stepLabels.map((s, i) => (
                <div key={s.num} className="flex items-center flex-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (s.num === 2 && (!nameId.trim() || !descId.trim())) {
                        toast.error("Harap isi informasi utama sebelum membuka peta!");
                        return;
                      }
                      setFormStep(s.num);
                    }}
                    className={`flex items-center gap-2 transition-all ${formStep === s.num ? "opacity-100" : formStep > s.num ? "opacity-70" : "opacity-30"
                      }`}
                  >
                    <span className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold transition-all ${formStep > s.num
                      ? "bg-emerald-600 text-white"
                      : formStep === s.num
                        ? "bg-emerald-600 text-white ring-[3px] ring-emerald-100"
                        : "bg-slate-100 text-slate-400"
                      }`}>
                      {formStep > s.num ? <Check className="h-4 w-4" /> : s.num}
                    </span>
                    <span className={`text-xs hidden sm:inline ${formStep === s.num ? "font-bold text-slate-800" : "font-normal text-slate-400"
                      }`}>
                      {s.title}
                    </span>
                  </button>
                  {i < stepLabels.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-3 rounded-full transition-all ${formStep > s.num ? "bg-emerald-400" : "bg-slate-100"
                      }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 sm:px-8 pb-6">

            {/* Step 1: Info Utama */}
            {formStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <p className="text-xs text-slate-400 font-normal">Tentukan identitas dasar, kategori, dan deskripsi destinasi.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldGroup label="Nama Destinasi (Indonesia)" required>
                    <Input
                      value={nameId}
                      onChange={(e) => setNameId(e.target.value)}
                      placeholder="contoh: Setu Babakan Jagakarsa"
                      required
                      className={`${inputClass} ${wasValidated && !nameId.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                  </FieldGroup>
                  <FieldGroup label="Kategori Wisata">
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </FieldGroup>
                </div>

                <div id="foto-upload-group" className="flex flex-col space-y-2">
                  <FieldGroup label="Upload Foto Destinasi" hint="Unggah gambar daya tarik destinasi">
                    <div className="relative">
                      <Input type="file" accept="image/*" onChange={handleUploadImage} disabled={uploading}
                        className="h-10 text-sm border-slate-200 bg-white text-slate-800 font-normal rounded-xl file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700"
                      />
                      {uploading && <Loader2 className="absolute right-3 top-3 h-4 w-4 text-emerald-500 animate-spin" />}
                    </div>
                  </FieldGroup>
                  {imageUrl && (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 w-full group">
                      <img
                        src={imageUrl}
                        alt="Pratinjau Destinasi"
                        className="h-32 w-full object-cover select-none cursor-zoom-in hover:opacity-90 transition-opacity"
                        onClick={() => setPreviewImageUrl(imageUrl)}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity duration-200 pointer-events-none">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImageUrl(imageUrl);
                          }}
                          className="h-8 px-3 text-[10px] font-bold bg-white/95 text-slate-800 hover:bg-white rounded-lg shadow-sm cursor-pointer pointer-events-auto"
                        >
                          Lihat Penuh 🔍
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImageUrl("");
                          }}
                          className="h-8 px-3 text-[10px] font-bold bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-sm cursor-pointer pointer-events-auto"
                        >
                          Hapus Foto
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-full">
                  <FieldGroup label="Deskripsi (Indonesia)" required>
                    <textarea
                      value={descId}
                      onChange={(e) => setDescId(e.target.value)}
                      placeholder="Tuliskan cerita singkat destinasi..."
                      required
                      rows={4}
                      className={`${textareaClass} ${wasValidated && !descId.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                  </FieldGroup>
                </div>
              </div>
            )}

            {/* Step 2: Peta & Media */}
            {formStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">

                {/* Geocoding Address Search */}
                <div id="map-search-group" className="space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Cari Lokasi / Alamat di Peta</label>
                  <div className="flex gap-2">
                    <Input
                      value={mapSearchQuery}
                      onChange={(e) => setMapSearchQuery(e.target.value)}
                      placeholder="Masukkan nama tempat (misal: Candi Borobudur, Monas)"
                      className="flex-1 h-10 text-sm border-slate-200 bg-white text-slate-800 rounded-xl"
                      onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                    />
                    <Button
                      type="button"
                      onClick={handleMapSearch}
                      disabled={mapSearching}
                      className="h-10 px-4 text-xs font-semibold bg-slate-800 text-white rounded-xl flex items-center gap-1.5 shrink-0"
                    >
                      {mapSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      <span>Cari</span>
                    </Button>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 font-normal">Klik pada peta atau geser penanda merah. Alamat rinci akan terisi secara otomatis.</p>

                {/* Leaflet Interactive Selector Map */}
                <div id="map-container-group" className="h-[220px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative z-10">
                  <MapContainer
                    center={mapCenterPosition}
                    zoom={13}
                    scrollWheelZoom={true}
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      maxZoom={19}
                    />
                    <MapRecenter position={mapCenterPosition} />
                    <MapClickSelector onSelect={handleSelectMapPosition} />
                    <DraggableMarker position={mapCenterPosition} onPositionChange={handleSelectMapPosition} />
                  </MapContainer>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <FieldGroup label="Latitude (Google Maps)" hint="Terisi otomatis setelah memilih di peta" required>
                    <Input
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="contoh: -6.3407"
                      required
                      className={`${inputClass} ${wasValidated && !latitude ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                  </FieldGroup>
                  <FieldGroup label="Longitude (Google Maps)" hint="Terisi otomatis setelah memilih di peta" required>
                    <Input
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="contoh: 106.8274"
                      required
                      className={`${inputClass} ${wasValidated && !longitude ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                  </FieldGroup>
                </div>

                <div className="w-full">
                  <FieldGroup label="Alamat Rinci (Indonesia)" hint="Terisi otomatis dari penanda peta">
                    <textarea
                      value={addressId}
                      onChange={(e) => setAddressId(e.target.value)}
                      placeholder="contoh: Jl. Moch. Kahfi II, Jagakarsa"
                      rows={2}
                      className={textareaClass}
                    />
                  </FieldGroup>
                </div>

                {imageUrl && (
                  <div className="mt-4 space-y-2">
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Preview Foto Destinasi</label>
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 w-full">
                      <img
                        src={imageUrl}
                        alt="Pratinjau Destinasi"
                        className="h-36 w-full object-cover select-none cursor-zoom-in hover:opacity-95 transition-opacity"
                        onClick={() => setPreviewImageUrl(imageUrl)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setPreviewImageUrl(imageUrl)}
                        className="h-9 px-4 text-xs font-semibold text-slate-600 border-slate-200 hover:bg-slate-50 bg-white rounded-xl flex-1 cursor-pointer"
                      >
                        Lihat Penuh 🔍
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => setImageUrl("")}
                        className="h-9 px-4 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl flex-1 cursor-pointer"
                      >
                        Hapus Foto
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Footer Navigation */}
            <DialogFooter className="pt-6 flex justify-between gap-2 border-t border-slate-100 mt-6">
              <div>
                {formStep > 1 && (
                  <Button type="button" variant="outline" onClick={() => setFormStep(s => s - 1)}
                    className="h-10 text-xs font-semibold text-slate-600 border-slate-200 hover:bg-slate-50 bg-white flex items-center gap-1 rounded-xl"
                  >
                    <ChevronLeft className="h-4 w-4" /> Sebelumnya
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}
                  className="h-10 text-xs font-semibold text-slate-500 border-slate-200 hover:bg-slate-50 bg-white rounded-xl"
                >
                  Batal
                </Button>
                {formStep < 2 && (
                  <Button
                    key="btn-next"
                    type="button"
                    onClick={() => {
                      if (!nameId.trim() || !descId.trim()) {
                        setWasValidated(true);
                        toast.error("Harap lengkapi semua kolom wajib!");
                        return;
                      }
                      setFormStep(2);
                    }}
                    className="h-10 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1 rounded-xl"
                  >
                    Selanjutnya <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
                {formStep === 2 && (
                  <Button
                    key="btn-submit"
                    type="submit"
                    disabled={uploading}
                    className="h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm rounded-xl"
                  >
                    {uploading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                    Simpan Destinasi
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail View Modal */}
      <Dialog open={!!viewLoc} onOpenChange={(open) => !open && setViewLoc(null)}>
        {viewLoc && (
          <DialogContent className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-white w-[92%] sm:max-w-lg overflow-y-auto max-h-[90vh] rounded-2xl shadow-2xl p-6 text-left">
            <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <DialogTitle className="text-base font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                <span>Detail Destinasi Wisata</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs">
              {/* Gambar Banner */}
              {viewLoc.imageUrl ? (
                <img src={viewLoc.imageUrl} alt={viewLoc.nameId} className="h-48 w-full object-cover rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm" />
              ) : (
                <div className="h-44 w-full bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500">
                  Tidak ada foto destinasi
                </div>
              )}

              {/* Info Utama */}
              <div className="space-y-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">{viewLoc.nameId}</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{viewLoc.id}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block font-normal">Kategori</span>
                    <span className={`inline-flex items-center gap-1 text-[9px] font-semibold text-white px-2 py-0.5 rounded-md mt-0.5 ${getCategoryStyle(viewLoc.category).solidBg}`}>
                      {getCatIcon(viewLoc.category)}
                      {getCatLabel(viewLoc.category)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block font-normal">Koordinat GPS</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mt-0.5">{viewLoc.latitude.toFixed(6)}, {viewLoc.longitude.toFixed(6)}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 dark:text-slate-500 block font-normal">Alamat Destinasi</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mt-0.5 leading-relaxed">{viewLoc.addressId || "Tidak ada alamat terdaftar"}</span>
                  </div>
                </div>
              </div>

              {/* Deskripsi Lokasi */}
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 space-y-1">
                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-[10px] uppercase tracking-wider">📋 Deskripsi Destinasi</h4>
                <p className="text-slate-600 dark:text-slate-400 font-normal leading-relaxed">{viewLoc.descId}</p>
              </div>

              {/* Google Maps Link */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${viewLoc.latitude},${viewLoc.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-full h-10 px-4 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all duration-200"
              >
                <span>Buka di Google Maps</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
              <Button type="button" onClick={() => setViewLoc(null)} className="h-9 px-4 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-semibold cursor-pointer">
                Tutup Detail
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Premium Lightbox Overlay */}
      {previewImageUrl && (
        <div
          onClick={() => setPreviewImageUrl(null)}
          className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out animate-in fade-in duration-200"
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <img
              src={previewImageUrl}
              alt="Pratinjau Lokasi"
              className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/10 select-none animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-all shadow-md text-lg font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-white w-[92%] sm:max-w-sm rounded-2xl p-6 shadow-2xl text-left">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-slate-800 dark:text-white tracking-tight">Hapus Lokasi Wisata?</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
              Apakah Anda yakin ingin menghapus data lokasi ini? Semua relasi seperti cerita pembuka atau UMKM yang terikat akan terpengaruh. Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
          <DialogFooter className="pt-4 flex gap-2 border-t border-slate-100 dark:border-slate-800 mt-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              className="h-9 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 rounded-xl"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (deleteConfirmId) {
                  handleDelete(deleteConfirmId);
                  setViewLoc(null);
                  setDeleteConfirmId(null);
                }
              }}
              className="h-9 px-4 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-sm"
            >
              Hapus Permanen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Feature Tour Overlay Modal */}
      {tourActiveStep !== null && (
        <>
          {/* Dark backdrop mask */}
          <div
            onClick={() => setTourActiveStep(null)}
            className="fixed inset-0 bg-black/60 z-[9998] backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
          />
          {/* Floating guide card positioned next to highlighted element */}
          <div
            style={tooltipStyle}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-white rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-left space-y-4 z-[9999]"
          >
            {/* Header / Step counter */}
            <div className="flex justify-between items-center">
              <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                Petunjuk {tourActiveStep + 1} dari {tourSteps.length}
              </span>
              <button
                type="button"
                onClick={() => setTourActiveStep(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all p-1 rounded-full cursor-pointer flex items-center justify-center"
                title="Tutup Tur"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Title & Content */}
            <div className="space-y-2">
              <h3 className="text-sm font-black text-slate-800 dark:text-white leading-snug">{tourSteps[tourActiveStep].title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">{tourSteps[tourActiveStep].content}</p>
            </div>

            {/* Action buttons */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="ghost"
                disabled={tourActiveStep === 0}
                onClick={() => setTourActiveStep(prev => prev! - 1)}
                className="h-8 px-3 text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Sebelumnya
              </Button>
              <div className="flex gap-2">
                {tourActiveStep < tourSteps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={() => setTourActiveStep(prev => prev! + 1)}
                    className="h-8 px-3 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm cursor-pointer"
                  >
                    Selanjutnya
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setTourActiveStep(null)}
                    className="h-8 px-3 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm cursor-pointer"
                  >
                    Selesai
                  </Button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
