import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit2, Trash2, Store, Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface UmkmItem {
  id: string;
  name: string;
  descId: string;
  descEn: string;
  category: string;
  products: string[];
  imageUrl?: string;
  rating: number;
  voucherAvailable: boolean;
  locationId: string;
}

interface LocationItem {
  id: string;
  nameId: string;
}

export default function AdminUmkm() {
  const toast = useToast();
  const [umkmList, setUmkmList] = useState<UmkmItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UmkmItem | null>(null);

  // Form Fields
  const [umkmId, setUmkmId] = useState("");
  const [name, setName] = useState("");
  const [descId, setDescId] = useState("");
  const [descEn, setDescEn] = useState("");
  const [category, setCategory] = useState("kuliner");
  const [productsStr, setProductsStr] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [rating, setRating] = useState("5.0");
  const [voucherAvailable, setVoucherAvailable] = useState(false);
  const [locationId, setLocationId] = useState("");
  const [uploading, setUploading] = useState(false);

  const categories = [
    { value: "kuliner", label: "Kuliner Lokal" },
    { value: "suvenir", label: "Oleh-Oleh / Suvenir" },
    { value: "kerajinan", label: "Kerajinan Seni" },
    { value: "fashion", label: "Pakaian Adat / Batik" },
    { value: "jasa", label: "Pemandu / Jasa Lokal" },
  ];

  const fetchDependencies = () => {
    fetch("/api/locations")
      .then((res) => res.json())
      .then((data) => setLocations(data))
      .catch((err) => console.error(err));
  };

  const fetchUmkm = () => {
    setLoading(true);
    fetch("/api/umkm")
      .then((res) => res.json())
      .then((data) => setUmkmList(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUmkm();
    fetchDependencies();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setUmkmId("");
    setName("");
    setDescId("");
    setDescEn("");
    setCategory("kuliner");
    setProductsStr("");
    setImageUrl("");
    setRating("5.0");
    setVoucherAvailable(false);
    setLocationId(locations[0]?.id || "");
    setIsOpen(true);
  };

  const handleOpenEdit = (item: UmkmItem) => {
    setEditingItem(item);
    setUmkmId(item.id);
    setName(item.name);
    setDescId(item.descId);
    setDescEn(item.descEn);
    setCategory(item.category);
    setProductsStr(item.products.join(", "));
    setImageUrl(item.imageUrl || "");
    setRating(item.rating.toString());
    setVoucherAvailable(item.voucherAvailable);
    setLocationId(item.locationId);
    setIsOpen(true);
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("entity", "umkm");

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
      id: umkmId || undefined,
      name,
      descId,
      descEn,
      category,
      products: productsStr.split(",").map((p) => p.trim()).filter((p) => p.length > 0),
      imageUrl,
      rating: parseFloat(rating) || 5.0,
      voucherAvailable,
      locationId,
    };

    const method = editingItem ? "PUT" : "POST";
    const url = editingItem ? `/api/umkm/${editingItem.id}` : "/api/umkm";

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
      toast.success(editingItem ? "Data UMKM berhasil diperbarui!" : "Data UMKM baru berhasil ditambahkan!");
      fetchUmkm();
    } catch (err) {
      toast.error("Gagal menyimpan data UMKM");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus mitra UMKM ini?")) return;
    const token = localStorage.getItem("nusaquest_token");

    try {
      const res = await fetch(`/api/umkm/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");
      toast.success("Mitra UMKM berhasil dihapus!");
      fetchUmkm();
    } catch (err) {
      toast.error("Gagal menghapus UMKM");
    }
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">Mitra UMKM Lokal</h2>
          <p className="text-xs font-semibold text-slate-500 mt-1">Kelola data pelaku usaha lokal, katalog produk, dan voucher belanja.</p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-1.5 uppercase tracking-wider shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah UMKM</span>
        </Button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {umkmList.map((umkm) => (
            <Card key={umkm.id} className="border-[#E5E0D5] bg-white overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-300">
              <div>
                <div className="h-40 bg-[#F2EFE9] relative overflow-hidden">
                  {umkm.imageUrl ? (
                    <img src={umkm.imageUrl} alt={umkm.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-[#F2EFE9]">
                      <Store className="h-12 w-12" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md">
                    {umkm.category}
                  </span>
                </div>
                <CardContent className="p-5 space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 leading-tight">{umkm.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold text-slate-400 block">{umkm.category.toUpperCase()}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                      <span className="text-[10px] font-extrabold text-amber-600 block">⭐ {umkm.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 font-semibold leading-relaxed line-clamp-3">
                    {umkm.descId}
                  </p>
                  <div className="pt-2 border-t border-[#E5E0D5] text-[10px] font-extrabold text-slate-400">
                    Produk: {umkm.products.join(", ")}
                  </div>
                </CardContent>
              </div>

              <div className="p-5 pt-0 flex gap-2">
                <Button
                  onClick={() => handleOpenEdit(umkm)}
                  variant="outline"
                  className="flex-1 h-9 text-xs font-bold text-slate-700 border-[#E5E0D5] hover:bg-slate-50 flex items-center gap-1.5 bg-white"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Ubah</span>
                </Button>
                <Button
                  onClick={() => handleDelete(umkm.id)}
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
              {editingItem ? "Ubah Data UMKM" : "Tambah Data UMKM"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block">ID UMKM (Kustom)</label>
                <Input
                  value={umkmId}
                  onChange={(e) => setUmkmId(e.target.value)}
                  placeholder="e.g. umkm_mpok_siti"
                  disabled={!!editingItem}
                  className="h-9 text-xs border-[#E5E0D5] bg-white text-slate-800 focus-visible:ring-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Nama Usaha UMKM</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Soto Betawi H. Mamat"
                  required
                  className="h-9 text-xs border-[#E5E0D5] bg-white text-slate-800 focus-visible:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Kategori UMKM</label>
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
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Upload Gambar Banner</label>
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
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Rating Usaha (0.0 - 5.0)</label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.0"
                  max="5.0"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  placeholder="e.g. 4.8"
                  required
                  className="h-9 text-xs border-[#E5E0D5] bg-white text-slate-800 focus-visible:ring-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Lokasi Penempatan</label>
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

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Katalog Produk (Pisahkan Koma)</label>
              <Input
                value={productsStr}
                onChange={(e) => setProductsStr(e.target.value)}
                placeholder="e.g. Soto Daging, Soto Ayam, Es Teh"
                required
                className="h-9 text-xs border-[#E5E0D5] bg-white text-slate-800 focus-visible:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Deskripsi Usaha (ID)</label>
              <textarea
                value={descId}
                onChange={(e) => setDescId(e.target.value)}
                placeholder="Tulis ringkasan sejarah atau keunikan UMKM..."
                required
                rows={3}
                className="w-full p-3 rounded-md border border-[#E5E0D5] bg-white text-slate-800 text-xs font-semibold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Deskripsi Usaha (EN)</label>
              <textarea
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                placeholder="Write summary in English..."
                required
                rows={3}
                className="w-full p-3 rounded-md border border-[#E5E0D5] bg-white text-slate-800 text-xs font-semibold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 bg-[#FAF8F5] p-3 rounded-xl border border-[#E5E0D5]">
              <Checkbox
                id="voucher"
                checked={voucherAvailable}
                onCheckedChange={(checked) => setVoucherAvailable(!!checked)}
                className="border-[#E5E0D5] bg-white data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
              />
              <label htmlFor="voucher" className="text-slate-700 text-xs font-bold cursor-pointer select-none">
                Sediakan Penukaran Voucher Hadiah Belanja (Tahun Ke-3 Integration)
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
