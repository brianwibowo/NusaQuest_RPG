import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, X, PlusCircle, ChevronLeft, ChevronRight, Check } from "lucide-react";
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
  const [objectives, setObjectives] = useState<QuestObjective[]>([]);
  const [rewardXp, setRewardXp] = useState("100");
  const [rewardPoints, setRewardPoints] = useState("50");
  const [rewardBadge, setRewardBadge] = useState("");
  const [rewardVoucher, setRewardVoucher] = useState("");
  const [rewardCollectible, setRewardCollectible] = useState("");
  const [rewardStory, setRewardStory] = useState("");

  // Reset form when dialog opens
  const handleOpenChange = (nextOpen: boolean) => {
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
  };

  // Populate form from editing item
  const populateForm = (fullQuest: QuestItem) => {
    setFormStep(1);
    setWasValidated(false);
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
  };

  // Expose populateForm via effect
  useState(() => {
    if (editingItem) populateForm(editingItem);
    else resetForm();
  });

  // ── Handlers ──

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
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
    setObjectives([...objectives, { descId: "", descEn: "", type: "visit_location", sortOrder: objectives.length }]);
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
    setWasValidated(true);

    if (formStep === 1) {
      if (!questId.trim() || !titleId.trim() || !titleEn.trim() || !descId.trim() || !descEn.trim() || !locationId) {
        toast.error("Harap lengkapi semua kolom identitas wajib di Langkah 1!");
        return;
      }
      setFormStep(2);
      return;
    }

    if (formStep === 2) {
      if (!objectives.length) {
        toast.error("Harap tambahkan minimal satu tugas objektif!");
        return;
      }
      if (objectives.some(obj => !obj.descId.trim() || !obj.descEn.trim())) {
        toast.error("Harap lengkapi deskripsi tugas objektif Anda!");
        return;
      }
      setFormStep(3);
      return;
    }

    if (!availableLevels.length) {
      toast.error("Harap pilih minimal satu tingkat level!");
      return;
    }
    const token = localStorage.getItem("sinopiquest_token");
    const payload = {
      id: questId || undefined,
      titleId, titleEn, descId, descEn, type, difficulty,
      requiredLevel: parseInt(requiredLevel) || 1,
      availableLevels, estimatedTimeId, estimatedTimeEn, imageUrl, locationId,
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
                  onClick={() => setFormStep(s.num)}
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
              <p className="text-xs text-slate-400 font-normal">Isi identitas dan detail utama misi petualangan.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FieldGroup label="Kode Unik Misi" hint="Huruf kecil, tanpa spasi">
                  <Input value={questId} onChange={(e) => setQuestId(e.target.value)} placeholder="contoh: quest_eco_mangrove" disabled={!!editingItem} className={`${inputClass} ${wasValidated && !questId.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}`} />
                </FieldGroup>
                <FieldGroup label="Judul Misi (Indonesia)">
                  <Input value={titleId} onChange={(e) => setTitleId(e.target.value)} placeholder="contoh: Tanam Bakau Pesisir" required className={`${inputClass} ${wasValidated && !titleId.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}`} />
                </FieldGroup>
                <FieldGroup label="Judul Misi (Inggris)">
                  <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder="contoh: Plant Coastal Mangrove" required className={`${inputClass} ${wasValidated && !titleEn.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}`} />
                </FieldGroup>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FieldGroup label="Tipe Misi">
                  <select value={type} onChange={(e) => setType(e.target.value)} className={selectClass}>
                    {QUEST_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </FieldGroup>
                <FieldGroup label="Tingkat Kesulitan">
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className={selectClass}>
                    {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </FieldGroup>
                <FieldGroup label="Lokasi Terkait">
                  <select value={locationId} onChange={(e) => setLocationId(e.target.value)} required className={`${selectClass} ${wasValidated && !locationId ? "border-red-500" : ""}`}>
                    <option value="">Pilih lokasi...</option>
                    {locations.map((loc) => <option key={loc.id} value={loc.id}>{loc.nameId}</option>)}
                  </select>
                </FieldGroup>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FieldGroup label="Level Minimum">
                  <Input type="number" min="1" max="10" value={requiredLevel} onChange={(e) => setRequiredLevel(e.target.value)} required className={inputClass} />
                </FieldGroup>
                <FieldGroup label="Perkiraan Waktu (Indonesia)" hint="opsional">
                  <Input value={estimatedTimeId} onChange={(e) => setEstimatedTimeId(e.target.value)} placeholder="contoh: 30 menit" className={inputClass} />
                </FieldGroup>
                <FieldGroup label="Perkiraan Waktu (Inggris)" hint="opsional">
                  <Input value={estimatedTimeEn} onChange={(e) => setEstimatedTimeEn(e.target.value)} placeholder="contoh: 30 minutes" className={inputClass} />
                </FieldGroup>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldGroup label="Gambar Misi" hint="Upload gambar ilustrasi misi">
                  <div className="relative">
                    <Input type="file" accept="image/*" onChange={handleUploadImage} disabled={uploading}
                      className="h-10 text-sm border-slate-200 bg-white text-slate-800 font-normal rounded-xl file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700"
                    />
                    {uploading && <Loader2 className="absolute right-3 top-3 h-4 w-4 text-emerald-500 animate-spin" />}
                  </div>
                  {imageUrl && <img src={imageUrl} alt="Preview" className="mt-2 h-24 w-full object-cover rounded-xl border border-slate-200" />}
                </FieldGroup>
                <FieldGroup label="UMKM Mitra" hint="opsional — hubungkan dengan produk lokal">
                  <select value={relatedUmkmId} onChange={(e) => setRelatedUmkmId(e.target.value)} className={selectClass}>
                    <option value="">Tanpa UMKM</option>
                    {umkms.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </FieldGroup>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldGroup label="Deskripsi (Indonesia)">
                  <textarea value={descId} onChange={(e) => setDescId(e.target.value)} placeholder="Tuliskan deskripsi singkat misi..." required rows={4} className={`${textareaClass} ${wasValidated && !descId.trim() ? "border-red-500" : ""}`} />
                </FieldGroup>
                <FieldGroup label="Deskripsi (Inggris)">
                  <textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} placeholder="Write a brief quest description..." required rows={4} className={`${textareaClass} ${wasValidated && !descEn.trim() ? "border-red-500" : ""}`} />
                </FieldGroup>
              </div>
            </div>
          )}

          {/* ═══ STEP 2: Target & Level ═══ */}
          {formStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <p className="text-xs text-slate-400 font-normal">Tentukan di level berapa misi tersedia, dan apa saja tugas yang harus diselesaikan pemain.</p>

              {/* Level Checkboxes */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <h3 className="text-xs font-black text-emerald-700 uppercase tracking-wider">Tersedia pada Level</h3>
                <p className="text-[11px] text-slate-400 font-normal">Centang level pemain yang bisa mengakses misi ini.</p>
                <div className="flex flex-wrap gap-3">
                  {[1,2,3,4,5,6,7,8,9,10].map((lvl) => (
                    <label key={lvl} className="flex items-center gap-2 cursor-pointer select-none bg-white px-3 py-2 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors">
                      <Checkbox
                        checked={availableLevels.includes(lvl)}
                        onCheckedChange={(checked) => handleLevelCheckbox(lvl, !!checked)}
                        className="border-slate-300 bg-white data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                      />
                      <span className="text-slate-700 text-xs font-normal">Lvl {lvl}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Objectives Builder */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h3 className="text-xs font-black text-emerald-700 uppercase tracking-wider">Daftar Tugas</h3>
                    <p className="text-[11px] text-slate-400 font-normal mt-0.5">Tugas yang harus diselesaikan pemain untuk menuntaskan misi.</p>
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
                    Belum ada tugas. Klik "Tambah Tugas" untuk mulai.
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
                        <p className="text-[11px] text-slate-500 font-semibold mb-3">Tugas #{idx + 1}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <FieldGroup label="Deskripsi Tugas (Indonesia)" compact>
                            <Input value={obj.descId} onChange={(e) => handleObjectiveChange(idx, "descId", e.target.value)}
                              placeholder="contoh: Kunjungi Mangrove PIK" required className={`${inputClass} h-9`} />
                          </FieldGroup>
                          <FieldGroup label="Deskripsi Tugas (Inggris)" compact>
                            <Input value={obj.descEn} onChange={(e) => handleObjectiveChange(idx, "descEn", e.target.value)}
                              placeholder="contoh: Visit PIK Mangrove" required className={`${inputClass} h-9`} />
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
              <p className="text-xs text-slate-400 font-normal">Tentukan hadiah dan hubungkan kuis pengetahuan jika diperlukan.</p>

              <div className="space-y-3">
                <h3 className="text-xs font-black text-emerald-700 uppercase tracking-wider">Hadiah Misi</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FieldGroup label="Poin Pengalaman (XP)" hint="Jumlah XP yang didapat">
                    <Input type="number" value={rewardXp} onChange={(e) => setRewardXp(e.target.value)} required className={inputClass} />
                  </FieldGroup>
                  <FieldGroup label="Koin Hadiah" hint="Jumlah koin yang didapat">
                    <Input type="number" value={rewardPoints} onChange={(e) => setRewardPoints(e.target.value)} required className={inputClass} />
                  </FieldGroup>
                  <FieldGroup label="Cerita yang Terbuka" hint="opsional — buka cerita baru">
                    <select value={rewardStory} onChange={(e) => setRewardStory(e.target.value)} className={selectClass}>
                      <option value="">Tidak ada</option>
                      {stories.map((st) => <option key={st.id} value={st.id}>{st.titleId}</option>)}
                    </select>
                  </FieldGroup>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FieldGroup label="Lencana Spesial" hint="opsional">
                    <Input value={rewardBadge} onChange={(e) => setRewardBadge(e.target.value)} placeholder="contoh: badge_eco_warrior" className={inputClass} />
                  </FieldGroup>
                  <FieldGroup label="Voucher Diskon" hint="opsional">
                    <Input value={rewardVoucher} onChange={(e) => setRewardVoucher(e.target.value)} placeholder="contoh: voucher_bakmi" className={inputClass} />
                  </FieldGroup>
                  <FieldGroup label="Bingkai Koleksi" hint="opsional">
                    <Input value={rewardCollectible} onChange={(e) => setRewardCollectible(e.target.value)} placeholder="contoh: collectible_tmii" className={inputClass} />
                  </FieldGroup>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-black text-emerald-700 uppercase tracking-wider">Hubungkan Kuis</h3>
                <p className="text-[11px] text-slate-400 font-normal">Opsional — hubungkan misi ini dengan pertempuran kuis pengetahuan.</p>
                <select value={battleId} onChange={(e) => setBattleId(e.target.value)} className={selectClass}>
                  <option value="">Tidak dihubungkan</option>
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}
                className="h-10 text-xs font-semibold text-slate-500 border-slate-200 hover:bg-slate-50 bg-white rounded-xl"
              >
                Batal
              </Button>
              {formStep < 3 && (
                <Button 
                  key="btn-next-quest"
                  type="button" 
                  onClick={() => setFormStep(s => s + 1)}
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
    </Dialog>
  );
}
