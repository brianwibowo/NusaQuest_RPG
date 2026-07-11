import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, MapPin, Loader2, Search, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import FieldGroup from "@/components/admin/FieldGroup";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";

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
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [mapSearching, setMapSearching] = useState(false);

  // Form Fields
  const [nameId, setNameId] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descId, setDescId] = useState("");
  const [descEn, setDescEn] = useState("");
  const [category, setCategory] = useState("wisata_sejarah");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [addressId, setAddressId] = useState("");
  const [addressEn, setAddressEn] = useState("");
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
    setNameEn("");
    setDescId("");
    setDescEn("");
    setCategory("wisata_sejarah");
    setLatitude("-6.1754"); // Default center Monas
    setLongitude("106.8272");
    setImageUrl("");
    setAddressId("");
    setAddressEn("");
    setMapSearchQuery("");
    setIsOpen(true);
  };

  const handleOpenEdit = (item: LocationItem) => {
    setEditingItem(item);
    setFormStep(1);
    setWasValidated(false);
    setNameId(item.nameId);
    setNameEn(item.nameEn);
    setDescId(item.descId);
    setDescEn(item.descEn);
    setCategory(item.category);
    setLatitude(item.latitude.toString());
    setLongitude(item.longitude.toString());
    setImageUrl(item.imageUrl || "");
    setAddressId(item.addressId || "");
    setAddressEn(item.addressEn || "");
    setMapSearchQuery("");
    setIsOpen(true);
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
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
        setAddressEn(data.display_name);
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
        setAddressEn(display_name);
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
      if (!nameId.trim() || !nameEn.trim() || !descId.trim() || !descEn.trim()) {
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
      nameEn,
      descId,
      descEn,
      category,
      latitude: parseFloat(latitude) || 0,
      longitude: parseFloat(longitude) || 0,
      imageUrl,
      addressId,
      addressEn,
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
  const getCatColor = (val: string) => categories.find(c => c.value === val)?.color || "bg-slate-600";

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Kelola Lokasi Wisata</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-normal">Kelola data destinasi, marker GPS, dan koordinat peta secara interaktif.</p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="h-10 px-5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-2 shadow-sm transition-all hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Lokasi</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama lokasi..."
            className="h-10 pl-9 text-xs border-slate-200 bg-white text-slate-800 focus-visible:ring-emerald-500 font-normal placeholder:text-slate-400 rounded-xl"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:outline-none font-normal transition-all"
        >
          <option value="">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <p className="text-[11px] text-slate-400 font-normal px-1">
        Menampilkan <span className="font-semibold text-slate-600">{paginatedLocs.length}</span> dari {filteredLocs.length} lokasi
      </p>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-slate-200/80 bg-white overflow-hidden flex flex-col justify-between shadow-sm rounded-2xl animate-pulse">
              <div>
                <div className="h-44 bg-slate-100 w-full" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-slate-200/70 rounded-lg w-2/3" />
                  <div className="h-3 bg-slate-200/70 rounded-lg w-1/3" />
                  <div className="space-y-2 pt-2">
                    <div className="h-3 bg-slate-200/70 rounded-lg w-full" />
                    <div className="h-3 bg-slate-200/70 rounded-lg w-[90%]" />
                    <div className="h-3 bg-slate-200/70 rounded-lg w-[70%]" />
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex gap-4">
                    <div className="h-3 bg-slate-200/70 rounded-lg w-1/4" />
                    <div className="h-3 bg-slate-200/70 rounded-lg w-1/4" />
                  </div>
                </div>
              </div>
              <div className="p-5 pt-0 flex gap-2">
                <div className="h-9 bg-slate-100 rounded-lg flex-1" />
                <div className="h-9 bg-slate-100 rounded-lg flex-1" />
              </div>
            </div>
          ))}
        </div>
      ) : paginatedLocs.length === 0 ? (
        <div className="py-20 text-center text-slate-400 text-sm font-normal bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8">
          {searchQuery || filterCategory 
            ? "Tidak ada data lokasi yang cocok dengan pencarian Anda." 
            : "Belum ada lokasi wisata yang terdaftar."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginatedLocs.map((loc) => {
            const isBroken = !!brokenImages[loc.id];
            return (
              <div key={loc.id} className="border border-slate-200/80 bg-white overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-300 relative group rounded-2xl">
                <div>
                  <div 
                    onClick={() => loc.imageUrl && !isBroken && setPreviewImageUrl(loc.imageUrl)}
                    className={`h-44 bg-gradient-to-br from-slate-100 to-slate-50 relative overflow-hidden ${
                      loc.imageUrl && !isBroken ? "cursor-zoom-in" : ""
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
                    <span className={`absolute top-3 left-3 text-white text-[8px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-md ${getCatColor(loc.category)}`}>
                      {getCatLabel(loc.category)}
                    </span>
                  </div>
                  <CardContent className="p-5 space-y-2.5">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 leading-tight">{loc.nameId}</h3>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-normal">{loc.nameEn}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 font-normal">
                      {loc.descId}
                    </p>
                    <div className="pt-2 border-t border-slate-100 text-[9px] uppercase tracking-wider font-normal text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                      <span>LAT: {loc.latitude}</span>
                      <span>LNG: {loc.longitude}</span>
                    </div>
                  </CardContent>
                </div>

                <div className="p-5 pt-0 flex gap-2">
                  <Button
                    onClick={() => handleOpenEdit(loc)}
                    variant="outline"
                    className="flex-1 h-9 text-xs font-semibold text-slate-600 border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 bg-white rounded-lg"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Ubah</span>
                  </Button>
                  <Button
                    onClick={() => setDeleteConfirmId(loc.id)}
                    variant="ghost"
                    className="flex-1 h-9 text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center gap-1.5 rounded-lg"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
            className="h-9 text-xs font-semibold border-slate-200 text-slate-600 hover:bg-slate-50 bg-white flex items-center gap-1 rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)}
                className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all ${
                  page === currentPage
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
            className="h-9 text-xs font-semibold border-slate-200 text-slate-600 hover:bg-slate-50 bg-white flex items-center gap-1 rounded-xl"
          >
            <span className="hidden sm:inline">Selanjutnya</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Dialog Form */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-white border border-slate-200/80 text-slate-800 max-w-2xl overflow-y-auto max-h-[90vh] rounded-2xl shadow-2xl p-0 gap-0">
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
                      if (s.num === 2 && (!nameId.trim() || !nameEn.trim() || !descId.trim() || !descEn.trim())) {
                        toast.error("Harap isi informasi utama sebelum membuka peta!");
                        return;
                      }
                      setFormStep(s.num);
                    }}
                    className={`flex items-center gap-2 transition-all ${
                      formStep === s.num ? "opacity-100" : formStep > s.num ? "opacity-70" : "opacity-30"
                    }`}
                  >
                    <span className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold transition-all ${
                      formStep > s.num
                        ? "bg-emerald-600 text-white"
                        : formStep === s.num
                        ? "bg-emerald-600 text-white ring-[3px] ring-emerald-100"
                        : "bg-slate-100 text-slate-400"
                    }`}>
                      {formStep > s.num ? <Check className="h-4 w-4" /> : s.num}
                    </span>
                    <span className={`text-xs hidden sm:inline ${
                      formStep === s.num ? "font-bold text-slate-800" : "font-normal text-slate-400"
                    }`}>
                      {s.title}
                    </span>
                  </button>
                  {i < stepLabels.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-3 rounded-full transition-all ${
                      formStep > s.num ? "bg-emerald-400" : "bg-slate-100"
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
                  <FieldGroup label="Nama Destinasi (Indonesia)">
                    <Input 
                      value={nameId} 
                      onChange={(e) => setNameId(e.target.value)} 
                      placeholder="contoh: Setu Babakan Jagakarsa" 
                      required 
                      className={`${inputClass} ${wasValidated && !nameId.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}`} 
                    />
                  </FieldGroup>
                  <FieldGroup label="Nama Destinasi (Inggris)">
                    <Input 
                      value={nameEn} 
                      onChange={(e) => setNameEn(e.target.value)} 
                      placeholder="contoh: Setu Babakan Village" 
                      required 
                      className={`${inputClass} ${wasValidated && !nameEn.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}`} 
                    />
                  </FieldGroup>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldGroup label="Kategori Wisata">
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </FieldGroup>
                  <FieldGroup label="Upload Foto Destinasi" hint="Unggah gambar daya tarik destinasi">
                    <div className="relative">
                      <Input type="file" accept="image/*" onChange={handleUploadImage} disabled={uploading}
                        className="h-10 text-sm border-slate-200 bg-white text-slate-800 font-normal rounded-xl file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700"
                      />
                      {uploading && <Loader2 className="absolute right-3 top-3 h-4 w-4 text-emerald-500 animate-spin" />}
                    </div>
                  </FieldGroup>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldGroup label="Deskripsi (Indonesia)">
                    <textarea 
                      value={descId} 
                      onChange={(e) => setDescId(e.target.value)} 
                      placeholder="Tuliskan cerita singkat destinasi..." 
                      required 
                      rows={4} 
                      className={`${textareaClass} ${wasValidated && !descId.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}`} 
                    />
                  </FieldGroup>
                  <FieldGroup label="Deskripsi (Inggris)">
                    <textarea 
                      value={descEn} 
                      onChange={(e) => setDescEn(e.target.value)} 
                      placeholder="Write an appealing description..." 
                      required 
                      rows={4} 
                      className={`${textareaClass} ${wasValidated && !descEn.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}`} 
                    />
                  </FieldGroup>
                </div>
              </div>
            )}

            {/* Step 2: Peta & Media */}
            {formStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                
                {/* Geocoding Address Search */}
                <div className="space-y-2">
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
                <div className="h-[220px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative z-10">
                  <MapContainer
                    center={mapCenterPosition}
                    zoom={13}
                    scrollWheelZoom={true}
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />
                    <MapRecenter position={mapCenterPosition} />
                    <MapClickSelector onSelect={handleSelectMapPosition} />
                    <DraggableMarker position={mapCenterPosition} onPositionChange={handleSelectMapPosition} />
                  </MapContainer>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <FieldGroup label="Latitude (Google Maps)" hint="Terisi otomatis setelah memilih di peta">
                    <Input 
                      value={latitude} 
                      onChange={(e) => setLatitude(e.target.value)} 
                      placeholder="contoh: -6.3407" 
                      required 
                      className={`${inputClass} ${wasValidated && !latitude ? "border-red-500 focus-visible:ring-red-500" : ""}`} 
                    />
                  </FieldGroup>
                  <FieldGroup label="Longitude (Google Maps)" hint="Terisi otomatis setelah memilih di peta">
                    <Input 
                      value={longitude} 
                      onChange={(e) => setLongitude(e.target.value)} 
                      placeholder="contoh: 106.8274" 
                      required 
                      className={`${inputClass} ${wasValidated && !longitude ? "border-red-500 focus-visible:ring-red-500" : ""}`} 
                    />
                  </FieldGroup>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldGroup label="Alamat Rinci (Indonesia)" hint="Terisi otomatis dari penanda peta">
                    <textarea 
                      value={addressId} 
                      onChange={(e) => setAddressId(e.target.value)} 
                      placeholder="contoh: Jl. Moch. Kahfi II, Jagakarsa" 
                      rows={2} 
                      className={textareaClass} 
                    />
                  </FieldGroup>
                  <FieldGroup label="Alamat Rinci (Inggris)" hint="Terisi otomatis dari penanda peta">
                    <textarea 
                      value={addressEn} 
                      onChange={(e) => setAddressEn(e.target.value)} 
                      placeholder="contoh: Moch. Kahfi II Street, Jagakarsa" 
                      rows={2} 
                      className={textareaClass} 
                    />
                  </FieldGroup>
                </div>

                {imageUrl && (
                  <div className="mt-4">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1.5 uppercase">Preview Foto</label>
                    <img src={imageUrl} alt="Preview" className="h-36 w-full object-cover rounded-xl border border-slate-200" />
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
                      if (!nameId.trim() || !nameEn.trim() || !descId.trim() || !descEn.trim()) {
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
        <DialogContent className="bg-white border border-slate-200/80 text-slate-800 max-w-sm rounded-2xl p-6 shadow-2xl text-left">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-slate-800 tracking-tight">Hapus Lokasi Wisata?</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="text-xs text-slate-500 font-normal leading-relaxed">
              Apakah Anda yakin ingin menghapus data lokasi ini? Semua relasi seperti cerita pembuka atau UMKM yang terikat akan terpengaruh. Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
          <DialogFooter className="pt-4 flex gap-2 border-t border-slate-100 mt-2 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setDeleteConfirmId(null)}
              className="h-9 px-4 text-xs font-semibold text-slate-500 border-slate-200 hover:bg-slate-50 bg-white rounded-xl"
            >
              Batal
            </Button>
            <Button 
              type="button"
              onClick={() => {
                if (deleteConfirmId) {
                  handleDelete(deleteConfirmId);
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
    </div>
  );
}
