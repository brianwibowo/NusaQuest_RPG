import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  MapPin,
  Sword,
  BookOpen,
  Store,
  Music,
  Users,
  ArrowLeft,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Load initial collapsed state from local storage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("admin_sidebar_collapsed") === "true";
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("admin_sidebar_collapsed", String(next));
      return next;
    });
  };

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      signOut();
      navigate("/onboarding");
    }
  };

  const menuItems = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/locations", label: "Lokasi Wisata", icon: MapPin },
    { to: "/admin/quests", label: "Misi (Quest)", icon: Sword },
    { to: "/admin/stories", label: "Kisah Cerita", icon: BookOpen },
    { to: "/admin/umkm", label: "UMKM Lokal", icon: Store },
    { to: "/admin/songs", label: "Lagu BGM", icon: Music },
    { to: "/admin/users", label: "Pengguna", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col md:flex-row font-sans">
      {/* 1. Sidebar */}
      <aside
        className={`w-full bg-[#091E15] border-b md:border-b-0 md:border-r border-emerald-950/40 flex flex-col justify-between shrink-0 shadow-xl z-20 relative transition-all duration-300 ${isCollapsed ? "md:w-20" : "md:w-64"
          }`}
      >
        {/* Toggle Collapse Desktop Button */}
        <button
          type="button"
          onClick={toggleCollapse}
          className="hidden md:flex absolute top-[68px] -right-4 h-8 w-8 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 hover:text-white items-center justify-center shadow-md transition-all hover:bg-emerald-600 hover:scale-105 z-30 cursor-pointer"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        <div className={`p-4 md:p-6 ${isCollapsed ? "md:px-3" : ""} space-y-6`}>
          {/* Logo Brand */}
          <div className={`flex items-center gap-3 ${isCollapsed ? "md:justify-center" : ""}`}>
            <img
              src="/images/ui/logo.jpeg"
              alt="Logo"
              className="h-9 w-9 object-contain rounded-full border border-emerald-500/20 bg-white p-0.5 shadow-md shrink-0"
            />
            {!isCollapsed && (
              <div className="animate-in fade-in duration-200">
                <h1 className="text-xs font-black tracking-widest text-white leading-none">SINOPIQUEST</h1>
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mt-1 block">Control Center</span>
              </div>
            )}
          </div>

          <hr className="border-emerald-950/60" />

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  title={isCollapsed ? item.label : ""}
                  className={`flex items-center gap-3 px-4.5 py-3 rounded-xl text-xs font-semibold transition-all duration-200 ${isCollapsed ? "md:justify-center md:px-0" : ""
                    } ${isActive
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                      : "text-emerald-100/50 hover:bg-white/5 hover:text-white"
                    }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!isCollapsed && <span className="animate-in fade-in duration-200">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User context & Back actions */}
        <div className={`p-4 md:p-6 border-t border-emerald-950/60 space-y-4 bg-black/10 ${isCollapsed ? "md:px-3" : ""}`}>
          {user && (
            <div className={`flex items-center gap-3 min-w-0 ${isCollapsed ? "md:justify-center" : ""}`}>
              <div className="h-9 w-9 rounded-full overflow-hidden bg-emerald-950 border border-emerald-500/30 flex-shrink-0 flex items-center justify-center text-xs font-bold text-emerald-400 shadow-inner">
                {user.name.charAt(0)}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1 animate-in fade-in duration-200">
                  <span className="text-xs font-semibold text-slate-100 block truncate leading-tight">{user.name}</span>
                  <span className="text-[10px] font-normal text-emerald-400/50 block truncate mt-0.5">{user.email}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2 pt-1">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              title="Kembali Ke Game"
              className={`w-full h-9 text-[10px] font-semibold text-emerald-300 border-emerald-900/60 hover:bg-white/5 hover:text-white gap-2 bg-transparent rounded-xl transition-all ${isCollapsed ? "md:justify-center md:px-0" : "justify-start"
                }`}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {!isCollapsed && <span className="animate-in fade-in duration-200">Kembali Ke Game</span>}
            </Button>
            <Button
              onClick={handleLogout}
              title="Keluar Sesi"
              variant="ghost"
              className={`w-full h-9 text-[10px] font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/20 gap-2 rounded-xl transition-all ${isCollapsed ? "md:justify-center md:px-0" : "justify-start"
                }`}
            >
              <LogOut className="h-3.5 w-3.5" />
              {!isCollapsed && <span className="animate-in fade-in duration-200">Keluar Sesi</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
