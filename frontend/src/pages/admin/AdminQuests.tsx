import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, X, HelpCircle, Compass } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import type {
  QuestItem, LocationItem, UmkmItem, BattleItem, StoryItem,
} from "@/components/admin/questTypes";
import { ITEMS_PER_PAGE, QUEST_TYPES, DIFFICULTIES, OBJECTIVE_TYPES } from "@/components/admin/questTypes";
import QuestFilterBar from "@/components/admin/QuestFilterBar";
import QuestCard from "@/components/admin/QuestCard";
import QuestFormDialog from "@/components/admin/QuestFormDialog";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function AdminQuests() {
  const toast = useToast();

  // ── Data State ──
  const [quests, setQuests] = useState<QuestItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [umkms, setUmkms] = useState<UmkmItem[]>([]);
  const [battles, setBattles] = useState<BattleItem[]>([]);
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Dialog State ──
  const [isOpen, setIsOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<QuestItem | null>(null);
  const [viewQuest, setViewQuest] = useState<QuestItem | null>(null);

  // ── Filter State ──
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterLevel, setFilterLevel] = useState("");

  // ── Pagination State ──
  const [currentPage, setCurrentPage] = useState(1);

  // Feature Onboarding Tour States
  const [tourActiveStep, setTourActiveStep] = useState<number | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  const tourSteps = [
    {
      title: "Selamat Datang di Kelola Misi! 🧭",
      content: "Tur singkat ini akan memandu Anda secara interaktif memahami fitur-fitur utama di halaman Kelola Misi Petualangan. Klik 'Selanjutnya' untuk memulai!",
      selector: null
    },
    {
      title: "Pencarian & Filter Misi 🔍",
      content: "Gunakan panel filter ini untuk memilah misi berdasarkan tipe (kunjungan, kuis, eco-quest), tingkat kesulitan, serta level prasyarat pemain.",
      selector: "#filter-bar"
    },
    {
      title: "Tambah Misi Baru ➕",
      content: "Klik tombol ini untuk merancang misi petualangan baru. Anda dapat memautkan misi ke lokasi wisata, UMKM lokal, musuh pertempuran, atau kisah cerita.",
      selector: "#add-quest-btn"
    },
    {
      title: "Daftar Misi Petualangan 🗺️",
      content: "Seluruh misi yang terdaftar ditampilkan di sini. Anda dapat mengubah detail tantangan, mengedit opsi kuis, atau menghapus misi dengan aman.",
      selector: "#quests-grid"
    },
    {
      title: "Tur Selesai! 🎉",
      content: "Sekarang Anda siap mengelola Misi Petualangan SinopiQuest. Selamat bekerja!",
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

  // ── Data Fetching ──

  const fetchDependencies = async () => {
    try {
      const [locsRes, umkmsRes, battlesRes, storiesRes] = await Promise.all([
        fetch("/api/locations"),
        fetch("/api/umkm"),
        fetch("/api/battles"),
        fetch("/api/stories"),
      ]);
      setLocations(await locsRes.json());
      setUmkms(await umkmsRes.json());
      setBattles(await battlesRes.json());
      setStories(await storiesRes.json());
    } catch (err) {
      console.error("Dependency error:", err);
    }
  };

  const fetchQuests = () => {
    setLoading(true);
    fetch("/api/quests")
      .then((res) => res.json())
      .then((data) => setQuests(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQuests();
    fetchDependencies();
  }, []);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, filterDifficulty, filterLevel]);

  // ── Actions ──

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsOpen(true);
  };

  const handleOpenEdit = async (item: QuestItem) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/quests/${item.id}`);
      const fullQuest = await res.json();
      setEditingItem(fullQuest);
      setIsOpen(true);
    } catch {
      toast.error("Gagal memuat detail misi");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("sinopiquest_token");
    try {
      const res = await fetch(`/api/quests/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Misi berhasil dihapus!");
      fetchQuests();
    } catch {
      toast.error("Gagal menghapus misi");
    }
  };

  // ── Filter → Sort → Paginate ──

  const isFiltered = !!(searchQuery || filterType || filterDifficulty || filterLevel);

  const filteredQuests = quests.filter((q) => {
    const matchSearch = !searchQuery ||
      q.titleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.titleEn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = !filterType || q.type === filterType;
    const matchDifficulty = !filterDifficulty || q.difficulty === filterDifficulty;
    const matchLevel = !filterLevel || q.requiredLevel === parseInt(filterLevel);
    return matchSearch && matchType && matchDifficulty && matchLevel;
  });

  const sortedQuests = [...filteredQuests].sort((a, b) => {
    if (a.type === "eco" && b.type !== "eco") return -1;
    if (a.type !== "eco" && b.type === "eco") return 1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedQuests.length / ITEMS_PER_PAGE));
  const paginatedQuests = sortedQuests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ── Render ──

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

      {/* Page Header */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center gap-4 w-full">
          <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Kelola Misi</h2>
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
              id="add-quest-btn"
              onClick={handleOpenAdd}
              className="h-9 sm:h-10 px-3.5 sm:px-5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm transition-all hover:shadow-md cursor-pointer"
            >
              <Plus className="h-4 w-4" strokeWidth={3} />
              <span>Tambah Misi</span>
            </Button>
          </div>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-normal leading-relaxed">
          Kelola tantangan petualangan pemain.
        </p>
      </div>

      {/* Filter Bar */}
      <QuestFilterBar
        searchQuery={searchQuery} onSearchChange={setSearchQuery}
        filterType={filterType} onFilterTypeChange={setFilterType}
        filterDifficulty={filterDifficulty} onFilterDifficultyChange={setFilterDifficulty}
        filterLevel={filterLevel} onFilterLevelChange={setFilterLevel}
        resultCount={paginatedQuests.length}
        totalCount={sortedQuests.length}
        isFiltered={isFiltered}
      />

      {/* Quest Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col justify-between shadow-sm rounded-2xl animate-pulse">
              <div>
                <div className="h-44 bg-slate-100 dark:bg-slate-800 w-full" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-slate-200/70 dark:bg-slate-800 rounded-lg w-2/3" />
                  <div className="h-3 bg-slate-200/70 dark:bg-slate-800 rounded-lg w-1/3" />
                  <div className="space-y-2 pt-2">
                    <div className="h-3 bg-slate-200/70 dark:bg-slate-800 rounded-lg w-full" />
                    <div className="h-3 bg-slate-200/70 dark:bg-slate-800 rounded-lg w-[90%]" />
                  </div>
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                    <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-md w-12" />
                    <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-md w-12" />
                    <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-md w-12" />
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
      ) : paginatedQuests.length === 0 ? (
        <div className="py-16 px-4 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/85 dark:border-slate-800 shadow-sm max-w-md mx-auto my-8 flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 shadow-inner">
            <Compass className="h-7 w-7 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="space-y-1.5 max-w-xs">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              {isFiltered ? "Misi Tidak Ditemukan" : "Belum Ada Misi"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
              {isFiltered
                ? "Tidak ada misi petualangan yang cocok dengan kata kunci pencarian atau kombinasi filter Anda."
                : "Daftar misi petualangan masih kosong. Mulai tambahkan dengan mengeklik tombol di atas."}
            </p>
          </div>
          {isFiltered && (
            <Button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setFilterType("");
                setFilterDifficulty("");
                setFilterLevel("");
              }}
              variant="outline"
              className="h-9 px-4 text-xs font-semibold border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 rounded-full transition-all cursor-pointer shadow-xs"
            >
              Reset Filter & Pencarian
            </Button>
          )}
        </div>
      ) : (
        <div id="quests-grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginatedQuests.map((q) => (
            <QuestCard key={q.id} quest={q} onEdit={handleOpenEdit} onDelete={setDeleteConfirmId} onView={setViewQuest} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {sortedQuests.length > 0 && (
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

      {/* Form Dialog */}
      <QuestFormDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        editingItem={editingItem}
        locations={locations}
        umkms={umkms}
        battles={battles}
        stories={stories}
        onSaved={fetchQuests}
      />

      {/* Custom Delete Confirmation Modal */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-white w-[92%] sm:max-w-sm rounded-2xl p-6 shadow-2xl text-left">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-slate-800 dark:text-white tracking-tight">Hapus Misi Petualangan?</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
              Apakah Anda yakin ingin menghapus misi petualangan ini? Progress pemain yang sedang berjalan untuk misi ini akan dibatalkan. Tindakan ini tidak dapat dibatalkan.
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
      {/* Detail View Modal */}
      <Dialog open={!!viewQuest} onOpenChange={(open) => !open && setViewQuest(null)}>
        {viewQuest && (
          <DialogContent className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-white w-[92%] sm:max-w-lg overflow-y-auto max-h-[90vh] rounded-2xl shadow-2xl p-6 text-left">
            <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <DialogTitle className="text-base font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                <span>Detail Misi Petualangan</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 py-4 text-xs">
              {/* Gambar Sampul & Info Utama */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {viewQuest.imageUrl ? (
                  <img src={viewQuest.imageUrl} alt={viewQuest.titleId} className="h-44 w-full object-cover rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm" />
                ) : (
                  <div className="h-44 w-full bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500">
                    Tidak ada foto sampul
                  </div>
                )}

                <div className="space-y-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">{viewQuest.titleId}</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{viewQuest.id}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block font-normal">Kategori</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{QUEST_TYPES.find(t => t.value === viewQuest.type)?.label || viewQuest.type}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block font-normal">Tingkat Kesulitan</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{DIFFICULTIES.find(d => d.value === viewQuest.difficulty)?.label || viewQuest.difficulty}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block font-normal">Destinasi</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{locations.find(l => l.id === viewQuest.locationId)?.nameId || "-"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block font-normal">UMKM Terkait</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{umkms.find(u => u.id === viewQuest.relatedUmkmId)?.name || "Tanpa UMKM"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block font-normal">Syarat Level</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">Level {viewQuest.requiredLevel}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block font-normal">Estimasi Durasi</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{viewQuest.estimatedTimeId || "-"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deskripsi Cerita */}
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 space-y-1.5">
                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">📖 Kisah Pengantar</h4>
                <p className="text-slate-600 dark:text-slate-400 font-normal leading-relaxed">{viewQuest.descId}</p>
              </div>

              {/* Daftar Tugas */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">📝 Tugas Petualangan ({viewQuest.objectives.length})</h4>
                <div className="space-y-2">
                  {viewQuest.objectives.map((obj, index) => (
                    <div key={obj.id || index} className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 text-[10px]">Tugas #{index + 1}</span>
                        <p className="text-slate-700 dark:text-slate-300 font-medium mt-0.5">{obj.descId}</p>
                      </div>
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-semibold px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shrink-0">
                        {OBJECTIVE_TYPES.find(ot => ot.value === obj.type)?.label || obj.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hadiah Misi */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">🎁 Hadiah & Bonus</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/50 text-center">
                    <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-semibold block">Pengalaman (XP)</span>
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">+{viewQuest.reward?.xp || 0} XP</span>
                  </div>
                  <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/50 text-center">
                    <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-semibold block">Koin NusaCoin</span>
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">+{viewQuest.reward?.points || 0} Koin</span>
                  </div>
                  {viewQuest.reward?.badgeId && (
                    <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/50 text-center">
                      <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-semibold block">Lencana</span>
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 truncate block mt-0.5">{viewQuest.reward.badgeId.replace("badge_", "").replace(/_/g, " ")}</span>
                    </div>
                  )}
                  {viewQuest.reward?.voucherId && (
                    <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/50 text-center">
                      <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-semibold block">Voucher UMKM</span>
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 truncate block mt-0.5">{viewQuest.reward.voucherId.replace("voucher_", "").replace(/_/g, " ")}</span>
                    </div>
                  )}
                  {viewQuest.reward?.collectibleId && (
                    <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/50 text-center">
                      <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-semibold block">Bingkai Profil</span>
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 truncate block mt-0.5">{viewQuest.reward.collectibleId.replace("collectible_", "").replace(/_/g, " ")}</span>
                    </div>
                  )}
                  {viewQuest.reward?.storyUnlockId && (
                    <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/50 text-center col-span-full">
                      <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-semibold block">Kisah yang Terbuka</span>
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block mt-0.5">
                        {stories.find(s => s.id === viewQuest.reward?.storyUnlockId)?.titleId || viewQuest.reward.storyUnlockId}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Kuis Trivia */}
              {viewQuest.battleId && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-[10px] uppercase tracking-wider block">Kuis Terhubung</span>
                    <span className="text-slate-600 dark:text-slate-400 font-normal text-[11px] mt-0.5">
                      {battles.find(b => b.id === viewQuest.battleId)?.titleId || viewQuest.battleId}
                    </span>
                  </div>
                  <span className="bg-emerald-650 text-white text-[9px] font-bold px-2 py-0.5 rounded-md">Aktif</span>
                </div>
              )}
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
              <Button type="button" onClick={() => setViewQuest(null)} className="h-9 px-4 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-semibold cursor-pointer">
                Tutup Detail
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
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
