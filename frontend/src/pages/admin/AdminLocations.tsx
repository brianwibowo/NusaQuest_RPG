import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface LocationItem {
  id: string;
  nameId: string;
  nameEn: string;
  descId: string;
  descEn: string;
  category: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  addressId?: string;
  addressEn?: string;
}

export default function AdminLocations() {
  const toast = useToast();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LocationItem | null>(null);

  // Form Fields
  const [nameId, setNameId] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descId, setDescId] = useState("");
  const [descEn, setDescEn] = useState("");
  const [category, setCategory] = useState("wisata_sejarah");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [addressId, setAddressId] = useState("");
  const [addressEn, setAddressEn] = useState("");
  const [uploading, setUploading] = useState(false);

  const categories = [
    { value: "wisata_sejarah", label: "Wisata Sejarah" },
    { value: "wisata_budaya", label: "Wisata Budaya" },
    { value: "wisata_kuliner", label: "Wisata Kuliner" },
    { value: "ekowisata", label: "Ecowisata / Lingkungan" },
    { value: "umkm", label: "UMKM Mitra" },
    { value: "hidden_spot", label: "Hidden Spot" },
  ];

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/locations");
      const data = await res.json();
      setLocations(data);
    } catch (err) {
      console.error("Gagal memuat data lokasi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setNameId("");
    setNameEn("");
    setDescId("");
    setDescEn("");
    setCategory("wisata_sejarah");
    setLatitude("");
    setLongitude("");
    setImageUrl("");
    setAddressId("");
    setAddressEn("");
    setIsOpen(true);
  };

  const handleOpenEdit = (item: LocationItem) => {
    setEditingItem(item);
    setNameId(item.nameId);
    setNameEn(item.nameEn);
    setDescId(item.descId);
    setDescEn(item.descEn);
    setCategory(item.category);
    setLatitude(item.latitude.toString());
    setLongitude(item.longitude.toString());
    setImageUrl(item.imageUrl || "");
    setAddressId(item.addressId || "");
    setAddressEn(item.addressEn || "");
    setIsOpen(true);
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("entity", "locations");

    const token = localStorage.getItem("nusaquest_token");

    try {
      const res = await fetch("/api/uploads", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      nameId,
      nameEn,
      descId,
      descEn,
      category,
      latitude: parseFloat(latitude) || 0,
      longitude: parseFloat(longitude) || 0,
      imageUrl,
      addressId,
      addressEn,
    };

    const method = editingItem ? "PUT" : "POST";
    const url = editingItem ? `/api/locations/${editingItem.id}` : "/api/locations";

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
      toast.success(editingItem ? "Data lokasi berhasil diperbarui!" : "Lokasi baru berhasil ditambahkan!");
      fetchLocations();
    } catch (err) {
      toast.error("Gagal menyimpan data lokasi");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus lokasi ini?")) return;
    const token = localStorage.getItem("nusaquest_token");

    try {
      const res = await fetch(`/api/locations/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Delete failed");
      toast.success("Lokasi berhasil dihapus!");
      fetchLocations();
    } catch (err) {
      toast.error("Gagal menghapus lokasi");
    }
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">Lokasi Wisata</h2>
          <p className="text-xs font-semibold text-slate-500 mt-1">Kelola data destinasi, marker GPS, dan koordinat peta.</p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-1.5 uppercase tracking-wider shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Lokasi</span>
        </Button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((loc) => (
            <Card key={loc.id} className="border-[#E5E0D5] bg-white overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-300">
              <div>
                <div className="h-40 bg-[#F2EFE9] relative overflow-hidden">
                  {loc.imageUrl ? (
                    <img src={loc.imageUrl} alt={loc.nameId} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-[#F2EFE9]">
                      <MapPin className="h-12 w-12" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md">
                    {loc.category.replace("wisata_", "").replace("_", " ")}
                  </span>
                </div>
                <CardContent className="p-5 space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 leading-tight">{loc.nameId}</h3>
                    <span className="text-[10px] font-bold text-slate-400 block mt-0.5">{loc.nameEn}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-semibold leading-relaxed line-clamp-3">
                    {loc.descId}
                  </p>
                  <div className="pt-2 border-t border-[#E5E0D5] text-[10px] font-extrabold text-slate-400 flex items-center gap-4">
                    <span>LAT: {loc.latitude}</span>
                    <span>LNG: {loc.longitude}</span>
                  </div>
                </CardContent>
              </div>

              <div className="p-5 pt-0 flex gap-2">
                <Button
                  onClick={() => handleOpenEdit(loc)}
                  variant="outline"
                  className="flex-1 h-9 text-xs font-bold text-slate-700 border-[#E5E0D5] hover:bg-slate-50 flex items-center gap-1.5 bg-white"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Ubah</span>
                </Button>
                <Button
                  onClick={() => handleDelete(loc.id)}
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
              {editingItem ? "Ubah Destinasi" : "Tambah Destinasi"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Nama (ID)</label>
                <Input
                  value={nameId}
                  onChange={(e) => setNameId(e.target.value)}
                  placeholder="e.g. Perkampungan Setu Babakan"
                  required
                  className="h-9 text-xs border-[#E5E0D5] bg-white text-slate-800 focus-visible:ring-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Nama (EN)</label>
                <Input
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Setu Babakan Village"
                  required
                  className="h-9 text-xs border-[#E5E0D5] bg-white text-slate-800 focus-visible:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Kategori Wisata</label>
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
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Latitude (Google Maps)</label>
                <Input
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. -6.3407"
                  required
                  className="h-9 text-xs border-[#E5E0D5] bg-white text-slate-800 focus-visible:ring-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Longitude (Google Maps)</label>
                <Input
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. 106.8274"
                  required
                  className="h-9 text-xs border-[#E5E0D5] bg-white text-slate-800 focus-visible:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Deskripsi Destinasi (ID)</label>
              <textarea
                value={descId}
                onChange={(e) => setDescId(e.target.value)}
                placeholder="Tulis deskripsi menarik tentang tempat ini..."
                required
                rows={3}
                className="w-full p-3 rounded-md border border-[#E5E0D5] bg-white text-slate-800 text-xs font-semibold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Deskripsi Destinasi (EN)</label>
              <textarea
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                placeholder="Write an appealing description in English..."
                required
                rows={3}
                className="w-full p-3 rounded-md border border-[#E5E0D5] bg-white text-slate-800 text-xs font-semibold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Alamat Lengkap (ID)</label>
                <Input
                  value={addressId}
                  onChange={(e) => setAddressId(e.target.value)}
                  placeholder="e.g. Jl. Moch. Kahfi II, Jagakarsa"
                  className="h-9 text-xs border-[#E5E0D5] bg-white text-slate-800 focus-visible:ring-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Alamat Lengkap (EN)</label>
                <Input
                  value={addressEn}
                  onChange={(e) => setAddressEn(e.target.value)}
                  placeholder="e.g. Moch. Kahfi II Street, Jagakarsa"
                  className="h-9 text-xs border-[#E5E0D5] bg-white text-slate-800 focus-visible:ring-emerald-500"
                />
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
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
