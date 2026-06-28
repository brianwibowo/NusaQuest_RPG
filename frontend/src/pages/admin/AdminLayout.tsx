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
  LogOut 
} from "lucide-react";

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/locations", label: "Lokasi Wisata", icon: MapPin },
    { to: "/admin/quests", label: "Misi (Quest)", icon: Sword },
    { to: "/admin/stories", label: "Cerita", icon: BookOpen },
    { to: "/admin/umkm", label: "UMKM Lokal", icon: Store },
    { to: "/admin/songs", label: "Lagu BGM", icon: Music },
    { to: "/admin/users", label: "Pengguna", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-slate-800 flex flex-col md:flex-row font-sans">
      {/* 1. Sidebar */}
      <aside className="w-full md:w-64 bg-[#0B251A] border-b md:border-b-0 md:border-r border-[#1C3A2D] flex flex-col justify-between shrink-0">
        <div className="p-6 space-y-6">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <img src="/images/ui/logo.png" alt="Logo" className="h-8 w-8 object-contain animate-pulse" />
            <div>
              <h1 className="text-sm font-black tracking-widest text-white leading-none">NUSAQUEST</h1>
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Admin Control</span>
            </div>
          </div>

          <hr className="border-[#1C3A2D]" />

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20"
                      : "text-emerald-200/60 hover:bg-[#123626] hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User context & Back actions */}
        <div className="p-6 border-t border-[#1C3A2D] space-y-3 bg-[#0B251A]/40">
          {user && (
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-8 w-8 rounded-full overflow-hidden bg-[#123626] border border-emerald-500/30 flex-shrink-0 flex items-center justify-center text-xs font-black text-emerald-400">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-100 block truncate leading-tight">{user.name}</span>
                <span className="text-[9px] font-semibold text-emerald-400/60 block truncate">{user.email}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-1">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="w-full h-8 text-[10px] font-bold text-emerald-200 border-[#1C3A2D] hover:bg-[#123626] hover:text-white justify-start gap-2 bg-transparent"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali Ke Game</span>
            </Button>
            <Button
              onClick={signOut}
              variant="ghost"
              className="w-full h-8 text-[10px] font-bold text-red-400 hover:text-red-300 hover:bg-red-950/20 justify-start gap-2"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar Sesi</span>
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
