import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import type {
  QuestItem, LocationItem, UmkmItem, BattleItem, StoryItem,
} from "@/components/admin/questTypes";
import { ITEMS_PER_PAGE } from "@/components/admin/questTypes";
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

  // ── Filter State ──
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterLevel, setFilterLevel] = useState("");

  // ── Pagination State ──
  const [currentPage, setCurrentPage] = useState(1);

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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Kelola Misi</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-normal">
            <span className="text-emerald-600 font-semibold">Eco-misi ditampilkan paling atas.</span>
            {" "}Kelola tantangan petualangan pemain.
          </p>
        </div>
        <Button onClick={handleOpenAdd}
          className="h-10 px-5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-2 shadow-sm transition-all hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          Tambah Misi
        </Button>
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
            <div key={i} className="border border-slate-200/80 bg-white overflow-hidden flex flex-col justify-between shadow-sm rounded-2xl animate-pulse">
              <div>
                <div className="h-44 bg-slate-100 w-full" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-slate-200/70 rounded-lg w-2/3" />
                  <div className="h-3 bg-slate-200/70 rounded-lg w-1/3" />
                  <div className="space-y-2 pt-2">
                    <div className="h-3 bg-slate-200/70 rounded-lg w-full" />
                    <div className="h-3 bg-slate-200/70 rounded-lg w-[90%]" />
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                    <div className="h-5 bg-slate-100 rounded-md w-12" />
                    <div className="h-5 bg-slate-100 rounded-md w-12" />
                    <div className="h-5 bg-slate-100 rounded-md w-12" />
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
      ) : paginatedQuests.length === 0 ? (
        <div className="py-20 text-center text-slate-400 text-sm font-normal">
          {sortedQuests.length === 0 ? "Belum ada misi." : "Tidak ada misi yang cocok dengan filter."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginatedQuests.map((q) => (
            <QuestCard key={q.id} quest={q} onEdit={handleOpenEdit} onDelete={setDeleteConfirmId} />
          ))}
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
        <DialogContent className="bg-white border border-slate-200/80 text-slate-800 max-w-sm rounded-2xl p-6 shadow-2xl text-left">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-slate-800 tracking-tight">Hapus Misi Petualangan?</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="text-xs text-slate-500 font-normal leading-relaxed">
              Apakah Anda yakin ingin menghapus misi petualangan ini? Progress pemain yang sedang berjalan untuk misi ini akan dibatalkan. Tindakan ini tidak dapat dibatalkan.
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
