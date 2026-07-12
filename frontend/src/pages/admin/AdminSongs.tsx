import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit2, Trash2, Loader2, Play, Pause, X, HelpCircle } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import FieldGroup from "@/components/admin/FieldGroup";

interface SongItem {
  id: string;
  name: string;
  fileUrl: string;
  isActive: boolean;
}

export default function AdminSongs() {
  const toast = useToast();
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SongItem | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  // UX Enhancement States
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [wasValidated, setWasValidated] = useState(false);

  // Feature Onboarding Tour States
  const [tourActiveStep, setTourActiveStep] = useState<number | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  const tourSteps = [
    {
      title: "Selamat Datang di Kelola Lagu BGM! 🎵",
      content: "Tur singkat ini akan memandu Anda secara interaktif memahami fitur-fitur utama di halaman Kelola Lagu Latar. Klik 'Selanjutnya' untuk memulai!",
      selector: null
    },
    {
      title: "Tambah Lagu Latar ➕",
      content: "Klik tombol ini untuk mendaftarkan BGM baru. Sistem membatasi maksimal 2 lagu BGM aktif agar ukuran bundle assets permainan tetap ringan dan optimal.",
      selector: "#add-song-btn"
    },
    {
      title: "Daftar Lagu Latar 🎶",
      content: "Seluruh lagu latar yang terdaftar ditampilkan di sini. Anda dapat memutar pratinjau audio secara real-time, mengaktifkan/menonaktifkan lagu, mengubah judul, atau menghapusnya.",
      selector: "#songs-grid"
    },
    {
      title: "Tur Selesai! 🎉",
      content: "Sekarang Anda siap mengelola Lagu Latar (BGM) NusaQuest. Selamat bekerja!",
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
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchSongs = () => {
    setLoading(true);
    fetch("/api/songs")
      .then((res) => res.json())
      .then((data) => setSongs(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSongs();
    return () => {
      // Pause playing audio on component unmount
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handleOpenAdd = () => {
    if (songs.length >= 2) {
      toast.error("Maksimal 2 lagu BGM yang dapat didaftarkan di sistem!");
      return;
    }
    setEditingItem(null);
    setWasValidated(false);
    setName("");
    setFileUrl("");
    setIsActive(false);
    setIsOpen(true);
  };

  const handleOpenEdit = (item: SongItem) => {
    setEditingItem(item);
    setWasValidated(false);
    setName(item.name);
    setFileUrl(item.fileUrl);
    setIsActive(item.isActive);
    setIsOpen(true);
  };

  const handleUploadAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("entity", "songs");

    const token = localStorage.getItem("sinopiquest_token");

    try {
      const res = await fetch("/api/uploads", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setFileUrl(data.url);
      toast.success("Berkas audio berhasil diunggah!");
    } catch {
      toast.error("Gagal mengunggah berkas audio");
    } finally {
      setUploading(false);
    }
  };

  const handleTogglePlay = (song: SongItem) => {
    if (playingSongId === song.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingSongId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(song.fileUrl);
      audio.play().catch((err) => {
        toast.error("Berkas audio rusak atau format tidak didukung.");
        console.error(err);
      });
      audioRef.current = audio;
      setPlayingSongId(song.id);
      audio.onended = () => {
        setPlayingSongId(null);
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWasValidated(true);

    if (!name.trim() || !fileUrl.trim()) {
      toast.error("Harap isi nama lagu dan unggah berkas audio!");
      return;
    }

    const token = localStorage.getItem("sinopiquest_token");
    const payload = {
      name,
      fileUrl,
      isActive,
    };

    const method = editingItem ? "PUT" : "POST";
    const url = editingItem ? `/api/songs/${editingItem.id}` : "/api/songs";

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
      toast.success(editingItem ? "Data lagu berhasil diperbarui!" : "Lagu baru berhasil ditambahkan!");
      fetchSongs();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan data lagu");
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("sinopiquest_token");

    try {
      const res = await fetch(`/api/songs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");
      toast.success("Lagu berhasil dihapus!");
      fetchSongs();
    } catch {
      toast.error("Gagal menghapus lagu");
    }
  };

  // Reusable styles
  const inputClass = "h-10 text-sm border-slate-200 bg-white text-slate-800 focus-visible:ring-emerald-500 font-normal rounded-xl placeholder:text-slate-400";

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
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Lagu Latar (BGM)</h2>
          <p className="text-xs text-slate-400 mt-0.5 font-normal">
            Setel lagu latar belakang yang diputar saat petualangan dimulai.
            {" "}<span className="text-emerald-600 font-semibold">(Maksimal 2 lagu terdaftar)</span>
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
            id="add-song-btn"
            onClick={handleOpenAdd}
            disabled={songs.length >= 2}
            className="h-10 px-5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-2 disabled:opacity-50 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" strokeWidth={3} />
            <span>Tambah Lagu ({songs.length}/2)</span>
          </Button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="border border-slate-200/80 bg-white flex flex-col justify-between shadow-sm rounded-2xl overflow-hidden animate-pulse">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-7 rounded-2xl bg-slate-100 border border-slate-200 shrink-0 h-14 w-14" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 bg-slate-200/70 rounded-md w-1/3" />
                  <div className="h-3 bg-slate-200/70 rounded-md w-2/3" />
                  <div className="h-4 bg-slate-100 rounded-md w-16" />
                </div>
              </CardContent>
              <div className="p-5 pt-0 flex gap-2">
                <div className="h-9 bg-slate-100 rounded-lg flex-1" />
                <div className="h-9 bg-slate-100 rounded-lg flex-1" />
              </div>
            </div>
          ))}
        </div>
      ) : songs.length === 0 ? (
        <div className="py-16 px-4 text-center bg-white rounded-3xl border border-slate-200/85 shadow-sm max-w-md mx-auto my-8 flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="h-16 w-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-450 shadow-inner">
            <Play className="h-7 w-7 text-slate-400 pl-0.5" />
          </div>
          <div className="space-y-1.5 max-w-xs">
            <h3 className="text-sm font-bold text-slate-800">Belum Ada Lagu BGM</h3>
            <p className="text-xs text-slate-500 font-normal leading-relaxed">
              Belum ada lagu latar belakang permainan yang didaftarkan di sistem. Mulai tambahkan dengan mengeklik tombol di atas.
            </p>
          </div>
        </div>
      ) : (
        <div id="songs-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
          {songs.map((song) => (
            <div key={song.id} className={`border border-slate-200/80 bg-white flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden ${
              song.isActive ? "ring-2 ring-emerald-500/20" : ""
            }`}>
              <CardContent className="p-5 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => handleTogglePlay(song)}
                  className={`p-4 rounded-2xl border transition-all hover:scale-105 shrink-0 ${
                    playingSongId === song.id
                      ? "text-rose-600 bg-rose-50 border-rose-100 shadow-md shadow-rose-500/10 animate-pulse"
                      : song.isActive
                      ? "text-emerald-600 bg-emerald-50 border-emerald-100 shadow-md shadow-emerald-500/10"
                      : "text-slate-400 bg-slate-50 border-slate-200"
                  }`}
                >
                  {playingSongId === song.id ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </button>
                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="text-sm font-bold text-slate-800 truncate leading-tight">{song.name}</h3>
                  <span className="text-[10px] text-slate-400 block truncate font-normal leading-normal">{song.fileUrl}</span>
                  {song.isActive ? (
                    <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-700 text-[8px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md mt-1">
                      Aktif Diputar
                    </span>
                  ) : (
                    <span className="inline-block bg-slate-100 border border-slate-200 text-slate-400 text-[8px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md mt-1">
                      Tidak Aktif
                    </span>
                  )}
                </div>
              </CardContent>

              <div className="p-5 pt-0 flex gap-2">
                <Button
                  onClick={() => handleOpenEdit(song)}
                  variant="outline"
                  className="flex-1 h-9 text-xs font-semibold text-slate-600 border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 bg-white rounded-lg"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Ubah</span>
                </Button>
                <Button
                  onClick={() => setDeleteConfirmId(song.id)}
                  variant="ghost"
                  className="flex-1 h-9 text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center gap-1.5 rounded-lg"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Hapus</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog Form */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-white border border-slate-200/80 text-slate-800 max-w-md rounded-2xl shadow-2xl p-6 gap-0">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg font-black text-slate-800 tracking-tight">
              {editingItem ? "Ubah Lagu BGM" : "Tambah Lagu BGM Baru"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FieldGroup label="Nama Lagu" hint="Judul lagu latar belakang">
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="contoh: Gamelan Rhapsody" 
                required 
                className={`${inputClass} ${wasValidated && !name.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}`} 
              />
            </FieldGroup>

            <div className="grid grid-cols-1 gap-4">
              <FieldGroup label="Pilih Berkas Audio" hint="Unggah file .mp3 atau .ogg langsung dari komputer">
                <div className="relative">
                  <Input 
                    type="file" 
                    accept="audio/mpeg, audio/ogg, audio/mp3" 
                    onChange={handleUploadAudio} 
                    disabled={uploading}
                    className="h-10 text-sm border-slate-200 bg-white text-slate-800 font-normal rounded-xl file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700"
                  />
                  {uploading && <Loader2 className="absolute right-3 top-3 h-4 w-4 text-emerald-500 animate-spin" />}
                </div>
              </FieldGroup>
            </div>

            <FieldGroup label="URL / Path Berkas Audio" hint="Terisi otomatis setelah file diunggah">
              <Input 
                value={fileUrl} 
                onChange={(e) => setFileUrl(e.target.value)} 
                placeholder="contoh: /api/uploads/songs/music.mp3" 
                required 
                className={`${inputClass} ${wasValidated && !fileUrl.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}`} 
              />
            </FieldGroup>

            {fileUrl && (
              <div className="space-y-1 mt-2">
                <label className="block text-[11px] font-semibold text-slate-600 uppercase">Tes Putar Musik</label>
                <audio src={fileUrl} controls className="w-full h-10 rounded-lg bg-slate-50 border border-slate-200" />
              </div>
            )}

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 mt-2">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <Checkbox
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(!!checked)}
                  className="border-slate-300 bg-white data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
                <span className="text-slate-600 text-xs font-normal">Setel aktif diputar sekarang (Nonaktifkan lagu lainnya)</span>
              </label>
            </div>

            <DialogFooter className="pt-6 flex gap-2 border-t border-slate-100 mt-6 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}
                className="h-10 text-xs font-semibold text-slate-500 border-slate-200 hover:bg-slate-50 bg-white rounded-xl"
              >
                Batal
              </Button>
              <Button 
                type="submit"
                disabled={uploading}
                className="h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm rounded-xl"
              >
                {uploading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Custom Delete Confirmation Modal */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="bg-white border border-slate-200/80 text-slate-800 max-w-sm rounded-2xl p-6 shadow-2xl text-left">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-slate-800 tracking-tight">Hapus Lagu Latar?</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="text-xs text-slate-500 font-normal leading-relaxed">
              Apakah Anda yakin ingin menghapus lagu latar belakang ini? Pemain tidak akan mendengarkan musik ini lagi saat memulai petualangan. Tindakan ini tidak dapat dibatalkan.
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
