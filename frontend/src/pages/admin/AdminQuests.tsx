import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit2, Trash2, Sword, Loader2, X, PlusCircle } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface QuestObjective {
  id?: string;
  descId: string;
  descEn: string;
  type: string;
  sortOrder: number;
}

interface QuestReward {
  xp: number;
  points: number;
  badgeId?: string | null;
  voucherId?: string | null;
  collectibleId?: string | null;
  storyUnlockId?: string | null;
}

interface QuestItem {
  id: string;
  titleId: string;
  titleEn: string;
  descId: string;
  descEn: string;
  type: string;
  difficulty: string;
  requiredLevel: number;
  availableLevels: number[];
  estimatedTimeId?: string;
  estimatedTimeEn?: string;
  imageUrl?: string;
  locationId: string;
  relatedUmkmId?: string;
  objectives: QuestObjective[];
  reward?: QuestReward;
  battleId?: string;
}

interface LocationItem {
  id: string;
  nameId: string;
}

interface UmkmItem {
  id: string;
  name: string;
}

interface BattleItem {
  id: string;
  titleId: string;
}

interface StoryItem {
  id: string;
  titleId: string;
}

export default function AdminQuests() {
  const toast = useToast();
  const [quests, setQuests] = useState<QuestItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [umkms, setUmkms] = useState<UmkmItem[]>([]);
  const [battles, setBattles] = useState<BattleItem[]>([]);
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<QuestItem | null>(null);

  // Form Fields
  const [questId, setQuestId] = useState("");
  const [titleId, setTitleId] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descId, setDescId] = useState("");
  const [descEn, setDescEn] = useState("");
  const [type, setType] = useState("main");
  const [difficulty, setDifficulty] = useState("easy");
  const [requiredLevel, setRequiredLevel] = useState("1");
  const [availableLevels, setAvailableLevels] = useState<number[]>([1]);
  const [estimatedTimeId, setEstimatedTimeId] = useState("");
  const [estimatedTimeEn, setEstimatedTimeEn] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [locationId, setLocationId] = useState("");
  const [relatedUmkmId, setRelatedUmkmId] = useState("");
  const [battleId, setBattleId] = useState("");
  const [uploading, setUploading] = useState(false);

  // Objectives Builder
  const [objectives, setObjectives] = useState<QuestObjective[]>([]);

  // Rewards fields
  const [rewardXp, setRewardXp] = useState("100");
  const [rewardPoints, setRewardPoints] = useState("50");
  const [rewardBadge, setRewardBadge] = useState("");
  const [rewardVoucher, setRewardVoucher] = useState("");
  const [rewardCollectible, setRewardCollectible] = useState("");
  const [rewardStory, setRewardStory] = useState("");

  const questTypes = [
    { value: "main", label: "Misi Utama (Main)" },
    { value: "side", label: "Misi Sampingan (Side)" },
    { value: "cultural", label: "Wisata Budaya" },
    { value: "historical", label: "Wisata Sejarah" },
    { value: "culinary", label: "Wisata Kuliner" },
    { value: "eco", label: "Ecowisata / Lingkungan" },
    { value: "umkm_quest", label: "Mitra UMKM" },
    { value: "photo", label: "Tantangan Foto" },
    { value: "ar_treasure", label: "AR Harta Karun" },
    { value: "educational", label: "Edukasi Warisan" },
  ];

  const difficulties = [
    { value: "easy", label: "Mudah (Easy)" },
    { value: "medium", label: "Sedang (Medium)" },
    { value: "hard", label: "Sulit (Hard)" },
  ];

  const objectiveTypes = [
    { value: "visit_location", label: "Kunjungi Lokasi Wisata" },
    { value: "scan_qr", label: "Pindai QR Code Destinasi" },
    { value: "answer_quiz", label: "Jawab Kuis Pengetahuan" },
    { value: "take_photo", label: "Ambil Foto Spot Wisata" },
    { value: "buy_product", label: "Beli Produk UMKM Lokal" },
    { value: "write_review", label: "Tulis Ulasan Destinasi" },
    { value: "eco_action", label: "Aksi Ramah Lingkungan" },
    { value: "social_interact", label: "Sosialisasi Warga Lokal" },
  ];

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

  const handleOpenAdd = () => {
    setEditingItem(null);
    setQuestId("");
    setTitleId("");
    setTitleEn("");
    setDescId("");
    setDescEn("");
    setType("main");
    setDifficulty("easy");
    setRequiredLevel("1");
    setAvailableLevels([1]);
    setEstimatedTimeId("");
    setEstimatedTimeEn("");
    setImageUrl("");
    setLocationId(locations[0]?.id || "");
    setRelatedUmkmId("");
    setBattleId("");
    setObjectives([
      { descId: "Kunjungi lokasi destinasi wisata", descEn: "Visit the tourism destination", type: "visit_location", sortOrder: 0 }
    ]);
    setRewardXp("100");
    setRewardPoints("50");
    setRewardBadge("");
    setRewardVoucher("");
    setRewardCollectible("");
    setRewardStory("");
    setIsOpen(true);
  };

  const handleOpenEdit = async (item: QuestItem) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/quests/${item.id}`);
      const fullQuest = await res.json();
      
      setEditingItem(fullQuest);
      setQuestId(fullQuest.id);
      setTitleId(fullQuest.titleId);
      setTitleEn(fullQuest.titleEn);
      setDescId(fullQuest.descId);
      setDescEn(fullQuest.descEn);
      setType(fullQuest.type);
      setDifficulty(fullQuest.difficulty);
      setRequiredLevel(fullQuest.requiredLevel.toString());
      setAvailableLevels(fullQuest.availableLevels || [1]);
      setEstimatedTimeId(fullQuest.estimatedTimeId || "");
      setEstimatedTimeEn(fullQuest.estimatedTimeEn || "");
      setImageUrl(fullQuest.imageUrl || "");
      setLocationId(fullQuest.locationId);
      setRelatedUmkmId(fullQuest.relatedUmkmId || "");
      setBattleId(fullQuest.battleId || "");
      setObjectives(fullQuest.objectives || []);

      const r = fullQuest.reward;
      setRewardXp(r ? r.xp.toString() : "100");
      setRewardPoints(r ? r.points.toString() : "50");
      setRewardBadge(r?.badgeId || "");
      setRewardVoucher(r?.voucherId || "");
      setRewardCollectible(r?.collectibleId || "");
      setRewardStory(r?.storyUnlockId || "");
      setIsOpen(true);
    } catch (err) {
      toast.error("Gagal memuat detail misi");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("entity", "quests");

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

  const handleAddObjective = () => {
    setObjectives([
      ...objectives,
      { descId: "", descEn: "", type: "visit_location", sortOrder: objectives.length }
    ]);
  };

  const handleRemoveObjective = (index: number) => {
    setObjectives(objectives.filter((_, idx) => idx !== index));
  };

  const handleObjectiveChange = (index: number, field: keyof QuestObjective, value: string) => {
    const updated = [...objectives];
    updated[index] = { ...updated[index], [field]: value };
    setObjectives(updated);
  };

  const handleLevelCheckbox = (lvl: number, checked: boolean) => {
    if (checked) {
      setAvailableLevels([...availableLevels, lvl].sort((a, b) => a - b));
    } else {
      setAvailableLevels(availableLevels.filter((l) => l !== lvl));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!availableLevels.length) {
      toast.error("Harap pilih minimal satu tingkat level!");
      return;
    }

    const token = localStorage.getItem("nusaquest_token");
    const payload = {
      id: questId || undefined,
      titleId,
      titleEn,
      descId,
      descEn,
      type,
      difficulty,
      requiredLevel: parseInt(requiredLevel) || 1,
      availableLevels,
      estimatedTimeId,
      estimatedTimeEn,
      imageUrl,
      locationId,
      relatedUmkmId: relatedUmkmId || null,
      battleId: battleId || null,
      objectives: objectives.map((obj, index) => ({
        ...obj,
        sortOrder: index
      })),
      reward: {
        xp: parseInt(rewardXp) || 0,
        points: parseInt(rewardPoints) || 0,
        badgeId: rewardBadge || null,
        voucherId: rewardVoucher || null,
        collectibleId: rewardCollectible || null,
        storyUnlockId: rewardStory || null,
      }
    };

    const method = editingItem ? "PUT" : "POST";
    const url = editingItem ? `/api/quests/${editingItem.id}` : "/api/quests";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Save failed");
      setIsOpen(false);
      toast.success(editingItem ? "Misi berhasil diperbarui!" : "Misi baru berhasil ditambahkan!");
      fetchQuests();
    } catch (err) {
      toast.error("Gagal menyimpan misi");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus misi ini?")) return;
    const token = localStorage.getItem("nusaquest_token");

    try {
      const res = await fetch(`/api/quests/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Delete failed");
      toast.success("Misi berhasil dihapus!");
      fetchQuests();
    } catch (err) {
      toast.error("Gagal menghapus misi");
    }
  };

  // Sort eco/lingkungan quests first as requested by client
  const sortedQuests = [...quests].sort((a, b) => {
    if (a.type === "eco" && b.type !== "eco") return -1;
    if (a.type !== "eco" && b.type === "eco") return 1;
    return 0;
  });

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">Misi (Quest)</h2>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            <span className="text-emerald-600 font-extrabold block md:inline md:mr-1">Prioritas: Ecowisata (Eco-misi) ditampilkan paling atas.</span>
            Kelola tantangan petualangan pemain.
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-1.5 uppercase tracking-wider shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Misi</span>
        </Button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedQuests.map((q) => (
            <Card key={q.id} className={`border-[#E5E0D5] bg-white overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 relative ${q.type === "eco" ? "ring-2 ring-emerald-600/30" : ""}`}>
              {q.type === "eco" && (
                <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shadow-md z-20">
                  Priority Eco Action
                </span>
              )}
              <div>
                <div className="h-40 bg-[#F2EFE9] relative overflow-hidden">
                  {q.imageUrl ? (
                    <img src={q.imageUrl} alt={q.titleId} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-[#F2EFE9]">
                      <Sword className="h-12 w-12" />
                    </div>
                  )}
                  <span className={`absolute top-3 left-3 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md ${
                    q.type === "eco" ? "bg-emerald-600" : "bg-slate-600"
                  }`}>
                    {q.type}
                  </span>
                </div>
                <CardContent className="p-5 space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 leading-tight">{q.titleId}</h3>
                    <span className="text-[10px] font-bold text-slate-400 block mt-0.5">{q.titleEn}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-semibold leading-relaxed line-clamp-3">
                    {q.descId}
                  </p>
                  <div className="pt-2 border-t border-[#E5E0D5] flex flex-wrap gap-x-4 gap-y-1 text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                    <span>Lvl: {q.requiredLevel}</span>
                    <span>Tingkat: {q.difficulty}</span>
                    <span>Objektif: {q.objectives?.length || 0}</span>
                    <span>XP: {q.reward?.xp || 0}</span>
                  </div>
                </CardContent>
              </div>

              <div className="p-5 pt-0 flex gap-2">
                <Button
                  onClick={() => handleOpenEdit(q)}
                  variant="outline"
                  className="flex-1 h-9 text-xs font-bold text-slate-700 border-[#E5E0D5] hover:bg-slate-50 flex items-center gap-1.5 bg-white"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Ubah</span>
                </Button>
                <Button
                  onClick={() => handleDelete(q.id)}
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
        <DialogContent className="bg-white border border-[#E5E0D5] text-slate-800 max-w-4xl overflow-y-auto max-h-[85vh] rounded-2xl shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-black uppercase tracking-widest text-slate-800">
              {editingItem ? "Ubah Misi (Quest)" : "Tambah Misi (Quest)"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 text-xs font-bold mt-2">
            
            {/* Section 1: Info Dasar */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b border-[#E5E0D5] pb-1">1. Informasi Utama</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider block">ID Misi (Kustom)</label>
                  <Input
                    value={questId}
                    onChange={(e) => setQuestId(e.target.value)}
                    placeholder="e.g. quest_eco_mangrove_2"
                    disabled={!!editingItem}
                    className="h-9 text-xs border-[#E5E0D5] bg-white text-slate-800 focus-visible:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Judul Misi (ID)</label>
                  <Input
                    value={titleId}
                    onChange={(e) => setTitleId(e.target.value)}
                    placeholder="e.g. Tanam Bakau Pesisir"
                    required
                    className="h-9 text-xs border-[#E5E0D5] bg-white text-slate-800 focus-visible:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Judul Misi (EN)</label>
                  <Input
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="e.g. Plant Coastal Mangrove"
                    required
                    className="h-9 text-xs border-[#E5E0D5] bg-white text-slate-800 focus-visible:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Tipe Misi</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full h-9 px-3 rounded-md border border-[#E5E0D5] bg-white text-slate-800 font-bold text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    {questTypes.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Tingkat Kesulitan</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full h-9 px-3 rounded-md border border-[#E5E0D5] bg-white text-slate-800 font-bold text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    {difficulties.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Lokasi Terkait</label>
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
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Syarat Level</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={requiredLevel}
                    onChange={(e) => setRequiredLevel(e.target.value)}
                    required
                    className="h-9 text-xs border-[#E5E0D5] bg-white text-slate-800 focus-visible:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Estimasi Waktu (ID)</label>
                  <Input
                    value={estimatedTimeId}
                    onChange={(e) => setEstimatedTimeId(e.target.value)}
                    placeholder="e.g. 30 menit"
                    className="h-9 text-xs border-[#E5E0D5] bg-white text-slate-800 focus-visible:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Estimasi Waktu (EN)</label>
                  <Input
                    value={estimatedTimeEn}
                    onChange={(e) => setEstimatedTimeEn(e.target.value)}
                    placeholder="e.g. 30 minutes"
                    className="h-9 text-xs border-[#E5E0D5] bg-white text-slate-800 focus-visible:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Upload Gambar Misi</label>
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadImage}
                      disabled={uploading}
                      className="h-9 text-xs border-[#E5E0D5] bg-white text-slate-800 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-extrabold file:bg-[#F2EFE9] file:text-slate-700"
                    />
                    {uploading && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 text-emerald-500 animate-spin" />}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Tautan UMKM Partner (Opsional)</label>
                  <select
                    value={relatedUmkmId}
                    onChange={(e) => setRelatedUmkmId(e.target.value)}
                    className="w-full h-9 px-3 rounded-md border border-[#E5E0D5] bg-white text-slate-800 font-bold text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">Tanpa UMKM...</option>
                    {umkms.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Deskripsi Misi (ID)</label>
                  <textarea
                    value={descId}
                    onChange={(e) => setDescId(e.target.value)}
                    placeholder="Tulis deskripsi misi bahasa Indonesia..."
                    required
                    rows={2}
                    className="w-full p-2.5 rounded-md border border-[#E5E0D5] bg-white text-slate-800 text-xs font-semibold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Deskripsi Misi (EN)</label>
                  <textarea
                    value={descEn}
                    onChange={(e) => setDescEn(e.target.value)}
                    placeholder="Write quest description in English..."
                    required
                    rows={2}
                    className="w-full p-2.5 rounded-md border border-[#E5E0D5] bg-white text-slate-800 text-xs font-semibold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Ketersediaan Level */}
            <div className="space-y-2 bg-[#FAF8F5] p-4 rounded-xl border border-[#E5E0D5]">
              <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">2. Ketersediaan Misi pada Level Pemain</h3>
              <div className="flex flex-wrap gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => {
                  const isChecked = availableLevels.includes(lvl);
                  return (
                    <label key={lvl} className="flex items-center gap-1.5 cursor-pointer select-none">
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => handleLevelCheckbox(lvl, !!checked)}
                        className="border-[#E5E0D5] bg-white data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                      />
                      <span className="text-slate-700 text-xs font-bold">Lvl {lvl}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Objectives Builder */}
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-[#E5E0D5] pb-1">
                <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">3. Objektif Target Misi (Checklist)</h3>
                <Button
                  type="button"
                  onClick={handleAddObjective}
                  className="h-7 text-[9px] font-black bg-slate-100 hover:bg-slate-200 text-slate-700 border border-[#E5E0D5] rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Tambah Target</span>
                </Button>
              </div>

              {objectives.length === 0 ? (
                <div className="py-4 text-center text-slate-400 text-xs italic">Belum ada objektif. Klik 'Tambah Target' untuk membuat checklist misi.</div>
              ) : (
                <div className="space-y-3.5">
                  {objectives.map((obj, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-[#FAF8F5] border border-[#E5E0D5] rounded-xl relative">
                      <button
                        type="button"
                        onClick={() => handleRemoveObjective(idx)}
                        className="absolute -top-2 -right-2 h-5 w-5 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-500 cursor-pointer shadow"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <div className="grid grid-cols-3 gap-4 w-full">
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500 uppercase">Deskripsi Target ID</label>
                          <Input
                            value={obj.descId}
                            onChange={(e) => handleObjectiveChange(idx, "descId", e.target.value)}
                            placeholder="e.g. Kunjungi Mangrove PIK"
                            required
                            className="h-8 text-xs border-[#E5E0D5] bg-white text-slate-800 focus-visible:ring-emerald-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500 uppercase">Deskripsi Target EN</label>
                          <Input
                            value={obj.descEn}
                            onChange={(e) => handleObjectiveChange(idx, "descEn", e.target.value)}
                            placeholder="e.g. Visit PIK Mangrove"
                            required
                            className="h-8 text-xs border-[#E5E0D5] bg-white text-slate-800 focus-visible:ring-emerald-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] text-slate-500 uppercase">Metode Validasi</label>
                          <select
                            value={obj.type}
                            onChange={(e) => handleObjectiveChange(idx, "type", e.target.value)}
                            className="w-full h-8 px-2 rounded-md border border-[#E5E0D5] bg-white text-slate-800 font-bold text-xs focus:outline-none"
                          >
                            {objectiveTypes.map((ot) => (
                              <option key={ot.value} value={ot.value}>{ot.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 4: Rewards & Story */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b border-[#E5E0D5] pb-1">4. Hadiah &amp; Hadiah Cerita</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Bonus EXP</label>
                  <Input
                    type="number"
                    value={rewardXp}
                    onChange={(e) => setRewardXp(e.target.value)}
                    required
                    className="h-9 text-xs border-[#E5E0D5] bg-white text-slate-800 focus-visible:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Bonus Koin Poin</label>
                  <Input
                    type="number"
                    value={rewardPoints}
                    onChange={(e) => setRewardPoints(e.target.value)}
                    required
                    className="h-9 text-xs border-[#E5E0D5] bg-white text-slate-800 focus-visible:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Unlock Kisah Cerita</label>
                  <select
                    value={rewardStory}
                    onChange={(e) => setRewardStory(e.target.value)}
                    className="w-full h-9 px-3 rounded-md border border-[#E5E0D5] bg-white text-slate-800 font-bold text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">Tidak ada...</option>
                    {stories.map((st) => (
                      <option key={st.id} value={st.id}>{st.titleId}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Bonus Lencana (Badge ID)</label>
                  <Input
                    value={rewardBadge}
                    onChange={(e) => setRewardBadge(e.target.value)}
                    placeholder="e.g. badge_eco_warrior"
                    className="h-9 text-xs border-[#E5E0D5] bg-white text-slate-800 focus-visible:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Voucher ID (Merchant)</label>
                  <Input
                    value={rewardVoucher}
                    onChange={(e) => setRewardVoucher(e.target.value)}
                    placeholder="e.g. voucher_bakmi"
                    className="h-9 text-xs border-[#E5E0D5] bg-white text-slate-800 focus-visible:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase block">Collectible Frame ID</label>
                  <Input
                    value={rewardCollectible}
                    onChange={(e) => setRewardCollectible(e.target.value)}
                    placeholder="e.g. collectible_tmii_frame"
                    className="h-9 text-xs border-[#E5E0D5] bg-white text-slate-800 focus-visible:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Battle/Quiz linkage */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b border-[#E5E0D5] pb-1">5. Tautan Kuis Pertempuran (Knowledge Battle)</h3>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase block">Battle Challenge Link</label>
                <select
                  value={battleId}
                  onChange={(e) => setBattleId(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-[#E5E0D5] bg-white text-slate-800 font-bold text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">Tidak ditautkan kuis...</option>
                  {battles.map((bt) => (
                    <option key={bt.id} value={bt.id}>{bt.titleId}</option>
                  ))}
                </select>
              </div>
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
                Simpan Misi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
