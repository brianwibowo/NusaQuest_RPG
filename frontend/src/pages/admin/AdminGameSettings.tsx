import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Save, Calendar, Swords, Coins, Trophy, Award } from "lucide-react";
import FieldGroup from "@/components/admin/FieldGroup";

interface DailySignInSetting {
  day: number;
  gold: number;
  points: number;
}

interface QuestSetting {
  xp: number;
  gold: number;
  points: number;
}

interface GameSettings {
  dailySignIn: DailySignInSetting[];
  dailyQuests: {
    quiz: QuestSetting;
    explore: QuestSetting;
    leaderboard: QuestSetting;
  };
}

export default function AdminGameSettings() {
  const toast = useToast();
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiFetch<GameSettings>("/api/settings")
      .then((data) => {
        // Ensure format is valid before loading
        if (data && data.dailySignIn && data.dailyQuests) {
          setSettings(data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch settings", err);
        toast.error("Gagal memuat pengaturan game.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSignInChange = (index: number, field: "gold" | "points", value: number) => {
    if (!settings) return;
    const updatedSignIn = [...settings.dailySignIn];
    updatedSignIn[index] = {
      ...updatedSignIn[index],
      [field]: value
    };
    setSettings({
      ...settings,
      dailySignIn: updatedSignIn
    });
  };

  const handleQuestChange = (questKey: "quiz" | "explore" | "leaderboard", field: "xp" | "gold" | "points", value: number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      dailyQuests: {
        ...settings.dailyQuests,
        [questKey]: {
          ...settings.dailyQuests[questKey],
          [field]: value
        }
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    apiFetch<{ success: boolean }>("/api/settings", {
      method: "POST",
      body: JSON.stringify(settings)
    })
      .then((res) => {
        if (res.success) {
          toast.success("Pengaturan game berhasil disimpan!");
        } else {
          toast.error("Gagal menyimpan pengaturan.");
        }
      })
      .catch((err) => {
        console.error("Failed to save settings", err);
        toast.error("Terjadi kesalahan koneksi.");
      })
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Pengaturan gagal dimuat.</p>
      </div>
    );
  }

  const inputClass = "h-10 text-sm border-slate-200 bg-white text-slate-800 font-semibold rounded-xl dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 focus-visible:ring-emerald-500";

  return (
    <div className="space-y-6 max-w-4xl text-left">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Pengaturan Game</h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-1">
          Kelola parameter reward login harian dan papan misi petualang di NusaQuest RPG.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pb-12">
        {/* Section 1: Daily Login Streak */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-5 space-y-4">
            <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <Calendar className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-500" />
              <span>Kalender Hadiah Login Harian (7 Hari)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {settings.dailySignIn.map((dayItem, index) => (
                <div
                  key={dayItem.day}
                  className="p-4 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl space-y-3"
                >
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest block">
                    Hari {dayItem.day}
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <FieldGroup label="Hadiah Gold" hint="Reward koin emas">
                      <div className="relative">
                        <Coins className="absolute left-3 top-3 h-4 w-4 text-amber-500 pointer-events-none" />
                        <Input
                          type="number"
                          min={0}
                          value={dayItem.gold}
                          onChange={(e) => handleSignInChange(index, "gold", Number(e.target.value))}
                          className={`${inputClass} pl-9`}
                        />
                      </div>
                    </FieldGroup>

                    <FieldGroup label="Hadiah Poin" hint="Poin tukar voucher">
                      <div className="relative">
                        <Trophy className="absolute left-3 top-3 h-4 w-4 text-amber-500 pointer-events-none" />
                        <Input
                          type="number"
                          min={0}
                          value={dayItem.points}
                          onChange={(e) => handleSignInChange(index, "points", Number(e.target.value))}
                          className={`${inputClass} pl-9`}
                        />
                      </div>
                    </FieldGroup>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Daily Quests Board */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-5 space-y-4">
            <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <Swords className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-500" />
              <span>Hadiah Papan Misi Harian</span>
            </h2>

            <div className="space-y-4 pt-1">
              {/* Mission 1: Daily Quiz */}
              <div className="p-4 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl space-y-3">
                <span className="text-xs font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest block">
                  Misi 1: Selesaikan Kuis Budaya Harian
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FieldGroup label="Reward XP">
                    <div className="relative">
                      <Award className="absolute left-3 top-3 h-4 w-4 text-emerald-600 pointer-events-none" />
                      <Input
                        type="number"
                        min={0}
                        value={settings.dailyQuests.quiz.xp}
                        onChange={(e) => handleQuestChange("quiz", "xp", Number(e.target.value))}
                        className={`${inputClass} pl-9`}
                      />
                    </div>
                  </FieldGroup>

                  <FieldGroup label="Reward Gold">
                    <div className="relative">
                      <Coins className="absolute left-3 top-3 h-4 w-4 text-amber-500 pointer-events-none" />
                      <Input
                        type="number"
                        min={0}
                        value={settings.dailyQuests.quiz.gold}
                        onChange={(e) => handleQuestChange("quiz", "gold", Number(e.target.value))}
                        className={`${inputClass} pl-9`}
                      />
                    </div>
                  </FieldGroup>

                  <FieldGroup label="Reward Poin">
                    <div className="relative">
                      <Trophy className="absolute left-3 top-3 h-4 w-4 text-amber-500 pointer-events-none" />
                      <Input
                        type="number"
                        min={0}
                        value={settings.dailyQuests.quiz.points}
                        onChange={(e) => handleQuestChange("quiz", "points", Number(e.target.value))}
                        className={`${inputClass} pl-9`}
                      />
                    </div>
                  </FieldGroup>
                </div>
              </div>

              {/* Mission 2: Explore Map */}
              <div className="p-4 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl space-y-3">
                <span className="text-xs font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest block">
                  Misi 2: Ketuk & Jelajahi Peta Wisata
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FieldGroup label="Reward XP">
                    <div className="relative">
                      <Award className="absolute left-3 top-3 h-4 w-4 text-emerald-600 pointer-events-none" />
                      <Input
                        type="number"
                        min={0}
                        value={settings.dailyQuests.explore.xp}
                        onChange={(e) => handleQuestChange("explore", "xp", Number(e.target.value))}
                        className={`${inputClass} pl-9`}
                      />
                    </div>
                  </FieldGroup>

                  <FieldGroup label="Reward Gold">
                    <div className="relative">
                      <Coins className="absolute left-3 top-3 h-4 w-4 text-amber-500 pointer-events-none" />
                      <Input
                        type="number"
                        min={0}
                        value={settings.dailyQuests.explore.gold}
                        onChange={(e) => handleQuestChange("explore", "gold", Number(e.target.value))}
                        className={`${inputClass} pl-9`}
                      />
                    </div>
                  </FieldGroup>

                  <FieldGroup label="Reward Poin">
                    <div className="relative">
                      <Trophy className="absolute left-3 top-3 h-4 w-4 text-amber-500 pointer-events-none" />
                      <Input
                        type="number"
                        min={0}
                        value={settings.dailyQuests.explore.points}
                        onChange={(e) => handleQuestChange("explore", "points", Number(e.target.value))}
                        className={`${inputClass} pl-9`}
                      />
                    </div>
                  </FieldGroup>
                </div>
              </div>

              {/* Mission 3: Leaderboard Check */}
              <div className="p-4 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl space-y-3">
                <span className="text-xs font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest block">
                  Misi 3: Periksa Peringkat di Papan Skor
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FieldGroup label="Reward XP">
                    <div className="relative">
                      <Award className="absolute left-3 top-3 h-4 w-4 text-emerald-600 pointer-events-none" />
                      <Input
                        type="number"
                        min={0}
                        value={settings.dailyQuests.leaderboard.xp}
                        onChange={(e) => handleQuestChange("leaderboard", "xp", Number(e.target.value))}
                        className={`${inputClass} pl-9`}
                      />
                    </div>
                  </FieldGroup>

                  <FieldGroup label="Reward Gold">
                    <div className="relative">
                      <Coins className="absolute left-3 top-3 h-4 w-4 text-amber-500 pointer-events-none" />
                      <Input
                        type="number"
                        min={0}
                        value={settings.dailyQuests.leaderboard.gold}
                        onChange={(e) => handleQuestChange("leaderboard", "gold", Number(e.target.value))}
                        className={`${inputClass} pl-9`}
                      />
                    </div>
                  </FieldGroup>

                  <FieldGroup label="Reward Poin">
                    <div className="relative">
                      <Trophy className="absolute left-3 top-3 h-4 w-4 text-amber-500 pointer-events-none" />
                      <Input
                        type="number"
                        min={0}
                        value={settings.dailyQuests.leaderboard.points}
                        onChange={(e) => handleQuestChange("leaderboard", "points", Number(e.target.value))}
                        className={`${inputClass} pl-9`}
                      />
                    </div>
                  </FieldGroup>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="submit"
            disabled={saving}
            className="h-10 px-5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4.5 w-4.5 text-white" />
            )}
            Simpan Pengaturan
          </Button>
        </div>
      </form>
    </div>
  );
}
