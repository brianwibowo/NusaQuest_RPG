import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, BookOpen, Loader2, Search, ChevronLeft, ChevronRight, Check, X, ChevronDown, HelpCircle } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import FieldGroup from "@/components/admin/FieldGroup";

interface StoryItem {
  id: string;
  titleId: string;
  titleEn: string;
  contentId: string;
  contentEn: string;
  category: string;
  imageUrl?: string;
  locationId: string;
  unlockedByQuestId?: string | null;
}

interface LocationItem {
  id: string;
  nameId: string;
}

interface QuestItem {
  id: string;
  titleId: string;
}

const ITEMS_PER_PAGE = 9;

export default function AdminStories() {
  const toast = useToast();
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [quests, setQuests] = useState<QuestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StoryItem | null>(null);

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

  // Feature Onboarding Tour States
  const [tourActiveStep, setTourActiveStep] = useState<number | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  const tourSteps = [
    {
      title: "Selamat Datang di Kelola Kisah Cerita! 📖",
      content: "Tur singkat ini akan memandu Anda secara interaktif memahami fitur-fitur utama di halaman Kelola Kisah Cerita. Klik 'Selanjutnya' untuk memulai!",
      selector: null
    },
    {
      title: "Pencarian & Filter Kategori 🔍",
      content: "Gunakan panel filter ini untuk mencari kisah dengan kata kunci judul cerita atau memilah berdasarkan kategori kisah.",
      selector: "#filter-bar"
    },
    {
      title: "Tambah Kisah Baru ➕",
      content: "Klik tombol ini untuk mendaftarkan kisah cerita baru. Anda dapat memautkan kisah ke lokasi tertentu, menghubungkannya dengan quest pembuka, serta mengunggah gambar ilustrasi.",
      selector: "#add-story-btn"
    },
    {
      title: "Daftar Kisah Cerita 📚",
      content: "Seluruh kisah cerita yang terdaftar ditampilkan di sini. Anda dapat mengubah data narasi, menghapus kisah secara aman, atau melihat pratinjau gambar penuh.",
      selector: "#stories-grid"
    },
    {
      title: "Tur Selesai! 🎉",
      content: "Sekarang Anda siap mengelola konten kisah cerita NusaQuest. Selamat bekerja!",
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
  const [storyId, setStoryId] = useState("");
  const [titleId, setTitleId] = useState("");
  const [contentId, setContentId] = useState("");
  const [category, setCategory] = useState("budaya");
  const [imageUrl, setImageUrl] = useState("");
  const [locationId, setLocationId] = useState("");
  const [unlockedByQuestId, setUnlockedByQuestId] = useState("");
  const [uploading, setUploading] = useState(false);

  const categories = [
    { value: "budaya", label: "Budaya", color: "bg-amber-600" },
    { value: "sejarah", label: "Sejarah", color: "bg-rose-600" },
    { value: "legenda", label: "Legenda / Mitos", color: "bg-purple-600" },
    { value: "kuliner", label: "Kuliner", color: "bg-orange-600" },
    { value: "lingkungan", label: "Lingkungan / Alam", color: "bg-emerald-600" },
  ];

  const stepLabels = [
    { num: 1, title: "Identitas Cerita" },
    { num: 2, title: "Narasi & Media" },
  ];

  const fetchDependencies = async () => {
    try {
      const [locsRes, questsRes] = await Promise.all([
        fetch("/api/locations"),
        fetch("/api/quests"),
      ]);
      setLocations(await locsRes.json());
      setQuests(await questsRes.json());
    } catch (err) {
      console.error("Dependency error:", err);
    }
  };

  const fetchStories = () => {
    setLoading(true);
    fetch("/api/stories")
      .then((res) => res.json())
      .then((data) => setStories(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDependencies();
    fetchStories();
  }, []);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormStep(1);
    setWasValidated(false);
    setStoryId("");
    setTitleId("");
    setContentId("");
    setCategory("budaya");
    setImageUrl("");
    setLocationId(locations[0]?.id || "");
    setUnlockedByQuestId("");
    setIsOpen(true);
  };

  const handleOpenEdit = (item: StoryItem) => {
    setEditingItem(item);
    setFormStep(1);
    setWasValidated(false);
    setStoryId(item.id);
    setTitleId(item.titleId);
    setContentId(item.contentId);
    setCategory(item.category);
    setImageUrl(item.imageUrl || "");
    setLocationId(item.locationId);
    setUnlockedByQuestId(item.unlockedByQuestId || "");
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
    formData.append("entity", "stories");

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
      if (!storyId.trim() || !titleId.trim() || !locationId) {
        toast.error("Harap lengkapi semua kolom identitas wajib!");
        return;
      }
      setFormStep(2);
      return;
    }

    if (!contentId.trim()) {
      toast.error("Harap lengkapi narasi cerita!");
      return;
    }

    const token = localStorage.getItem("sinopiquest_token");
    const payload = {
      id: storyId || undefined,
      titleId,
      contentId,
      category,
      imageUrl,
      locationId,
      unlockedByQuestId: unlockedByQuestId || null,
    };

    const method = editingItem ? "PUT" : "POST";
    const url = editingItem ? `/api/stories/${editingItem.id}` : "/api/stories";

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
      toast.success(editingItem ? "Data kisah berhasil diperbarui!" : "Kisah baru berhasil ditambahkan!");
      fetchStories();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan data kisah");
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("sinopiquest_token");

    try {
      const res = await fetch(`/api/stories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");
      toast.success("Kisah berhasil dihapus!");
      fetchStories();
    } catch {
      toast.error("Gagal menghapus kisah");
    }
  };

  // ── Filter and Pagination ──
  const filteredStories = stories.filter((story) => {
    const matchSearch = !searchQuery ||
      story.titleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.titleEn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = !filterCategory || story.category === filterCategory;
    return matchSearch && matchCat;
  });

  const totalPages = Math.max(1, Math.ceil(filteredStories.length / ITEMS_PER_PAGE));
  const paginatedStories = filteredStories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getCatLabel = (val: string) => categories.find(c => c.value === val)?.label || val;
  const getCatColor = (val: string) => categories.find(c => c.value === val)?.color || "bg-slate-600";
  const getLocationName = (id: string) => locations.find(l => l.id === id)?.nameId || id;
  const getQuestTitle = (id: string) => quests.find(q => q.id === id)?.titleId || id;

  // Reusable input classes
  const inputClass = "h-10 text-sm border-slate-200 bg-white text-slate-800 focus-visible:ring-emerald-500 font-normal rounded-xl placeholder:text-slate-400";
  const selectClass = "w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:outline-none font-normal transition-all";
  const textareaClass = "w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-normal focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:outline-none resize-none transition-all";

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Kelola Kisah Cerita</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-normal">
            <span className="text-emerald-600 font-semibold">Tulis cerita lokal, dongeng, dan fakta sejarah destinasi wisata.</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => setTourActiveStep(0)}
            variant="outline"
            className="h-10 w-10 p-0 text-slate-500 border-slate-200 hover:bg-slate-50 bg-white rounded-xl shadow-sm transition-all flex items-center justify-center cursor-pointer"
            title="Mulai Tur Fitur"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
          <Button
            id="add-story-btn"
            onClick={handleOpenAdd}
            className="h-10 px-5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-2 shadow-sm transition-all hover:shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" strokeWidth={3} />
            <span>Tambah Cerita</span>
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div id="filter-bar" className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul cerita..."
            className="h-10 pl-9 text-xs border-slate-200 bg-white text-slate-800 focus-visible:ring-emerald-500 font-normal placeholder:text-slate-400 rounded-full"
          />
        </div>
        <div className="relative">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full h-10 pl-4 pr-10 rounded-full border border-slate-200 bg-white text-slate-700 text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:outline-none font-normal transition-all cursor-pointer appearance-none"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <p className="text-[11px] text-slate-400 font-normal px-1">
        Menampilkan <span className="font-semibold text-slate-600">{paginatedStories.length}</span> dari {filteredStories.length} cerita
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
                    <div className="h-3 bg-slate-200/70 rounded-lg w-1/3" />
                    <div className="h-3 bg-slate-200/70 rounded-lg w-1/3" />
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
      ) : paginatedStories.length === 0 ? (
        <div className="py-16 px-4 text-center bg-white rounded-3xl border border-slate-200/85 shadow-sm max-w-md mx-auto my-8 flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="h-16 w-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-450 shadow-inner">
            <BookOpen className="h-7 w-7 text-slate-400" />
          </div>
          <div className="space-y-1.5 max-w-xs">
            <h3 className="text-sm font-bold text-slate-800">
              {searchQuery || filterCategory ? "Kisah Tidak Ditemukan" : "Belum Ada Kisah Cerita"}
            </h3>
            <p className="text-xs text-slate-500 font-normal leading-relaxed">
              {searchQuery || filterCategory
                ? "Tidak ada kisah cerita yang cocok dengan kata kunci pencarian atau filter kategori Anda."
                : "Daftar kisah cerita masih kosong. Mulai tambahkan dengan mengeklik tombol di atas."}
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
              className="h-9 px-4 text-xs font-semibold border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 bg-white rounded-full transition-all cursor-pointer shadow-xs"
            >
              Reset Filter & Pencarian
            </Button>
          )}
        </div>
      ) : (
        <div id="stories-grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginatedStories.map((story) => {
            const isBroken = !!brokenImages[story.id];
            return (
              <div key={story.id} className="border border-slate-200/80 bg-white overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-300 relative group rounded-2xl">
                <div>
                  <div
                    onClick={() => story.imageUrl && !isBroken && setPreviewImageUrl(story.imageUrl)}
                    className={`h-44 bg-gradient-to-br from-slate-100 to-slate-50 relative overflow-hidden ${story.imageUrl && !isBroken ? "cursor-zoom-in" : ""
                      }`}
                  >
                    {story.imageUrl && !isBroken ? (
                      <img
                        src={story.imageUrl}
                        alt={story.titleId}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={() => setBrokenImages(prev => ({ ...prev, [story.id]: true }))}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <BookOpen className="h-10 w-10 animate-pulse" />
                      </div>
                    )}
                    <span className={`absolute top-3 left-3 text-white text-[8px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-md ${getCatColor(story.category)}`}>
                      {getCatLabel(story.category)}
                    </span>
                  </div>
                  <CardContent className="p-5 space-y-2.5">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 leading-tight">{story.titleId}</h3>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-normal">{story.titleEn}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 font-normal">
                      {story.contentId}
                    </p>
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-x-4 gap-y-1 text-[9px] uppercase tracking-wider font-normal text-slate-400">
                      <span>Lokasi: {getLocationName(story.locationId)}</span>
                      {story.unlockedByQuestId && (
                        <span>Pembuka: {getQuestTitle(story.unlockedByQuestId)}</span>
                      )}
                    </div>
                  </CardContent>
                </div>

                <div className="p-5 pt-0 flex gap-2">
                  <Button
                    onClick={() => handleOpenEdit(story)}
                    variant="outline"
                    className="flex-1 h-9 text-xs font-semibold text-slate-600 border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 bg-white rounded-lg"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Ubah</span>
                  </Button>
                  <Button
                    onClick={() => setDeleteConfirmId(story.id)}
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
      {filteredStories.length > 0 && (
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
                className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all ${page === currentPage
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
              {editingItem ? "Ubah Kisah Cerita" : "Tambah Kisah Cerita Baru"}
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
                      if (s.num === 2 && (!storyId.trim() || !titleId.trim() || !locationId)) {
                        toast.error("Harap isi identitas cerita sebelum menulis narasi!");
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

            {/* Step 1: Identitas Cerita */}
            {formStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <p className="text-xs text-slate-400 font-normal">Tentukan kode ID unik cerita, judul, dan relasi lokasi.</p>

                <div className="grid grid-cols-1 gap-4">
                  <FieldGroup label="ID Kisah Unik" hint="Gunakan kode huruf kecil & underscore (contoh: sejarah_lawang_sewu)">
                    <Input
                      value={storyId}
                      onChange={(e) => setStoryId(e.target.value)}
                      placeholder="sejarah_lawang_sewu"
                      required
                      disabled={!!editingItem}
                      className={`${inputClass} ${wasValidated && !storyId.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                  </FieldGroup>
                </div>

                <div className="w-full">
                  <FieldGroup label="Judul Kisah (Indonesia)">
                    <Input
                      value={titleId}
                      onChange={(e) => setTitleId(e.target.value)}
                      placeholder="contoh: Misteri Sumur Lawang Sewu"
                      required
                      className={`${inputClass} ${wasValidated && !titleId.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                  </FieldGroup>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FieldGroup label="Kategori Cerita">
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </FieldGroup>

                  <FieldGroup label="Lokasi Terkait">
                    <select value={locationId} onChange={(e) => setLocationId(e.target.value)} className={selectClass}>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>{loc.nameId}</option>
                      ))}
                    </select>
                  </FieldGroup>

                  <FieldGroup label="Misi Pembuka (Opsional)">
                    <select value={unlockedByQuestId} onChange={(e) => setUnlockedByQuestId(e.target.value)} className={selectClass}>
                      <option value="">Terbuka Otomatis</option>
                      {quests.map((q) => (
                        <option key={q.id} value={q.id}>{q.titleId}</option>
                      ))}
                    </select>
                  </FieldGroup>
                </div>
              </div>
            )}

            {/* Step 2: Narasi & Media */}
            {formStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <p className="text-xs text-slate-400 font-normal">Tuliskan isi cerita lengkap dalam dua bahasa serta unggah cover cerita.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldGroup label="Cover Foto Kisah" hint="Unggah gambar representasi cerita">
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

                <div className="w-full">
                  <FieldGroup label="Narasi Cerita (Indonesia)">
                    <textarea
                      value={contentId}
                      onChange={(e) => setContentId(e.target.value)}
                      placeholder="Tuliskan dongeng atau sejarah lengkap di sini..."
                      required
                      rows={6}
                      className={`${textareaClass} ${wasValidated && !contentId.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                  </FieldGroup>
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
                    key="btn-next-story"
                    type="button"
                    onClick={() => {
                      if (!storyId.trim() || !titleId.trim() || !locationId) {
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
                    key="btn-submit-story"
                    type="submit"
                    disabled={uploading}
                    className="h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm rounded-xl"
                  >
                    {uploading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                    Simpan Cerita
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
              alt="Pratinjau Kisah"
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
            <DialogTitle className="text-base font-black text-slate-800 tracking-tight">Hapus Kisah Cerita?</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="text-xs text-slate-500 font-normal leading-relaxed">
              Apakah Anda yakin ingin menghapus kisah cerita ini? Pemain tidak akan dapat membuka narasi ini lagi. Tindakan ini tidak dapat dibatalkan.
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
            className="bg-white border border-slate-200/80 text-slate-800 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-left space-y-4 z-[9999]"
          >
            {/* Header / Step counter */}
            <div className="flex justify-between items-center">
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                Petunjuk {tourActiveStep + 1} dari {tourSteps.length}
              </span>
              <button
                type="button"
                onClick={() => setTourActiveStep(null)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all p-1 rounded-full cursor-pointer flex items-center justify-center"
                title="Tutup Tur"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Title & Content */}
            <div className="space-y-2">
              <h3 className="text-sm font-black text-slate-800 leading-snug">{tourSteps[tourActiveStep].title}</h3>
              <p className="text-xs text-slate-500 font-normal leading-relaxed">{tourSteps[tourActiveStep].content}</p>
            </div>

            {/* Action buttons */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                disabled={tourActiveStep === 0}
                onClick={() => setTourActiveStep(prev => prev! - 1)}
                className="h-8 px-3 text-[10px] font-semibold text-slate-500 hover:bg-slate-50 rounded-lg cursor-pointer"
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
