import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert, ShieldCheck, User, Search, ChevronLeft, ChevronRight } from "lucide-react";
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

const ITEMS_PER_PAGE = 10;

export default function AdminUsers() {
  const toast = useToast();
  const { user: currentUser, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Paging State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = () => {
    setLoading(true);
    const token = localStorage.getItem("sinopiquest_token");
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

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterRole]);

  const handleChangeRole = async (id: string, currentRole: string) => {
    const nextRole = currentRole === "admin" ? "user" : "admin";
    const confirmMsg = currentRole === "admin" 
      ? "Apakah Anda yakin ingin mencabut akses Admin dari pengguna ini?" 
      : "Apakah Anda yakin ingin memberikan akses Admin kepada pengguna ini?";
    
    if (!confirm(confirmMsg)) return;

    const token = localStorage.getItem("sinopiquest_token");
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
        <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-lg text-[9px] font-semibold uppercase flex items-center gap-1.5 w-fit shadow-sm">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Super Admin</span>
        </span>
      );
    }
    if (role === "admin") {
      return (
        <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-lg text-[9px] font-semibold uppercase flex items-center gap-1.5 w-fit shadow-sm">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Admin</span>
        </span>
      );
    }
    return (
      <span className="bg-slate-50 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-lg text-[9px] font-semibold uppercase flex items-center gap-1.5 w-fit shadow-sm">
        <User className="h-3.5 w-3.5" />
        <span>Pemain</span>
      </span>
    );
  };

  // ── Filter and Paging ──
  const filteredUsers = users.filter((u) => {
    const matchSearch = !searchQuery || 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = !filterRole || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-5 text-left animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-800 tracking-tight">Manajemen Pengguna</h2>
        <p className="text-xs text-slate-400 mt-0.5 font-normal">
          <span className="text-emerald-600 font-semibold">Super Admin:</span>
          {" "}Hanya Super Admin yang dapat menunjuk atau mencabut otorisasi Admin lainnya.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau email..."
            className="h-10 pl-9 text-xs border-slate-200 bg-white text-slate-800 focus-visible:ring-emerald-500 font-normal placeholder:text-slate-400 rounded-xl"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:outline-none font-normal transition-all"
        >
          <option value="">Semua Otorisasi</option>
          <option value="super_admin">Super Admin</option>
          <option value="admin">Admin</option>
          <option value="user">Pemain (User)</option>
        </select>
      </div>

      <p className="text-[11px] text-slate-400 font-normal px-1">
        Menampilkan <span className="font-semibold text-slate-600">{paginatedUsers.length}</span> dari {filteredUsers.length} pengguna
      </p>

      {/* Table */}
      {loading ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm animate-pulse">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-normal">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[9px] bg-slate-50/50">
                  <th className="py-4 px-6 text-left font-semibold">Nama</th>
                  <th className="py-4 px-6 text-left font-semibold">Email</th>
                  <th className="py-4 px-6 text-left font-semibold">Tingkat Level</th>
                  <th className="py-4 px-6 text-left font-semibold">Poin RPG</th>
                  <th className="py-4 px-6 text-left font-semibold">Otorisasi</th>
                  {isSuperAdmin && <th className="py-4 px-6 text-center font-semibold">Aksi Hak Akses</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 shrink-0" />
                      <div className="h-4 bg-slate-200/60 rounded-md w-24" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-slate-200/60 rounded-md w-36" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-slate-200/60 rounded-md w-10" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-slate-200/60 rounded-md w-16" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-6 bg-slate-100 border border-slate-200 rounded-lg w-20" />
                    </td>
                    {isSuperAdmin && (
                      <td className="py-4 px-6 text-center">
                        <div className="h-8 bg-slate-100 border border-slate-200 rounded-lg w-24 mx-auto" />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : paginatedUsers.length === 0 ? (
        <div className="py-20 text-center text-slate-400 text-sm font-normal">
          Belum ada pengguna yang sesuai.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-normal">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[9px] bg-slate-50/50">
                    <th className="py-4 px-6 text-left font-semibold">Nama</th>
                    <th className="py-4 px-6 text-left font-semibold">Email</th>
                    <th className="py-4 px-6 text-left font-semibold">Tingkat Level</th>
                    <th className="py-4 px-6 text-left font-semibold">Poin RPG</th>
                    <th className="py-4 px-6 text-left font-semibold">Otorisasi</th>
                    {isSuperAdmin && <th className="py-4 px-6 text-center font-semibold">Aksi Hak Akses</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {paginatedUsers.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 text-slate-600 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-800 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-[11px] font-bold text-emerald-700 border border-emerald-100 shadow-sm shrink-0">
                          {item.name.charAt(0)}
                        </div>
                        <span className="truncate max-w-[150px]">{item.name} {item.id === currentUser?.id ? "(Anda)" : ""}</span>
                      </td>
                      <td className="py-4 px-6 font-normal text-slate-500">{item.email}</td>
                      <td className="py-4 px-6 font-semibold text-slate-600">Lvl {item.profile?.level || 1}</td>
                      <td className="py-4 px-6 font-semibold text-slate-600">{item.profile?.totalPoints || 0} Poin</td>
                      <td className="py-4 px-6">{getRoleBadge(item.role)}</td>
                      {isSuperAdmin && (
                        <td className="py-4 px-6 text-center">
                          {item.role === "super_admin" ? (
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Terkunci</span>
                          ) : (
                            <Button
                              onClick={() => handleChangeRole(item.id, item.role)}
                              variant="outline"
                              className={`h-8 px-3 text-[9px] font-semibold uppercase rounded-lg border tracking-wider transition-all bg-white cursor-pointer ${
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
                className="h-9 text-xs font-semibold border-slate-200 text-slate-600 hover:bg-slate-50 bg-white flex items-center gap-1 rounded-xl"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all ${
                      page === currentPage
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
                className="h-9 text-xs font-semibold border-slate-200 text-slate-600 hover:bg-slate-50 bg-white flex items-center gap-1 rounded-xl"
              >
                <span className="hidden sm:inline">Selanjutnya</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
