import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit2, Trash2, Store, Loader2, Search, ChevronLeft, ChevronRight, Check, X, ChevronDown, HelpCircle, Eye } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import FieldGroup from "@/components/admin/FieldGroup";

interface UmkmItem {
  id: string;
  name: string;
  descId: string;
  descEn: string;
  category: string;
  products: string[];
  imageUrl?: string;
  rating: number;
  voucherAvailable: boolean;
  locationId: string;
}

interface LocationItem {
  id: string;
  nameId: string;
}

const ITEMS_PER_PAGE = 9;

export default function AdminUmkm() {
  const toast = useToast();
  const [umkmList, setUmkmList] = useState<UmkmItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UmkmItem | null>(null);

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
  const [viewUmkm, setViewUmkm] = useState<UmkmItem | null>(null);

  // Feature Onboarding Tour States
  const [tourActiveStep, setTourActiveStep] = useState<number | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  const tourSteps = [
    {
      title: "Selamat Datang di Kelola Mitra UMKM! 🏪",
      content: "Tur singkat ini akan memandu Anda secara interaktif memahami fitur-fitur utama di halaman Kelola Mitra UMKM. Klik 'Selanjutnya' untuk memulai!",
      selector: null
    },
    {
      title: "Pencarian & Filter Kategori 🔍",
      content: "Gunakan panel filter ini untuk mencari UMKM dengan kata kunci nama warung atau memilah berdasarkan kategori UMKM.",
      selector: "#filter-bar"
    },
    {
      title: "Tambah Mitra UMKM Baru ➕",
      content: "Klik tombol ini untuk mendaftarkan mitra UMKM baru. Anda dapat memautkan toko ke lokasi wisata tertentu, memasukkan deskripsi produk lokal, serta menandai jika voucher diskon tersedia.",
      selector: "#add-umkm-btn"
    },
    {
      title: "Daftar Mitra UMKM 🛍️",
      content: "Seluruh mitra UMKM yang terdaftar ditampilkan di sini. Anda dapat mengubah data, mengelola produk, menghapus secara aman, atau melihat pratinjau foto toko.",
      selector: "#umkm-grid"
    },
    {
      title: "Tur Selesai! 🎉",
      content: "Sekarang Anda siap mengelola jaringan Mitra UMKM Lokal SinopiQuest. Selamat bekerja!",
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

    const timer = setTimeout(() => {
      if (step.selector) {
        const element = document.querySelector(step.selector);
        if (element) {
          element.classList.add("tour-highlighted");
          const rect = element.getBoundingClientRect();

          const showAbove = rect.bottom + 260 > window.innerHeight;
          const topPos = showAbove
            ? rect.top - 245 + window.scrollY
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
  const [umkmId, setUmkmId] = useState("");
  const [name, setName] = useState("");
  const [descId, setDescId] = useState("");
  const [category, setCategory] = useState("kuliner");
  const [productsStr, setProductsStr] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [rating, setRating] = useState("5.0");
  const [voucherAvailable, setVoucherAvailable] = useState(false);
  const [locationId, setLocationId] = useState("");
  const [uploading, setUploading] = useState(false);

  const categories = [
    { value: "kuliner", label: "Kuliner Lokal", color: "bg-orange-600" },
    { value: "suvenir", label: "Oleh-Oleh / Suvenir", color: "bg-indigo-600" },
    { value: "kerajinan", label: "Kerajinan Seni", color: "bg-amber-600" },
    { value: "fashion", label: "Pakaian Adat / Batik", color: "bg-pink-600" },
    { value: "jasa", label: "Pemandu / Jasa Lokal", color: "bg-teal-600" },
  ];

  const stepLabels = [
    { num: 1, title: "Informasi Toko" },
    { num: 2, title: "Produk & Promo" },
  ];

  const fetchDependencies = () => {
    fetch("/api/locations")
      .then((res) => res.json())
      .then((data) => setLocations(data))
      .catch((err) => console.error(err));
  };

  const fetchUmkm = () => {
    setLoading(true);
    fetch("/api/umkm")
      .then((res) => res.json())
      .then((data) => setUmkmList(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUmkm();
    fetchDependencies();
  }, []);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormStep(1);
    setWasValidated(false);
    setUmkmId("");
    setName("");
    setDescId("");
    setCategory("kuliner");
    setProductsStr("");
    setImageUrl("");
    setRating("5.0");
    setVoucherAvailable(false);
    setLocationId(locations[0]?.id || "");
    setIsOpen(true);
  };

  const handleOpenEdit = (item: UmkmItem) => {
    setEditingItem(item);
    setFormStep(1);
    setWasValidated(false);
    setUmkmId(item.id);
    setName(item.name);
    setDescId(item.descId);
    setCategory(item.category);
    setProductsStr(item.products.join(", "));
    setImageUrl(item.imageUrl || "");
    setRating(item.rating.toString());
    setVoucherAvailable(item.voucherAvailable);
    setLocationId(item.locationId);
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
    formData.append("entity", "umkm");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWasValidated(true);

    if (formStep < 2) {
      if (!umkmId.trim() || !name.trim() || !descId.trim() || !locationId) {
        toast.error("Harap lengkapi semua kolom informasi toko wajib!");
        return;
      }
      setFormStep(2);
      return;
    }

    const token = localStorage.getItem("sinopiquest_token");
    const payload = {
      id: umkmId || undefined,
      name,
      descId,
      category,
      products: productsStr.split(",").map((p) => p.trim()).filter((p) => p.length > 0),
      imageUrl,
      rating: parseFloat(rating) || 5.0,
      voucherAvailable,
      locationId,
    };

    const method = editingItem ? "PUT" : "POST";
    const url = editingItem ? `/api/umkm/${editingItem.id}` : "/api/umkm";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Request failed");
      }
      setIsOpen(false);
      toast.success(editingItem ? "Data mitra UMKM berhasil diperbarui!" : "Mitra UMKM baru berhasil ditambahkan!");
      fetchUmkm();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan data mitra");
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("sinopiquest_token");

    try {
      const res = await fetch(`/api/umkm/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");
      toast.success("Mitra UMKM berhasil dihapus!");
      fetchUmkm();
    } catch {
      toast.error("Gagal menghapus mitra");
    }
  };

  // ── Filter and Pagination ──
  const filteredUmkm = umkmList.filter((umkm) => {
    const matchSearch = !searchQuery || umkm.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = !filterCategory || umkm.category === filterCategory;
    return matchSearch && matchCat;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUmkm.length / ITEMS_PER_PAGE));
  const paginatedUmkm = filteredUmkm.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getCatLabel = (val: string) => categories.find(c => c.value === val)?.label || val;
  const getCatColor = (val: string) => categories.find(c => c.value === val)?.color || "bg-slate-600";
  const getLocationName = (id: string) => locations.find(l => l.id === id)?.nameId || id;

  // Reusable input classes
  const inputClass = "h-10 text-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-white focus-visible:ring-emerald-500 font-normal rounded-xl placeholder:text-slate-400";
  const selectClass = "w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:outline-none font-normal transition-all";
  const textareaClass = "w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-white text-sm font-normal focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:outline-none resize-none transition-all";

  return (
    <div className="space-y-5 text-left animate-in fade-in duration-300">
      <style>{`
        .tour-highlighted {
          position: relative !important;
          z-index: 9999 !important;
          background-color: white !important;
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6) !important;
          pointer-events: none !important;
          animation: tour-pulse 2.2s infinite !important;
          border-radius: 12px;
        }
        @keyframes tour-pulse {
          0% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6) !important; }
          50% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.45) !important; }
          100% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6) !important; }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center gap-4 w-full">
          <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Mitra UMKM Lokal</h2>
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
              id="add-umkm-btn"
              onClick={handleOpenAdd}
              className="h-9 sm:h-10 px-3.5 sm:px-5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm transition-all hover:shadow-md cursor-pointer"
            >
              <Plus className="h-4 w-4" strokeWidth={3} />
              <span>Tambah Mitra</span>
            </Button>
          </div>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-normal leading-relaxed">
          Kelola produk mitra, rating warung, dan promosi voucher diskon belanja.
        </p>
      </div>

      <div id="filter-bar" className="grid grid-cols-5 gap-2.5 sm:gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors duration-200">
        <div className="relative col-span-3">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama mitra UMKM..."
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
        Menampilkan <span className="font-semibold text-slate-600 dark:text-slate-300">{paginatedUmkm.length}</span> dari {filteredUmkm.length} mitra
      </p>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col justify-between shadow-sm rounded-2xl animate-pulse">
              <div>
                <div className="h-44 bg-slate-105 dark:bg-slate-800 w-full" />
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="h-5 bg-slate-200/70 dark:bg-slate-800 rounded-lg w-2/3" />
                    <div className="h-4 bg-slate-200/70 dark:bg-slate-800 rounded-lg w-10" />
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="h-3 bg-slate-200/70 dark:bg-slate-800 rounded-lg w-full" />
                    <div className="h-3 bg-slate-200/70 dark:bg-slate-800 rounded-lg w-[90%]" />
                    <div className="h-3 bg-slate-200/70 dark:bg-slate-800 rounded-lg w-[70%]" />
                  </div>
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                    <div className="h-3 bg-slate-200/70 dark:bg-slate-800 rounded-lg w-1/3" />
                  </div>
                  <div className="pt-2 flex gap-1.5">
                    <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-md w-12" />
                    <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-md w-12" />
                  </div>
                </div>
              </div>
              <div className="p-5 pt-0 flex gap-2">
                <div className="h-9 bg-slate-105 dark:bg-slate-800 rounded-lg flex-1" />
                <div className="h-9 bg-slate-105 dark:bg-slate-800 rounded-lg flex-1" />
              </div>
            </div>
          ))}
        </div>
      ) : paginatedUmkm.length === 0 ? (
        <div className="py-16 px-4 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/85 dark:border-slate-800 shadow-sm max-w-md mx-auto my-8 flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-400 shadow-inner">
            <Store className="h-7 w-7 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="space-y-1.5 max-w-xs">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              {searchQuery || filterCategory ? "Mitra Tidak Ditemukan" : "Belum Ada Mitra UMKM"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
              {searchQuery || filterCategory
                ? "Tidak ada mitra UMKM yang cocok dengan kata kunci pencarian atau filter kategori Anda."
                : "Daftar mitra UMKM masih kosong. Mulai tambahkan dengan mengeklik tombol di atas."}
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
        <div id="umkm-grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginatedUmkm.map((umkm) => {
            const isBroken = !!brokenImages[umkm.id];
            return (
              <div key={umkm.id} className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-300 relative group rounded-2xl">
                <div>
                  <div
                    onClick={() => umkm.imageUrl && !isBroken && setPreviewImageUrl(umkm.imageUrl)}
                    className={`h-44 bg-gradient-to-br from-slate-100 to-slate-50 relative overflow-hidden ${umkm.imageUrl && !isBroken ? "cursor-zoom-in" : ""
                      }`}
                  >
                    {umkm.imageUrl && !isBroken ? (
                      <img
                        src={umkm.imageUrl}
                        alt={umkm.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={() => setBrokenImages(prev => ({ ...prev, [umkm.id]: true }))}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Store className="h-10 w-10 animate-pulse" />
                      </div>
                    )}
                    <span className={`absolute top-3 left-3 text-white text-[8px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-md ${getCatColor(umkm.category)}`}>
                      {getCatLabel(umkm.category)}
                    </span>
                    {/* View Detail button */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setViewUmkm(umkm); }}
                      className="absolute top-3 right-3 z-30 p-2 bg-white/95 dark:bg-slate-800 hover:bg-emerald-600 text-slate-600 dark:text-slate-300 hover:text-white rounded-full shadow-md border border-slate-100/50 dark:border-slate-700/50 hover:border-emerald-600 hover:scale-105 transition-all duration-200 cursor-pointer"
                      title="Lihat Detail Selengkapnya"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    {umkm.voucherAvailable && (
                      <span className="absolute top-3 right-12 bg-emerald-600 text-white text-[7px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md shadow-md z-20">
                        Voucher
                      </span>
                    )}
                  </div>
                  <CardContent className="p-5 space-y-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{umkm.name}</h3>
                      <span className="text-[10px] font-bold text-amber-600 shrink-0">⭐ {umkm.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 font-normal">
                      {umkm.descId}
                    </p>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5 justify-between items-center text-[9px] uppercase tracking-wider font-normal text-slate-400 dark:text-slate-400">
                      <span>Lokasi: {getLocationName(umkm.locationId)}</span>
                    </div>
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {umkm.products.map((p, idx) => (
                        <span key={idx} className="text-[9px] font-normal text-slate-400 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-2 py-0.5 rounded-md">
                          {p}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </div>

                <div className="p-5 pt-0 flex gap-2">
                  <Button
                    onClick={() => handleOpenEdit(umkm)}
                    variant="outline"
                    className="flex-1 h-9 text-xs font-semibold text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 bg-white dark:bg-slate-900 rounded-lg"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Ubah</span>
                  </Button>
                  <Button
                    onClick={() => setDeleteConfirmId(umkm.id)}
                    variant="ghost"
                    className="flex-1 h-9 text-xs font-semibold text-red-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-955/20 flex items-center gap-1.5 rounded-lg"
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
      {filteredUmkm.length > 0 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
            className="h-9 text-xs font-semibold border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1 rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)}
                className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all ${page === currentPage
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
              >
                {page}
              </button>
            ))}
          </div>

          <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
            className="h-9 text-xs font-semibold border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1 rounded-xl"
          >
            <span className="hidden sm:inline">Selanjutnya</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Dialog Form */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-white w-[92%] sm:max-w-xl overflow-y-auto max-h-[90vh] rounded-2xl shadow-2xl p-0 gap-0">
          <DialogHeader className="px-6 sm:px-8 pt-6 pb-0">
            <DialogTitle className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
              {editingItem ? "Ubah Mitra UMKM" : "Tambah Mitra UMKM Baru"}
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
                      if (s.num === 2 && (!umkmId.trim() || !name.trim() || !descId.trim() || !locationId)) {
                        toast.error("Harap isi informasi toko sebelum menginput produk!");
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
                          ? "bg-emerald-600 text-white ring-[3px] ring-emerald-100 dark:ring-emerald-900/50"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                      }`}>
                      {formStep > s.num ? <Check className="h-4 w-4" /> : s.num}
                    </span>
                    <span className={`text-xs hidden sm:inline ${formStep === s.num ? "font-bold text-slate-800 dark:text-white" : "font-normal text-slate-400 dark:text-slate-500"
                      }`}>
                      {s.title}
                    </span>
                  </button>
                  {i < stepLabels.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-3 rounded-full transition-all ${formStep > s.num ? "bg-emerald-400" : "bg-slate-100 dark:bg-slate-800"
                      }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 sm:px-8 pb-6">

            {/* Step 1: Informasi Toko */}
            {formStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <p className="text-xs text-slate-400 font-normal">Tentukan identitas warung/toko mitra, rating bintang, dan lokasi terdekat.</p>

                {/* ── Identitas Mitra UMKM ── */}
                <div className="bg-slate-50/70 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
                  <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">🏷️ Identitas Mitra UMKM</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldGroup label="Nama Toko / Warung" hint="Nama mitra UMKM yang akan tampil di aplikasi" required>
                      <Input
                        value={name}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const formattedVal = raw.length === 1 ? raw.toUpperCase() : raw.charAt(0).toUpperCase() + raw.slice(1);
                          setName(formattedVal);
                          if (!editingItem) {
                            const autoId = formattedVal.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim().replace(/\s+/g, "_");
                            setUmkmId(autoId ? `umkm_${autoId}` : "");
                          }
                        }}
                        placeholder="contoh: Soto kudus mbak sri"
                        required
                        className={`${inputClass} ${wasValidated && !name.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      />
                    </FieldGroup>
                    <FieldGroup label="ID Mitra Unik" hint="Terisi otomatis dari nama — bisa diubah manual jika perlu" required>
                      <Input
                        value={umkmId}
                        onChange={(e) => setUmkmId(e.target.value)}
                        placeholder="terisi otomatis..."
                        required
                        disabled={!!editingItem}
                        className={`${inputClass} font-mono text-xs ${wasValidated && !umkmId.trim() ? "border-red-500 focus-visible:ring-red-500" : ""} ${!editingItem ? "bg-slate-50" : ""}`}
                      />
                    </FieldGroup>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FieldGroup label="Kategori UMKM">
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </FieldGroup>

                  <FieldGroup label="Rating Awal Toko" hint="Desimal 1.0 - 5.0" required>
                    <Input
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      placeholder="5.0"
                      required
                      className={`${inputClass} ${wasValidated && !rating ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                  </FieldGroup>

                  <FieldGroup label="Lokasi Wisata Terdekat">
                    <select value={locationId} onChange={(e) => setLocationId(e.target.value)} className={selectClass}>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>{loc.nameId}</option>
                      ))}
                    </select>
                  </FieldGroup>
                </div>

                <div className="w-full">
                  <FieldGroup label="Deskripsi (Indonesia)" required>
                    <textarea
                      value={descId}
                      onChange={(e) => setDescId(e.target.value)}
                      placeholder="Tuliskan daya tarik kuliner/suvenir yang dijual..."
                      required
                      rows={4}
                      className={`${textareaClass} ${wasValidated && !descId.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                  </FieldGroup>
                </div>
              </div>
            )}

            {/* Step 2: Produk & Promo */}
            {formStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <p className="text-xs text-slate-400 font-normal">Masukkan produk unggulan toko serta unggah foto pendukung.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldGroup label="Foto Toko / Banner" hint="Unggah foto lapak atau makanan">
                    <div className="relative">
                      <Input type="file" accept="image/*" onChange={handleUploadImage} disabled={uploading}
                        className="h-10 text-sm border-slate-200 bg-white text-slate-800 font-normal rounded-xl file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700"
                      />
                      {uploading && <Loader2 className="absolute right-3 top-3 h-4 w-4 text-emerald-500 animate-spin" />}
                    </div>
                  </FieldGroup>
                  {imageUrl && (
                    <div className="h-20 w-full overflow-hidden rounded-xl border border-slate-200 relative">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <FieldGroup label="Produk Andalan" hint="Pisahkan dengan tanda koma (contoh: Nasi Goreng, Es Kelapa Muda)">
                  <Input
                    value={productsStr}
                    onChange={(e) => setProductsStr(e.target.value)}
                    placeholder="contoh: Bakso Sapi, Mie Ayam, Es Teh Manis"
                    className={inputClass}
                  />
                </FieldGroup>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 mt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <Checkbox
                      checked={voucherAvailable}
                      onCheckedChange={(checked) => setVoucherAvailable(!!checked)}
                      className="border-slate-300 bg-white data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <div className="space-y-0.5">
                      <span className="text-slate-700 text-xs font-semibold block">Tersedia Voucher Belanja</span>
                      <span className="text-slate-400 text-[10px] font-normal">Pemain dapat menukar poin dengan voucher diskon di toko ini.</span>
                    </div>
                  </label>
                </div>
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
                    key="btn-next-umkm"
                    type="button"
                    onClick={() => {
                      if (!umkmId.trim() || !name.trim() || !descId.trim() || !locationId) {
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
                    key="btn-submit-umkm"
                    type="submit"
                    disabled={uploading}
                    className="h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm rounded-xl"
                  >
                    {uploading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                    Simpan Mitra
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail View Modal */}
      <Dialog open={!!viewUmkm} onOpenChange={(open) => !open && setViewUmkm(null)}>
        {viewUmkm && (
          <DialogContent className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-white w-[92%] sm:max-w-lg overflow-y-auto max-h-[90vh] rounded-2xl shadow-2xl p-6 text-left">
            <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <DialogTitle className="text-base font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-1.5">
                <Store className="h-4 w-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                <span>Detail Mitra UMKM</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4 text-xs">
              {/* Gambar Banner */}
              {viewUmkm.imageUrl ? (
                <img src={viewUmkm.imageUrl} alt={viewUmkm.name} className="h-48 w-full object-cover rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm" />
              ) : (
                <div className="h-44 w-full bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500">
                  Tidak ada foto toko
                </div>
              )}

              {/* Info Utama */}
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">{viewUmkm.name}</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{viewUmkm.id}</p>
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 shrink-0">⭐ {viewUmkm.rating.toFixed(1)}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block font-normal">Kategori</span>
                    <span className={`inline-block text-[9px] font-semibold text-white px-2 py-0.5 rounded-md mt-0.5 ${getCatColor(viewUmkm.category)}`}>
                      {getCatLabel(viewUmkm.category)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block font-normal">Lokasi Destinasi</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 block mt-0.5">{getLocationName(viewUmkm.locationId)}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 dark:text-slate-500 block font-normal">Status Voucher Diskon</span>
                    {viewUmkm.voucherAvailable ? (
                      <span className="inline-block bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-md mt-0.5">
                        Tersedia (Aktif untuk Reward Misi)
                      </span>
                    ) : (
                      <span className="inline-block bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 text-[10px] font-semibold px-2 py-0.5 rounded-md mt-0.5">
                        Tidak Tersedia
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Deskripsi Toko */}
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 space-y-1">
                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-[10px] uppercase tracking-wider">📋 Deskripsi Mitra</h4>
                <p className="text-slate-600 dark:text-slate-400 font-normal leading-relaxed">{viewUmkm.descId}</p>
              </div>

              {/* Produk Andalan */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-[10px] uppercase tracking-wider">🍔 Produk Unggulan</h4>
                <div className="flex flex-wrap gap-1.5">
                  {viewUmkm.products.length > 0 ? (
                    viewUmkm.products.map((p, idx) => (
                      <span key={idx} className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg">
                        {p}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 italic">Belum ada produk terdaftar</span>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
              <Button type="button" onClick={() => setViewUmkm(null)} className="h-9 px-4 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-semibold cursor-pointer">
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
              alt="Pratinjau Mitra"
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
            <DialogTitle className="text-base font-black text-slate-800 dark:text-white tracking-tight">Hapus Mitra UMKM?</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
              Apakah Anda yakin ingin menghapus data mitra UMKM ini? Semua produk dan relasi voucher yang dimiliki akan terhapus secara permanen. Tindakan ini tidak dapat dibatalkan.
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

      {/* Feature Tour Tooltip Overlay */}
      {tourActiveStep !== null && (
        <>
          {/* Backdrop screen mask */}
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
