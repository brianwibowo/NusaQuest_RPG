import { useState, useEffect } from "react";
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
  Settings,
  ArrowLeft,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Laptop,
  Menu,
  X
} from "lucide-react";

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Load initial collapsed state from local storage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("admin_sidebar_collapsed") === "true";
  });

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Theme Manager State
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    return (localStorage.getItem("admin_theme") as "light" | "dark" | "system") || "system";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    localStorage.setItem("admin_theme", theme);
  }, [theme]);

  // Listen to system theme changes dynamically if on system mode
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(mediaQuery.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

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
    { to: "/admin/settings", label: "Pengaturan Game", icon: Settings },
  ];

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/admin":
        return "Dashboard";
      case "/admin/locations":
        return "Lokasi Wisata";
      case "/admin/quests":
        return "Misi (Quest)";
      case "/admin/stories":
        return "Kisah Cerita";
      case "/admin/umkm":
        return "UMKM Lokal";
      case "/admin/songs":
        return "Lagu BGM";
      case "/admin/users":
        return "Pengguna";
      case "/admin/settings":
        return "Pengaturan Game";
      case "/admin/profile":
        return "Ubah Profil Admin";
      default:
        return "Control Center";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col md:flex-row font-sans transition-colors duration-200">
      {/* 1. Sidebar (Desktop Only) */}
      <aside
        className={`hidden md:flex bg-[#091E15] border-r border-emerald-950/40 flex-col justify-between shrink-0 shadow-xl z-20 relative transition-all duration-300 ${isCollapsed ? "md:w-20" : "md:w-64"
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
        <div className={`p-4 md:p-6 border-t border-emerald-950/60 space-y-4 ${isCollapsed ? "md:px-3" : ""}`}>


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

      {/* Mobile Drawer Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="relative w-64 bg-[#091E15] h-full flex flex-col justify-between shadow-2xl p-6 animate-in slide-in-from-left duration-300">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 text-emerald-400 hover:text-white p-1.5 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <img
                  src="/images/ui/logo.jpeg"
                  alt="Logo"
                  className="h-9 w-9 object-contain rounded-full border border-emerald-500/20 bg-white p-0.5 shadow-md shrink-0"
                />
                <div>
                  <h1 className="text-xs font-black tracking-widest text-white leading-none">SINOPIQUEST</h1>
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mt-1 block">Control Center</span>
                </div>
              </div>

              <hr className="border-emerald-950/60" />

              <nav className="space-y-1.5">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4.5 py-3 rounded-xl text-xs font-semibold transition-all duration-200 ${isActive
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                          : "text-emerald-100/50 hover:bg-white/5 hover:text-white"
                        }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-emerald-950/60 space-y-4 pt-4">

              <div className="flex flex-col gap-2 pt-1">
                <Button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate("/");
                  }}
                  variant="outline"
                  className="w-full h-9 text-[10px] font-semibold text-emerald-300 border-emerald-900/60 hover:bg-white/5 hover:text-white gap-2 bg-transparent rounded-xl transition-all justify-start"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Kembali Ke Game</span>
                </Button>
                <Button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  variant="ghost"
                  className="w-full h-9 text-[10px] font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/20 gap-2 rounded-xl transition-all justify-start"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Keluar Sesi</span>
                </Button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex items-center justify-between shrink-0 shadow-xs z-10 transition-colors duration-200">
          <div className="flex items-center gap-3">
            {/* Hamburger button on Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
            <h2 className="text-sm font-black text-slate-800 dark:text-white tracking-tight">{getPageTitle()}</h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/40 dark:border-slate-700/40">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${theme === "light"
                    ? "bg-white dark:bg-slate-700 text-amber-500 shadow-sm"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                title="Mode Terang"
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${theme === "dark"
                    ? "bg-white dark:bg-slate-700 text-emerald-500 shadow-sm"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                title="Mode Gelap"
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${theme === "system"
                    ? "bg-white dark:bg-slate-700 text-blue-500 shadow-sm"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                title="Ikuti Sistem"
              >
                <Laptop className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Profile Link */}
            {user && (
              <Link
                to="/admin/profile"
                className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-200/20"
                title="Kelola Profil Admin"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-md">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block max-w-[100px] truncate">{user.name}</span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-400 block uppercase tracking-wider font-semibold">{user.role.replace("_", " ")}</span>
                </div>
              </Link>
            )}
          </div>
        </header>

        {/* Page Scrollable Area */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto max-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="py-4.5 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-center text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold shrink-0 transition-colors duration-200">
          <span>© {new Date().getFullYear()} sinopiquest. All rights reserved.</span>
        </footer>
      </div>
    </div>
  );
}
