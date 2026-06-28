import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, BookOpen, Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface StoryItem {
  id: string;
  titleId: string;
  titleEn: string;
  contentId: string;
  contentEn: string;
  category: string;
  imageUrl?: string;
  locationId: string;
  unlockedByQuestId?: string;
}

interface LocationItem {
  id: string;
  nameId: string;
}

interface QuestItem {
  id: string;
  titleId: string;
}

export default function AdminStories() {
  const toast = useToast();
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [quests, setQuests] = useState<QuestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StoryItem | null>(null);

  // Form Fields
  const [storyId, setStoryId] = useState("");
  const [titleId, setTitleId] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [contentId, setContentId] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [category, setCategory] = useState("budaya");
  const [imageUrl, setImageUrl] = useState("");
  const [locationId, setLocationId] = useState("");
  const [unlockedByQuestId, setUnlockedByQuestId] = useState("");
  const [uploading, setUploading] = useState(false);

  const categories = [
    { value: "budaya", label: "Budaya" },
    { value: "sejarah", label: "Sejarah" },
    { value: "legenda", label: "Legenda / Mitos" },
    { value: "kuliner", label: "Kuliner" },
    { value: "lingkungan", label: "Lingkungan / Alam" },
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
    fetchStories();
    fetchDependencies();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setStoryId("");
    setTitleId("");
    setTitleEn("");
    setContentId("");
    setContentEn("");
    setCategory("budaya");
    setImageUrl("");
    setLocationId(locations[0]?.id || "");
    setUnlockedByQuestId("");
    setIsOpen(true);
  };

  const handleOpenEdit = (item: StoryItem) => {
    setEditingItem(item);
    setStoryId(item.id);
    setTitleId(item.titleId);
    setTitleEn(item.titleEn);
    setContentId(item.contentId);
    setContentEn(item.contentEn);
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
    const formData = new FormData();
    formData.append("file", file);
    formData.append("entity", "stories");

    const token = localStorage.getItem("nusaquest_token");

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
    } catch (err) {
      toast.error("Gagal mengunggah gambar");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("nusaquest_token");
    const payload = {
      id: storyId || undefined,
      titleId,
      titleEn,
      contentId,
      contentEn,
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

      if (!res.ok) throw new Error("Request failed");
      setIsOpen(false);
      toast.success(editingItem ? "Kisah berhasil diperbarui!" : "Kisah baru berhasil ditambahkan!");
      fetchStories();
    } catch (err) {
      toast.error("Gagal menyimpan cerita");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus cerita ini?")) return;
    const token = localStorage.getItem("nusaquest_token");

    try {
      const res = await fetch(`/api/stories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");
      toast.success("Kisah berhasil dihapus!");
      fetchStories();
    } catch (err) {
      toast.error("Gagal menghapus cerita");
    }
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">Kisah Cerita</h2>
          <p className="text-xs font-semibold text-slate-500 mt-1">Kelola naskah narasi sejarah, budaya, dan legenda nusantara.</p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-1.5 uppercase tracking-wider shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Cerita</span>
        </Button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories.map((story) => (
            <Card key={story.id} className="border-[#E5E0D5] bg-white overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-300">
              <div>
                <div className="h-40 bg-[#F2EFE9] relative overflow-hidden">
                  {story.imageUrl ? (
                    <img src={story.imageUrl} alt={story.titleId} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-[#F2EFE9]">
                      <BookOpen className="h-12 w-12" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md">
                    {story.category}
                  </span>
                </div>
                <CardContent className="p-5 space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 leading-tight">{story.titleId}</h3>
                    <span className="text-[10px] font-bold text-slate-400 block mt-0.5">{story.titleEn}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-semibold leading-relaxed line-clamp-3">
                    {story.contentId}
                  </p>
                </CardContent>
              </div>

              <div className="p-5 pt-0 flex gap-2">
                <Button
                  onClick={() => handleOpenEdit(story)}
                  variant="outline"
                  className="flex-1 h-9 text-xs font-bold text-slate-700 border-[#E5E0D5] hover:bg-slate-50 flex items-center gap-1.5 bg-white"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Ubah</span>
                </Button>
                <Button
                  onClick={() => handleDelete(story.id)}
                  variant="ghost"
                  className="flex-1 h-9 text-xs font-bold text-red-600 hover:text-red-500 hover:bg-red-50 flex items-center gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Hapus</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-white border border-[#E5E0D5] text-slate-800 max-w-3xl overflow-y-auto max-h-[85vh] rounded-2xl shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-black uppercase tracking-widest text-slate-800">
              {editingItem ? "Ubah Naskah Cerita" : "Tambah Naskah Cerita"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold mt-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block">ID Cerita (Kustom)</label>
                <Input
                  value={storyId}
                  onChange={(e) => setStoryId(e.target.value)}
                  placeholder="e.g. story_monas_new"
                  disabled={!!editingItem}
                  className="h-9 text-xs border-[#E5E0D5] bg-white text-slate-800 focus-visible:ring-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Judul (ID)</label>
                <Input
                  value={titleId}
                  onChange={(e) => setTitleId(e.target.value)}
                  placeholder="e.g. Kisah Monas Baru"
                  required
                  className="h-9 text-xs border-[#E5E0D5] bg-white text-slate-800 focus-visible:ring-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Judul (EN)</label>
                <Input
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. Story of New Monas"
                  required
                  className="h-9 text-xs border-[#E5E0D5] bg-white text-slate-800 focus-visible:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Kategori Cerita</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-[#E5E0D5] bg-white text-slate-800 font-bold text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Upload Gambar</label>
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadImage}
                    disabled={uploading}
                    className="h-9 text-xs border-[#E5E0D5] bg-white text-slate-800 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-extrabold file:bg-slate-100 file:text-slate-700"
                  />
                  {uploading && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 text-emerald-500 animate-spin" />}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Lokasi Cerita</label>
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  required
                  className="w-full h-9 px-3 rounded-md border border-[#E5E0D5] bg-white text-slate-800 font-bold text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">Pilih Lokasi...</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.nameId}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Di-unlock Oleh Quest</label>
                <select
                  value={unlockedByQuestId}
                  onChange={(e) => setUnlockedByQuestId(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-[#E5E0D5] bg-white text-slate-800 font-bold text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">Tidak Dikunci / Mulai Terbuka...</option>
                  {quests.map((q) => (
                    <option key={q.id} value={q.id}>{q.titleId}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Konten Cerita (ID)</label>
              <textarea
                value={contentId}
                onChange={(e) => setContentId(e.target.value)}
                placeholder="Tulis naskah cerita lengkap dalam Bahasa Indonesia..."
                required
                rows={4}
                className="w-full p-3 rounded-md border border-[#E5E0D5] bg-white text-slate-800 text-xs font-semibold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Konten Cerita (EN)</label>
              <textarea
                value={contentEn}
                onChange={(e) => setContentEn(e.target.value)}
                placeholder="Write the full story script in English..."
                required
                rows={4}
                className="w-full p-3 rounded-md border border-[#E5E0D5] bg-white text-slate-800 text-xs font-semibold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <DialogFooter className="pt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="h-10 text-xs font-bold text-slate-700 border-[#E5E0D5] hover:bg-slate-50 bg-white"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={uploading}
                className="h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
              >
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
