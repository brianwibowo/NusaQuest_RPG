import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit2, Trash2, Music, Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

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
  }, []);

  const handleOpenAdd = () => {
    if (songs.length >= 2) {
      toast.error("Maksimal 2 lagu BGM yang dapat didaftarkan di sistem!");
      return;
    }
    setEditingItem(null);
    setName("");
    setFileUrl("");
    setIsActive(false);
    setIsOpen(true);
  };

  const handleOpenEdit = (item: SongItem) => {
    setEditingItem(item);
    setName(item.name);
    setFileUrl(item.fileUrl);
    setIsActive(item.isActive);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("nusaquest_token");
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
    if (!confirm("Apakah Anda yakin ingin menghapus lagu ini?")) return;
    const token = localStorage.getItem("nusaquest_token");

    try {
      const res = await fetch(`/api/songs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");
      toast.success("Lagu berhasil dihapus!");
      fetchSongs();
    } catch (err) {
      toast.error("Gagal menghapus lagu");
    }
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">Lagu BGM (Background Music)</h2>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            <span className="text-emerald-600 font-extrabold mr-1">Limit: Maksimal 2 lagu.</span>
            Setel lagu latar belakang yang diputar saat petualangan dimulai.
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          disabled={songs.length >= 2}
          className="h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-1.5 uppercase tracking-wider disabled:opacity-50 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Lagu ({songs.length}/2)</span>
        </Button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          {songs.map((song) => (
            <Card key={song.id} className="border-[#E5E0D5] bg-white flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3.5 rounded-xl border ${
                  song.isActive ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-slate-400 bg-slate-50 border-slate-200"
                }`}>
                  <Music className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="text-sm font-bold text-slate-800 truncate">{song.name}</h3>
                  <span className="text-[9px] font-bold text-slate-400 block truncate">{song.fileUrl}</span>
                  {song.isActive ? (
                    <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-700 text-[8px] font-black uppercase px-2.5 py-0.5 rounded-full mt-1">
                      Aktif Diputar
                    </span>
                  ) : (
                    <span className="inline-block bg-slate-50 border border-slate-200 text-slate-400 text-[8px] font-black uppercase px-2.5 py-0.5 rounded-full mt-1">
                      Tidak Aktif
                    </span>
                  )}
                </div>
              </CardContent>

              <div className="p-5 pt-0 flex gap-2 mt-2">
                <Button
                  onClick={() => handleOpenEdit(song)}
                  variant="outline"
                  className="flex-1 h-8 text-[10px] font-bold text-slate-700 border-[#E5E0D5] hover:bg-slate-50 flex items-center gap-1.5 bg-white"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Ubah</span>
                </Button>
                <Button
                  onClick={() => handleDelete(song.id)}
                  variant="ghost"
                  className="flex-1 h-8 text-[10px] font-bold text-red-600 hover:text-red-500 hover:bg-red-50 flex items-center gap-1.5"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Hapus</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-white border border-[#E5E0D5] text-slate-800 max-w-xl rounded-2xl shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-black uppercase tracking-widest text-slate-800">
              {editingItem ? "Ubah Lagu BGM" : "Tambah Lagu BGM"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold mt-2">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Nama Lagu</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jakarta Gamelan Rhapsody"
                required
                className="h-9 text-xs border-[#E5E0D5] bg-white text-slate-800 focus-visible:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block">File BGM URL / Path</label>
              <Input
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="e.g. /audio/bgm_gamelan.mp3"
                required
                className="h-9 text-xs border-[#E5E0D5] bg-white text-slate-800 focus-visible:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 bg-[#FAF8F5] p-3 rounded-xl border border-[#E5E0D5]">
              <Checkbox
                id="active"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(!!checked)}
                className="border-[#E5E0D5] bg-white data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
              />
              <label htmlFor="active" className="text-slate-700 text-xs font-bold cursor-pointer select-none">
                Setel Aktif Diputar Sekarang (Matikan lagu lainnya)
              </label>
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
