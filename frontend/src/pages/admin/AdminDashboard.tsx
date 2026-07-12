import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Sword, BookOpen, Store, Users, Music } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    locations: 0,
    quests: 0,
    stories: 0,
    umkms: 0,
    users: 0,
    songs: 0,
  });

  useEffect(() => {
    const endpoints = ["/api/locations", "/api/quests", "/api/stories", "/api/umkm", "/api/users", "/api/songs"];
    const token = localStorage.getItem("sinopiquest_token");
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    Promise.all(
      endpoints.map((url) =>
        fetch(url, { headers })
          .then((res) => (res.ok ? res.json() : []))
          .catch(() => [])
      )
    )
      .then(([locs, quests, stories, umkms, users, songs]) => {
        setStats({
          locations: locs.length,
          quests: quests.length,
          stories: stories.length,
          umkms: umkms.length,
          users: users.length,
          songs: songs.length,
        });
      })
      .catch((err) => console.error("Error loading stats:", err));
  }, []);

  const statCards = [
    { label: "Lokasi Wisata", count: stats.locations, icon: MapPin, color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/50" },
    { label: "Misi (Quest)", count: stats.quests, icon: Sword, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/50" },
    { label: "Kisah Cerita", count: stats.stories, icon: BookOpen, color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/50" },
    { label: "UMKM Lokal", count: stats.umkms, icon: Store, color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/50" },
    { label: "BGM Lagu", count: stats.songs, icon: Music, color: "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-100 dark:border-cyan-900/50" },
    { label: "Total Pengguna", count: stats.users, icon: Users, color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/50" },
  ];

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Dashboard Utama</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-normal">Ringkasan data simulasi petualangan SinopiQuest RPG.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 rounded-2xl overflow-hidden">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">{card.label}</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-white block leading-none">{card.count}</span>
                </div>
                <div className={`p-3 rounded-xl border ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200/85 dark:border-slate-800 p-6 rounded-2xl space-y-3.5 shadow-sm transition-colors duration-200">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">Mekanisme Pengelolaan Konten</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
          Melalui panel admin ini, Anda dapat menambahkan destinasi wisata baru, memperbarui alur misi beserta objectives pendukungnya, membuka cerita, mendaftarkan mitra UMKM, dan menyetel musik latar. Seluruh data disinkronisasikan ke peta game secara real-time.
        </p>
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
          <span>✓ Fleksibel</span>
          <span>✓ Bilingual Aktif</span>
          <span>✓ Real-time Update</span>
        </div>
      </div>
    </div>
  );
}
