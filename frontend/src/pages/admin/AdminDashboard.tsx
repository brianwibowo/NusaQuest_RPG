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
    { label: "Lokasi Wisata", count: stats.locations, icon: MapPin, color: "text-blue-600 bg-blue-50 border-blue-100" },
    { label: "Misi (Quest)", count: stats.quests, icon: Sword, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { label: "Kisah Cerita", count: stats.stories, icon: BookOpen, color: "text-amber-600 bg-amber-50 border-amber-100" },
    { label: "UMKM Lokal", count: stats.umkms, icon: Store, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
    { label: "BGM Lagu", count: stats.songs, icon: Music, color: "text-cyan-600 bg-cyan-50 border-cyan-100" },
    { label: "Total Pengguna", count: stats.users, icon: Users, color: "text-rose-600 bg-rose-50 border-rose-100" },
  ];

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-black text-slate-800 tracking-tight">Dashboard Utama</h2>
        <p className="text-xs text-slate-400 mt-0.5 font-normal">Ringkasan data simulasi petualangan SinopiQuest RPG.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="border-slate-200/80 bg-white shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 rounded-2xl overflow-hidden">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{card.label}</span>
                  <span className="text-2xl font-black text-slate-800 block leading-none">{card.count}</span>
                </div>
                <div className={`p-3 rounded-xl border ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-slate-50 border border-slate-200/85 p-6 rounded-2xl space-y-3.5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 tracking-tight">Mekanisme Pengelolaan Konten</h3>
        <p className="text-xs text-slate-500 leading-relaxed font-normal">
          Melalui panel admin ini, Anda dapat menambahkan destinasi wisata baru, memperbarui alur misi beserta objectives pendukungnya, membuka cerita, mendaftarkan mitra UMKM, dan menyetel musik latar. Seluruh data disinkronisasikan ke peta game secara real-time.
        </p>
        <div className="pt-3 border-t border-slate-200 flex flex-wrap gap-4 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
          <span>✓ Fleksibel</span>
          <span>✓ Bilingual Aktif</span>
          <span>✓ Real-time Update</span>
        </div>
      </div>
    </div>
  );
}
