import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert, ShieldCheck, User, Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface ProfileItem {
  level: number;
  totalPoints: number;
}

interface UserItem {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "admin" | "user";
  createdAt: string;
  profile?: ProfileItem | null;
}

export default function AdminUsers() {
  const toast = useToast();
  const { user: currentUser, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    const token = localStorage.getItem("nusaquest_token");
    fetch("/api/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChangeRole = async (id: string, currentRole: string) => {
    const nextRole = currentRole === "admin" ? "user" : "admin";
    const confirmMsg = currentRole === "admin" 
      ? "Apakah Anda yakin ingin mencabut akses Admin dari pengguna ini?" 
      : "Apakah Anda yakin ingin memberikan akses Admin kepada pengguna ini?";
    
    if (!confirm(confirmMsg)) return;

    const token = localStorage.getItem("nusaquest_token");
    try {
      const res = await fetch(`/api/users/${id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: nextRole }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update role");
      }
      toast.success("Hak akses pengguna berhasil diperbarui!");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui hak akses pengguna");
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === "super_admin") {
      return (
        <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase flex items-center gap-1 w-fit">
          <ShieldAlert className="h-3 w-3" />
          <span>Super Admin</span>
        </span>
      );
    }
    if (role === "admin") {
      return (
        <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase flex items-center gap-1 w-fit">
          <ShieldCheck className="h-3 w-3" />
          <span>Admin</span>
        </span>
      );
    }
    return (
      <span className="bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase flex items-center gap-1 w-fit">
        <User className="h-3 w-3" />
        <span>User</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">Manajemen Pengguna</h2>
        <p className="text-xs font-semibold text-slate-500 mt-1">
          <span className="text-emerald-600 font-extrabold block md:inline md:mr-1">Super Admin Role:</span>
          Hanya Super Admin yang dapat menunjuk atau mencabut otorisasi Admin lainnya.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <div className="bg-white border border-[#E5E0D5] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-bold">
              <thead>
                <tr className="border-b border-[#E5E0D5] text-slate-400 uppercase tracking-widest text-[9px] bg-[#FAF8F5]">
                  <th className="py-4 px-6 text-left">Nama</th>
                  <th className="py-4 px-6 text-left">Email</th>
                  <th className="py-4 px-6 text-left">Tingkat Level</th>
                  <th className="py-4 px-6 text-left">Poin</th>
                  <th className="py-4 px-6 text-left">Otorisasi</th>
                  {isSuperAdmin && <th className="py-4 px-6 text-center">Aksi Hak Akses</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D5] bg-white">
                {users.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 text-slate-600 transition-colors">
                    <td className="py-4 px-6 font-extrabold text-slate-800 flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-emerald-600 border border-[#E5E0D5]">
                        {item.name.charAt(0)}
                      </div>
                      <span>{item.name} {item.id === currentUser?.id ? "(Anda)" : ""}</span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-500">{item.email}</td>
                    <td className="py-4 px-6 text-slate-500">Lvl {item.profile?.level || 1}</td>
                    <td className="py-4 px-6 text-slate-500">{item.profile?.totalPoints || 0} Poin</td>
                    <td className="py-4 px-6">{getRoleBadge(item.role)}</td>
                    {isSuperAdmin && (
                      <td className="py-4 px-6 text-center">
                        {item.role === "super_admin" ? (
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Terkunci</span>
                        ) : (
                          <Button
                            onClick={() => handleChangeRole(item.id, item.role)}
                            variant="outline"
                            className={`h-7 px-3 text-[9px] font-black uppercase rounded-lg border tracking-wider transition-all bg-white cursor-pointer ${
                              item.role === "admin"
                                ? "text-red-600 hover:text-red-500 border-red-200 hover:bg-red-50"
                                : "text-emerald-600 hover:text-emerald-500 border-emerald-200 hover:bg-emerald-50"
                            }`}
                          >
                            {item.role === "admin" ? "Cabut Admin" : "Jadikan Admin"}
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
