import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, X, PlusCircle, ChevronLeft, ChevronRight, Check, ArrowUp, ArrowDown, Compass } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import FieldGroup from "./FieldGroup";
import type {
  QuestItem, QuestObjective, LocationItem, UmkmItem, BattleItem, StoryItem,
} from "./questTypes";
import {
  QUEST_TYPES, DIFFICULTIES, OBJECTIVE_TYPES, STEP_LABELS,
} from "./questTypes";

interface QuestFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: QuestItem | null;
  locations: LocationItem[];
  umkms: UmkmItem[];
  battles: BattleItem[];
  stories: StoryItem[];
  onSaved: () => void;
}

export default function QuestFormDialog({
  open, onOpenChange, editingItem,
  locations, umkms, battles, stories,
  onSaved,
}: QuestFormDialogProps) {
  const toast = useToast();
  const [formStep, setFormStep] = useState(1);
  const [wasValidated, setWasValidated] = useState(false);

  // ── Form Fields ──
  const [questId, setQuestId] = useState("");
  const [titleId, setTitleId] = useState("");
  const [descId, setDescId] = useState("");
  const [type, setType] = useState("main");
  const [difficulty, setDifficulty] = useState("easy");
  const [requiredLevel, setRequiredLevel] = useState("1");
  const [availableLevels, setAvailableLevels] = useState<number[]>([1]);
  const [estimatedTimeId, setEstimatedTimeId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [locationId, setLocationId] = useState("");
  const [relatedUmkmId, setRelatedUmkmId] = useState("");
  const [battleId, setBattleId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [objectives, setObjectives] = useState<QuestObjective[]>([]);
  const [rewardXp, setRewardXp] = useState("100");
  const [rewardPoints, setRewardPoints] = useState("50");
  const [rewardBadge, setRewardBadge] = useState("");
  const [rewardVoucher, setRewardVoucher] = useState("");
  const [rewardCollectible, setRewardCollectible] = useState("");
  const [rewardStory, setRewardStory] = useState("");

  const [isDirty, setIsDirty] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState("");

  // Reset form when dialog opens
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isDirty) {
      const confirmClose = window.confirm("Ada perubahan yang belum disimpan. Yakin ingin keluar?");
      if (!confirmClose) return;
    }
    if (nextOpen && !editingItem) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const resetForm = () => {
    setFormStep(1);
    setWasValidated(false);
    setQuestId("");
    setTitleId("");
    setDescId("");
    setType("main");
    setDifficulty("easy");
    setRequiredLevel("1");
    setAvailableLevels([1]);
    setEstimatedTimeId("30");
    setImageUrl("");
    setLocationId(locations[0]?.id || "");
    setRelatedUmkmId("");
    setBattleId("");
    setObjectives([]);
    setRewardXp("100");
    setRewardPoints("50");
    setRewardBadge("");
    setRewardVoucher("");
    setRewardCollectible("");
    setRewardStory("");
    setIsDirty(false);
  };

  // Populate form from editing item
  const populateForm = (fullQuest: QuestItem) => {
    setFormStep(1);
    setWasValidated(false);
    setQuestId(fullQuest.id);
    setTitleId(fullQuest.titleId);
    setDescId(fullQuest.descId);
    setType(fullQuest.type);
    setDifficulty(fullQuest.difficulty);
    setRequiredLevel(fullQuest.requiredLevel.toString());
    setAvailableLevels(fullQuest.availableLevels || [1]);
    setEstimatedTimeId(fullQuest.estimatedTimeId ? (parseInt(fullQuest.estimatedTimeId) || 30).toString() : "30");
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
    setIsDirty(false);
  };

  // Synchronize editing item status
  useEffect(() => {
    if (open) {
      if (editingItem) {
        populateForm(editingItem);
      } else {
        resetForm();
      }
    }
  }, [open, editingItem]);

  // Step validation check utility
  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!questId.trim()) {
        toast.error("ID Misi belum terisi — silakan isi judul misi terlebih dahulu.");
        return false;
      }
      if (!titleId.trim()) {
        toast.error("Judul Misi wajib diisi!");
        return false;
      }
      if (!locationId) {
        toast.error("Destinasi Wisata wajib dipilih!");
        return false;
      }
      if (!requiredLevel) {
        toast.error("Syarat Minimum Level wajib dipilih!");
        return false;
      }
      if (!descId.trim()) {
        toast.error("Deskripsi Cerita Misi wajib diisi!");
        return false;
      }
    }
    if (step === 2) {
      if (!availableLevels.length) {
        toast.error("Pilih minimal satu level yang bisa mengakses misi ini!");
        return false;
      }
      if (!objectives.length) {
        toast.error("Tambahkan minimal satu tugas untuk misi ini!");
        return false;
      }
      if (objectives.some(obj => !obj.descId.trim())) {
        toast.error("Ada tugas yang belum diisi deskripsinya — lengkapi semua tugas.");
        return false;
      }
    }
    return true;
  };

  // Stepper Header validation wrapper
  const handleStepClick = (targetStep: number) => {
    setWasValidated(true);
    if (targetStep > 1 && !validateStep(1)) return;
    if (targetStep > 2 && !validateStep(2)) return;
    setFormStep(targetStep);
  };

  // Next Step validation wrapper
  const handleNextStep = () => {
    setWasValidated(true);
    if (formStep === 1) {
      if (validateStep(1)) {
        setFormStep(2);
      }
    } else if (formStep === 2) {
      if (validateStep(2)) {
        setFormStep(3);
      }
    }
  };

  // Levels toggle selectors
  const handleSelectAllLevels = () => {
    setAvailableLevels([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    setIsDirty(true);
  };

  const handleClearAllLevels = () => {
    setAvailableLevels([]);
    setIsDirty(true);
  };

  // Objectives list reordering
  const handleMoveObjective = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === objectives.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...objectives];
    
    // Swap elements
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Map new sortOrder
    const finalObjectives = updated.map((obj, i) => ({ ...obj, sortOrder: i }));
    setObjectives(finalObjectives);
    setIsDirty(true);
  };

  // ── Handlers ──

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
      toast.error("Ukuran berkas terlalu besar! Maksimal ukuran gambar adalah 2 MB.");
      e.target.value = "";
      return;
    }

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
    formData.append("entity", "quests");
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

  const handleAddObjective = () => {
    setObjectives([...objectives, { descId: "", type: "visit_location", sortOrder: objectives.length }]);
    setIsDirty(true);
  };

  const handleRemoveObjective = (index: number) => {
    setObjectives(objectives.filter((_, idx) => idx !== index));
    setIsDirty(true);
  };

  const handleObjectiveChange = (index: number, field: keyof QuestObjective, value: string) => {
    const updated = [...objectives];
    updated[index] = { ...updated[index], [field]: value };
    setObjectives(updated);
    setIsDirty(true);
  };

  const handleLevelCheckbox = (lvl: number, checked: boolean) => {
    setIsDirty(true);
    if (checked) {
      setAvailableLevels([...availableLevels, lvl].sort((a, b) => a - b));
    } else {
      setAvailableLevels(availableLevels.filter((l) => l !== lvl));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWasValidated(true);

    if (formStep === 1) {
      if (!questId.trim() || !titleId.trim() || !descId.trim() || !locationId) {
        toast.error("Lengkapi semua kolom bertanda bintang (*) sebelum melanjutkan.");
        return;
      }
      setFormStep(2);
      return;
    }

    if (formStep === 2) {
      if (!availableLevels.length) {
        toast.error("Pilih minimal satu level yang bisa mengakses misi ini!");
        return;
      }
      if (!objectives.length) {
        toast.error("Tambahkan minimal satu tugas untuk misi ini!");
        return;
      }
      if (objectives.some(obj => !obj.descId.trim())) {
        toast.error("Ada tugas yang belum diisi deskripsinya — lengkapi semua tugas.");
        return;
      }
      setFormStep(3);
      return;
    }

    if (!availableLevels.length) {
      toast.error("Pilih minimal satu level yang bisa mengakses misi ini!");
      return;
    }
    const token = localStorage.getItem("sinopiquest_token");
    const payload = {
      id: questId || undefined,
      titleId, descId, type, difficulty,
      requiredLevel: parseInt(requiredLevel) || 1,
      availableLevels,
      estimatedTimeId: estimatedTimeId ? `${estimatedTimeId} menit` : "",
      imageUrl, locationId,
      relatedUmkmId: relatedUmkmId || null,
      battleId: battleId || null,
      objectives: objectives.map((obj, index) => ({ ...obj, sortOrder: index })),
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      onOpenChange(false);
      toast.success(editingItem ? "Misi berhasil diperbarui!" : "Misi baru berhasil ditambahkan!");
      onSaved();
    } catch {
      toast.error("Gagal menyimpan misi");
    }
  };

  // ── Shared input classes ──
  const inputClass = "h-10 text-sm border-slate-200 bg-white text-slate-800 focus-visible:ring-emerald-500 font-normal rounded-xl placeholder:text-slate-400";
  const selectClass = "w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:outline-none font-normal transition-all";
  const textareaClass = "w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-normal focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:outline-none resize-none transition-all";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-white border border-slate-200/80 text-slate-800 max-w-3xl overflow-y-auto max-h-[92vh] rounded-2xl shadow-2xl p-0 gap-0">
        <DialogHeader className="px-6 sm:px-8 pt-6 pb-0">
          <DialogTitle className="text-lg font-black text-slate-800 tracking-tight">
            {editingItem ? "Ubah Misi" : "Tambah Misi Baru"}
          </DialogTitle>
        </DialogHeader>

        {/* ── Stepper Progress ── */}
        <div className="px-6 sm:px-8 pt-5 pb-3">
          <div className="flex items-center gap-0">
            {STEP_LABELS.map((s, i) => (
              <div key={s.num} className="flex items-center flex-1">
                <button
                  type="button"
                  onClick={() => handleStepClick(s.num)}
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
                {i < STEP_LABELS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 rounded-full transition-all ${
                    formStep > s.num ? "bg-emerald-400" : "bg-slate-100"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 sm:px-8 pb-6">

          {/* ═══ STEP 1: Informasi Dasar ═══ */}
          {formStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <p className="text-xs text-slate-400 font-normal">Tentukan identitas, kategori, dan deskripsi petualangan misi.</p>
              
              {/* ── Identitas Misi ── */}
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-4">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">🏷️ Identitas Misi</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldGroup label="Judul Misi" hint="Nama misi yang tampil di aplikasi penjelajah" required>
                    <Input value={titleId} onChange={(e) => {
                      const raw = e.target.value;
                      const formattedVal = raw.length === 1 ? raw.toUpperCase() : raw.charAt(0).toUpperCase() + raw.slice(1);
                      setTitleId(formattedVal);
                      setIsDirty(true);
                      // Auto-generate ID from title if not editing
                      if (!editingItem) {
                        const autoId = formattedVal.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim().replace(/\s+/g, "_");
                        setQuestId(autoId ? `misi_${autoId}` : "");
                      }
                    }} placeholder="contoh: Tanam bakau pesisir" required className={`${inputClass} ${wasValidated && !titleId.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}`} />
                  </FieldGroup>
                  <FieldGroup label="ID Misi" hint="Terisi otomatis dari judul — bisa diubah manual jika perlu" required>
                    <Input value={questId} onChange={(e) => { setQuestId(e.target.value); setIsDirty(true); }} placeholder="terisi otomatis..." disabled={!!editingItem} className={`${inputClass} font-mono text-xs ${wasValidated && !questId.trim() ? "border-red-500 focus-visible:ring-red-500" : ""} ${!editingItem ? "bg-slate-50" : ""}`} />
                  </FieldGroup>
                </div>
              </div>

              {/* ── Pengaturan Misi ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldGroup label="Kategori Misi" hint="Rumpun atau jenis petualangan misi">
                  <select value={type} onChange={(e) => { setType(e.target.value); setIsDirty(true); }} className={selectClass}>
                    {QUEST_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </FieldGroup>
                <FieldGroup label="Tingkat Kesulitan" hint="Seberapa berat tantangan misi bagi pemain">
                  <select value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setIsDirty(true); }} className={selectClass}>
                    {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </FieldGroup>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldGroup label="Destinasi Wisata" hint="Lokasi utama tempat misi ini berlangsung" required>
                  <select value={locationId} onChange={(e) => { setLocationId(e.target.value); setIsDirty(true); }} required className={`${selectClass} ${wasValidated && !locationId ? "border-red-500" : ""}`}>
                    <option value="">Pilih lokasi destinasi...</option>
                    {locations.map((loc) => <option key={loc.id} value={loc.id}>{loc.nameId}</option>)}
                  </select>
                </FieldGroup>
                <FieldGroup label="UMKM Mitra Terkait" hint="Hubungkan jika misi ini melibatkan belanja/kunjungan UMKM">
                  <select value={relatedUmkmId} onChange={(e) => { setRelatedUmkmId(e.target.value); setIsDirty(true); }} className={selectClass}>
                    <option value="">Tanpa UMKM</option>
                    {umkms.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </FieldGroup>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldGroup label="Syarat Minimum Level" hint="Level karakter minimal agar pemain bisa menerima misi ini" required>
                  <select value={requiredLevel} onChange={(e) => { setRequiredLevel(e.target.value); setIsDirty(true); }} className={selectClass}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                      <option key={lvl} value={lvl.toString()}>Level {lvl}</option>
                    ))}
                  </select>
                </FieldGroup>
                <FieldGroup label="Estimasi Durasi" hint="Perkiraan waktu penyelesaian misi dalam satuan menit" required>
                  <div className="relative flex items-center">
                    <Input type="number" min="1" value={estimatedTimeId} onChange={(e) => { setEstimatedTimeId(e.target.value); setIsDirty(true); }} placeholder="contoh: 30" required className={`${inputClass} pr-16 w-full`} />
                    <span className="absolute right-3.5 text-xs font-semibold text-slate-400 select-none">menit</span>
                  </div>
                </FieldGroup>
              </div>

              {/* ── Foto Sampul (Full Width) ── */}
              <FieldGroup label="Foto Sampul Misi" hint="Unggah gambar ilustrasi misi (format: JPG, PNG, HEIC)">
                <div className="relative">
                  <Input type="file" accept="image/*" onChange={(e) => { handleUploadImage(e); setIsDirty(true); }} disabled={uploading}
                    className="h-10 text-sm border-slate-200 bg-white text-slate-800 font-normal rounded-xl file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700"
                  />
                  {uploading && <Loader2 className="absolute right-3 top-3 h-4 w-4 text-emerald-500 animate-spin" />}
                </div>
                {imageUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 w-full group mt-2">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="h-40 w-full object-cover select-none cursor-zoom-in hover:opacity-90 transition-opacity"
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
                          setIsDirty(true);
                        }}
                        className="h-8 px-3 text-[10px] font-bold bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-sm cursor-pointer pointer-events-auto"
                      >
                        Hapus Foto
                      </Button>
                    </div>
                  </div>
                )}
              </FieldGroup>

              {/* ── Deskripsi (Full Width) ── */}
              <FieldGroup label="Deskripsi Cerita Misi" hint="Tuliskan kisah pengantar petualangan atau panduan umum misi ini" required>
                <textarea value={descId} onChange={(e) => { setDescId(e.target.value); setIsDirty(true); }} placeholder="Tuliskan latar belakang petualangan atau petunjuk bagi pemain..." required rows={4} className={`${textareaClass} ${wasValidated && !descId.trim() ? "border-red-500" : ""}`} />
              </FieldGroup>
            </div>
          )}

          {/* ═══ STEP 2: Target & Level ═══ */}
          {formStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <p className="text-xs text-slate-400 font-normal">Tentukan siapa yang bisa bermain misi ini dan apa saja tugas yang harus diselesaikan.</p>

              {/* Level Checkboxes */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h3 className="text-xs font-black text-emerald-700 uppercase tracking-wider">Level yang Bisa Bermain</h3>
                    <p className="text-[11px] text-slate-400 font-normal mt-0.5">Centang level pemain yang diizinkan mengambil misi ini.</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button type="button" onClick={handleSelectAllLevels}
                      className="h-7 px-2 text-[10px] font-bold bg-white hover:bg-slate-50 text-emerald-700 border border-slate-200 rounded-lg shadow-sm cursor-pointer"
                    >
                      Pilih Semua
                    </Button>
                    <Button type="button" onClick={handleClearAllLevels}
                      className="h-7 px-2 text-[10px] font-bold bg-white hover:bg-slate-50 text-red-600 border border-slate-200 rounded-lg shadow-sm cursor-pointer"
                    >
                      Hapus Semua
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {[1,2,3,4,5,6,7,8,9,10].map((lvl) => (
                    <label key={lvl} className="flex items-center gap-2 cursor-pointer select-none bg-white px-3 py-2 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors">
                      <Checkbox
                        checked={availableLevels.includes(lvl)}
                        onCheckedChange={(checked) => handleLevelCheckbox(lvl, !!checked)}
                        className="border-slate-300 bg-white data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                      />
                      <span className="text-slate-700 text-xs font-normal">Level {lvl}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Objectives Builder */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h3 className="text-xs font-black text-emerald-700 uppercase tracking-wider">Tugas yang Harus Diselesaikan</h3>
                    <p className="text-[11px] text-slate-400 font-normal mt-0.5">Buat daftar hal-hal yang wajib dilakukan pemain untuk menyelesaikan misi.</p>
                  </div>
                  <Button type="button" onClick={handleAddObjective}
                    className="h-9 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Tambah Tugas</span>
                  </Button>
                </div>

                {objectives.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-sm font-normal bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    Belum ada tugas. Klik "Tambah Tugas" untuk mulai membuat tugas.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {objectives.map((obj, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl relative">
                        <button type="button" onClick={() => handleRemoveObjective(idx)}
                          className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-400 cursor-pointer shadow-md transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        
                        <div className="flex justify-between items-center mb-3">
                          <p className="text-[11px] text-slate-500 font-semibold">Tugas #{idx + 1}</p>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveObjective(idx, "up")}
                              className="h-6 w-6 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center disabled:opacity-30 cursor-pointer transition-colors"
                              title="Pindahkan Ke Atas"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === objectives.length - 1}
                              onClick={() => handleMoveObjective(idx, "down")}
                              className="h-6 w-6 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center disabled:opacity-30 cursor-pointer transition-colors"
                              title="Pindahkan Ke Bawah"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <FieldGroup label="Apa yang harus dilakukan?" compact required>
                            <Input value={obj.descId} onChange={(e) => handleObjectiveChange(idx, "descId", e.target.value)}
                              placeholder="contoh: Foto tanaman bakau yang baru ditanam" required className={`${inputClass} h-9`} />
                          </FieldGroup>
                          <FieldGroup label="Jenis Tugas" compact>
                            <select value={obj.type} onChange={(e) => handleObjectiveChange(idx, "type", e.target.value)}
                              className={`${selectClass} h-9 text-xs`}>
                              {OBJECTIVE_TYPES.map((ot) => <option key={ot.value} value={ot.value}>{ot.label}</option>)}
                            </select>
                          </FieldGroup>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ STEP 3: Hadiah & Kuis ═══ */}
          {formStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <p className="text-xs text-slate-400 font-normal">Tentukan hadiah yang didapat pemain setelah menyelesaikan misi.</p>

              {/* Ringkasan Misi */}
              <div className="bg-emerald-50/50 p-4 sm:p-5 rounded-2xl border border-emerald-100 space-y-3">
                <h3 className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="h-4 w-4 text-emerald-600 animate-pulse" /> Ringkasan Misi (Sebelum Simpan)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div className="flex gap-2">
                    <span className="text-slate-400 w-24 shrink-0 font-medium">ID Misi:</span>
                    <span className="font-semibold text-slate-700">{questId || "-"}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-400 w-24 shrink-0 font-medium">Judul Misi:</span>
                    <span className="font-semibold text-slate-700">{titleId || "-"}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-400 w-24 shrink-0 font-medium">Kategori:</span>
                    <span className="font-semibold text-slate-700">{QUEST_TYPES.find(t => t.value === type)?.label || type}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-400 w-24 shrink-0 font-medium">Kesulitan:</span>
                    <span className="font-semibold text-slate-700">{DIFFICULTIES.find(d => d.value === difficulty)?.label || difficulty}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-400 w-24 shrink-0 font-medium">Destinasi:</span>
                    <span className="font-semibold text-slate-700">
                      {locations.find(l => l.id === locationId)?.nameId || "-"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-400 w-24 shrink-0 font-medium">Daftar Level:</span>
                    <span className="font-semibold text-slate-700">
                      {availableLevels.length > 0 ? availableLevels.join(", ") : "Belum dipilih"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-400 w-24 shrink-0 font-medium">Syarat Level:</span>
                    <span className="font-semibold text-slate-700">Level {requiredLevel}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-400 w-24 shrink-0 font-medium">Estimasi Waktu:</span>
                    <span className="font-semibold text-slate-700">{estimatedTimeId ? `${estimatedTimeId} menit` : "-"}</span>
                  </div>
                  <div className="flex gap-2 sm:col-span-2">
                    <span className="text-slate-400 w-24 shrink-0 font-medium">Jumlah Tugas:</span>
                    <span className="font-semibold text-slate-700">
                      {objectives.length} tugas
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-black text-emerald-700 uppercase tracking-wider">Hadiah Misi</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FieldGroup label="Poin Pengalaman (XP)" hint="Jumlah poin pengalaman (XP) yang diperoleh pemain saat menyelesaikan misi" required>
                    <Input type="number" value={rewardXp} onChange={(e) => { setRewardXp(e.target.value); setIsDirty(true); }} required className={inputClass} />
                  </FieldGroup>
                  <FieldGroup label="Koin Hadiah" hint="Jumlah koin (NusaCoin) yang didapatkan pemain sebagai hadiah" required>
                    <Input type="number" value={rewardPoints} onChange={(e) => { setRewardPoints(e.target.value); setIsDirty(true); }} required className={inputClass} />
                  </FieldGroup>
                  <FieldGroup label="Cerita yang Terbuka" hint="Kisah budaya baru yang akan terbuka di jurnal pemain (opsional)">
                    <select value={rewardStory} onChange={(e) => { setRewardStory(e.target.value); setIsDirty(true); }} className={selectClass}>
                      <option value="">Tidak ada cerita</option>
                      {stories.map((st) => <option key={st.id} value={st.id}>{st.titleId}</option>)}
                    </select>
                  </FieldGroup>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FieldGroup label="Lencana Penghargaan" hint="Opsional — nama lencana yang diberikan sebagai kenang-kenangan">
                    <Input value={rewardBadge} onChange={(e) => { setRewardBadge(e.target.value); setIsDirty(true); }} placeholder="kosongkan jika tidak ada" className={inputClass} />
                  </FieldGroup>
                  <FieldGroup label="Voucher Diskon" hint="Opsional — kode voucher belanja UMKM untuk pemain">
                    <Input value={rewardVoucher} onChange={(e) => { setRewardVoucher(e.target.value); setIsDirty(true); }} placeholder="kosongkan jika tidak ada" className={inputClass} />
                  </FieldGroup>
                  <FieldGroup label="Bingkai Foto Profil" hint="Opsional — bingkai avatar spesial untuk koleksi pemain">
                    <Input value={rewardCollectible} onChange={(e) => { setRewardCollectible(e.target.value); setIsDirty(true); }} placeholder="kosongkan jika tidak ada" className={inputClass} />
                  </FieldGroup>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-black text-emerald-700 uppercase tracking-wider">Kuis Pengetahuan</h3>
                <p className="text-[11px] text-slate-400 font-normal">Opsional — tambahkan kuis agar pemain bisa menguji pengetahuan sejarah atau budaya lokal.</p>
                <select value={battleId} onChange={(e) => { setBattleId(e.target.value); setIsDirty(true); }} className={selectClass}>
                  <option value="">Tidak ada kuis</option>
                  {battles.map((bt) => <option key={bt.id} value={bt.id}>{bt.titleId}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* ── Step Navigation Footer ── */}
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
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}
                className="h-10 text-xs font-semibold text-slate-500 border-slate-200 hover:bg-slate-50 bg-white rounded-xl"
              >
                Batal
              </Button>
              {formStep < 3 && (
                <Button 
                  key="btn-next-quest"
                  type="button" 
                  onClick={handleNextStep}
                  className="h-10 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1 rounded-xl"
                >
                  Selanjutnya <ChevronRight className="h-4 w-4" />
                </Button>
              )}
              {formStep === 3 && (
                <Button 
                  key="btn-submit-quest"
                  type="submit" 
                  disabled={uploading}
                  className="h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm rounded-xl"
                >
                  {uploading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                  Simpan Misi
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Full-image Preview Modal */}
      {previewImageUrl && (
        <Dialog open={!!previewImageUrl} onOpenChange={() => setPreviewImageUrl("")}>
          <DialogContent className="max-w-4xl p-1 bg-black/90 border-0 flex items-center justify-center rounded-2xl overflow-hidden">
            <div className="relative w-full h-[80vh]">
              <button
                type="button"
                onClick={() => setPreviewImageUrl("")}
                className="absolute top-4 right-4 z-50 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <img
                src={previewImageUrl}
                alt="Pratinjau Misi Penuh"
                className="w-full h-full object-contain select-none"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}
