import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/context/ToastContext";
import { Loader2, Save, Shield, ArrowLeft } from "lucide-react";
import FieldGroup from "@/components/admin/FieldGroup";

export default function AdminProfile() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user]);

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran berkas melebihi 2MB! Silakan pilih foto lain.");
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
    formData.append("entity", "profiles");

    const token = localStorage.getItem("sinopiquest_token");

    try {
      const res = await fetch("/api/uploads", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setAvatarUrl(data.url);
      toast.success("Foto profil berhasil diunggah!");
    } catch {
      toast.error("Gagal mengunggah foto profil");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama lengkap tidak boleh kosong");
      return;
    }

    setSaving(true);
    try {
      await updateProfile(name, avatarUrl || null);
      toast.success("Profil berhasil diperbarui!");
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui profil");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 text-emerald-650 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Introduction Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800 p-6 rounded-2xl shadow-xs transition-colors duration-200">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="h-20 w-20 rounded-full object-cover border-2 border-emerald-500/20 dark:border-emerald-500/40 shadow-md"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-emerald-600 dark:bg-emerald-700 text-white flex items-center justify-center text-3xl font-black shadow-md border-2 border-emerald-500/10">
                {name.charAt(0)}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full border border-white dark:border-slate-950 shadow-sm" title="Akun Admin">
              <Shield className="h-3 w-3" />
            </div>
          </div>

          <div className="text-center sm:text-left space-y-1 min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-800 dark:text-white leading-tight truncate">{user.name}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono block truncate">{user.email}</p>
            <span className="inline-block bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md mt-1">
              Otoritas: {user.role.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Form Editor */}
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs p-6 space-y-6 transition-colors duration-200">
        <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">⚙️ Pengaturan Profil</h4>

        <div className="space-y-4">
          <FieldGroup label="Nama Lengkap / Username" hint="Nama panggilan atau display name Anda di sistem" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Admin Sinopi"
              required
              className="h-10 text-xs font-semibold border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-white rounded-xl focus-visible:ring-emerald-500/20"
            />
          </FieldGroup>

          <FieldGroup label="Foto Profil / Avatar" hint="Unggah berkas foto Anda (maksimal 2MB, format JPG/PNG)">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative w-full sm:flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImage}
                  disabled={uploading}
                  className="h-10 text-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-white rounded-xl file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-emerald-50 dark:file:bg-emerald-950 file:text-emerald-700 dark:file:text-emerald-400"
                />
                {uploading && (
                  <Loader2 className="absolute right-3 top-3 h-4 w-4 text-emerald-500 animate-spin" />
                )}
              </div>
              {avatarUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setAvatarUrl("")}
                  className="h-9 px-3 text-[10px] font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl"
                >
                  Hapus Foto
                </Button>
              )}
            </div>
          </FieldGroup>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center gap-4">
          <Link
            to="/admin"
            className="h-10 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5 rounded-xl transition-all shadow-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Dashboard</span>
          </Link>
          <Button
            type="submit"
            disabled={saving || uploading}
            className="h-10 px-5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/10 rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>Simpan Perubahan</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
