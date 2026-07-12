import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert, ShieldCheck, User, Search, ChevronLeft, ChevronRight, HelpCircle, X, ChevronDown } from "lucide-react";
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

  // Feature Onboarding Tour States
  const [tourActiveStep, setTourActiveStep] = useState<number | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  const tourSteps = [
    {
      title: "Selamat Datang di Manajemen Pengguna! 👥",
      content: "Tur singkat ini akan memandu Anda secara interaktif memahami fitur-fitur utama di halaman Manajemen Pengguna. Klik 'Selanjutnya' untuk memulai!",
      selector: null
    },
    {
      title: "Pencarian & Filter Otorisasi 🔍",
      content: "Gunakan panel filter ini untuk memotong list pengguna: ketik nama/email untuk pencarian cepat atau pilih level otorisasi (Super Admin, Admin, Pemain) untuk menyaring data.",
      selector: "#filter-bar"
    },
    {
      title: "Daftar Pengguna & Progress RPG 📊",
      content: "Seluruh pengguna terdaftar ditampilkan di sini beserta progres level game dan total poin RPG yang telah mereka kumpulkan.",
      selector: "#users-table"
    },
    {
      title: "Aksi Hak Akses 🔑",
      content: "Khusus untuk Super Admin, Anda dapat memberikan atau mencabut akses Admin kepada pengguna lain secara langsung lewat kolom aksi.",
      selector: "#users-table"
    },
    {
      title: "Tur Selesai! 🎉",
      content: "Sekarang Anda siap mengelola pengguna SinopiQuest dengan aman. Selamat bekerja!",
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
        <span className="bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 px-2.5 py-1 rounded-lg text-[9px] font-semibold uppercase flex items-center gap-1.5 w-fit shadow-sm">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Super Admin</span>
        </span>
      );
    }
    if (role === "admin") {
      return (
        <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 px-2.5 py-1 rounded-lg text-[9px] font-semibold uppercase flex items-center gap-1.5 w-fit shadow-sm">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Admin</span>
        </span>
      );
    }
    return (
      <span className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg text-[9px] font-semibold uppercase flex items-center gap-1.5 w-fit shadow-sm">
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
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center gap-4 w-full">
          <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Manajemen Pengguna</h2>
          <Button
            type="button"
            onClick={() => setTourActiveStep(0)}
            variant="outline"
            className="h-9 w-9 sm:h-10 sm:w-10 p-0 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm transition-all flex items-center justify-center cursor-pointer shrink-0"
            title="Mulai Tur Fitur"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-normal leading-relaxed">
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Super Admin:</span>
          {" "}Hanya Super Admin yang menunjuk/mencabut akun Admin.
        </p>
      </div>

      {/* Filter Bar */}
      <div id="filter-bar" className="grid grid-cols-5 gap-2.5 sm:gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors duration-200">
        <div className="relative col-span-3">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau email..."
            className="h-10 pl-9 text-xs border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-white focus-visible:ring-emerald-500 font-normal placeholder:text-slate-400 rounded-full"
          />
        </div>
        <div className="relative col-span-2">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full h-10 pl-3 sm:pl-4 pr-8 sm:pr-10 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:outline-none font-normal transition-all cursor-pointer appearance-none"
          >
            <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">Semua Otorisasi</option>
            <option value="super_admin" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">Super Admin</option>
            <option value="admin" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">Admin</option>
            <option value="user" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">Pemain (User)</option>
          </select>
          <ChevronDown className="absolute right-2.5 sm:right-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-normal px-1">
        Menampilkan <span className="font-semibold text-slate-600 dark:text-slate-300">{paginatedUsers.length}</span> dari {filteredUsers.length} pengguna
      </p>

      {/* Table */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm animate-pulse">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-xs font-normal">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[9px] bg-slate-50/50 dark:bg-slate-950/40">
                  <th className="py-4 px-6 text-left font-semibold">Nama</th>
                  <th className="py-4 px-6 text-left font-semibold">Email</th>
                  <th className="py-4 px-6 text-left font-semibold">Tingkat Level</th>
                  <th className="py-4 px-6 text-left font-semibold">Poin RPG</th>
                  <th className="py-4 px-6 text-left font-semibold">Otorisasi</th>
                  {isSuperAdmin && <th className="py-4 px-6 text-center font-semibold">Aksi Hak Akses</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0" />
                        <div className="h-4 bg-slate-200/60 dark:bg-slate-800 rounded-md w-24" />
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-slate-200/60 dark:bg-slate-800 rounded-md w-36" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-slate-200/60 dark:bg-slate-800 rounded-md w-10" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-slate-200/60 dark:bg-slate-800 rounded-md w-16" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-6 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg w-20" />
                    </td>
                    {isSuperAdmin && (
                      <td className="py-4 px-6 text-center">
                        <div className="h-8 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg w-24 mx-auto" />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : paginatedUsers.length === 0 ? (
        <div className="py-16 px-4 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/85 dark:border-slate-800 shadow-sm max-w-md mx-auto my-8 flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-inner">
            <User className="h-7 w-7 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="space-y-1.5 max-w-xs">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Pengguna Tidak Ditemukan</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
              Tidak ada pengguna yang cocok dengan kata kunci pencarian atau filter otorisasi Anda.
            </p>
          </div>
          {(searchQuery || filterRole) && (
            <Button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setFilterRole("");
              }}
              variant="outline"
              className="h-9 px-4 text-xs font-semibold border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 rounded-full transition-all cursor-pointer shadow-xs"
            >
              Reset Filter & Pencarian
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div id="users-table" className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-xs font-normal">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[9px] bg-slate-50/50 dark:bg-slate-950/40">
                    <th className="py-4 px-6 text-left font-semibold">Nama</th>
                    <th className="py-4 px-6 text-left font-semibold">Email</th>
                    <th className="py-4 px-6 text-left font-semibold">Tingkat Level</th>
                    <th className="py-4 px-6 text-left font-semibold">Poin RPG</th>
                    <th className="py-4 px-6 text-left font-semibold">Otorisasi</th>
                    {isSuperAdmin && <th className="py-4 px-6 text-center font-semibold">Aksi Hak Akses</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {paginatedUsers.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-800 dark:text-white">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-[11px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 shadow-sm shrink-0">
                            {item.name.charAt(0)}
                          </div>
                          <span className="truncate max-w-[150px]">{item.name} {item.id === currentUser?.id ? "(Anda)" : ""}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-normal text-slate-500 dark:text-slate-400">{item.email}</td>
                      <td className="py-4 px-6 font-semibold text-slate-600 dark:text-slate-300">Lvl {item.profile?.level || 1}</td>
                      <td className="py-4 px-6 font-semibold text-slate-600 dark:text-slate-300">{item.profile?.totalPoints || 0} Poin</td>
                      <td className="py-4 px-6">{getRoleBadge(item.role)}</td>
                      {isSuperAdmin && (
                        <td className="py-4 px-6 text-center">
                          {item.role === "super_admin" ? (
                            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Terkunci</span>
                          ) : (
                            <Button
                              onClick={() => handleChangeRole(item.id, item.role)}
                              variant="outline"
                              className={`h-8 px-3 text-[9px] font-semibold uppercase rounded-lg border tracking-wider transition-all bg-white dark:bg-slate-900 cursor-pointer ${item.role === "admin"
                                ? "text-red-600 hover:text-red-500 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20"
                                : "text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
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
          {filteredUsers.length > 0 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
                className="h-9 text-xs font-semibold border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1 rounded-xl"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all ${page === currentPage
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300"
                      }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
                className="h-9 text-xs font-semibold border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1 rounded-xl"
              >
                <span className="hidden sm:inline">Selanjutnya</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

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
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-white rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-left space-y-4 z-[9999]"
          >
            {/* Header / Step counter */}
            <div className="flex justify-between items-center">
              <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                Petunjuk {tourActiveStep + 1} dari {tourSteps.length}
              </span>
              <button
                type="button"
                onClick={() => setTourActiveStep(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all p-1 rounded-full cursor-pointer flex items-center justify-center"
                title="Tutup Tur"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Title & Content */}
            <div className="space-y-2">
              <h3 className="text-sm font-black text-slate-800 dark:text-white leading-snug">{tourSteps[tourActiveStep].title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">{tourSteps[tourActiveStep].content}</p>
            </div>

            {/* Action buttons */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="ghost"
                disabled={tourActiveStep === 0}
                onClick={() => setTourActiveStep(prev => prev! - 1)}
                className="h-8 px-3 text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
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
