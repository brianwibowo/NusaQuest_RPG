import { usePlayer } from "@/context/PlayerContext";
import { useAuth } from "@/context/AuthContext";
import { CHARACTERS } from "@/data/characters";
import { QUESTS } from "@/data/quests";
import { REWARDS } from "@/data/rewards";
import { getLevelProgress, getXpForCurrentLevel, getXpForNextLevel } from "@/lib/xp";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LanguageToggle from "@/components/common/LanguageToggle";
import { Award, LogOut, Shield, Settings, Trash2 } from "lucide-react";

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { player, dispatch } = usePlayer();
  const { isAuthenticated, signOut } = useAuth();
  const lang = player.language || "id";

  const character = CHARACTERS.find((c) => c.id === player.selectedCharacterId);

  const handleLogout = () => {
    if (window.confirm(t("onboarding.logout_confirm") || "Apakah Anda yakin ingin keluar?")) {
      signOut();
      navigate("/onboarding");
    }
  };

  const handleResetGame = () => {
    if (window.confirm(t("profile.reset_confirm"))) {
      dispatch({ type: "RESET_GAME" });
      navigate("/onboarding");
    }
  };

  if (!character) return null;

  // Filter completed quests to show in history list
  const completedQuests = QUESTS.filter((q) => player.completedQuestIds.includes(q.id));

  // XP progress calculation
  const progressPercent = getLevelProgress(player.currentXp, player.level);
  const currentLevelXp = getXpForCurrentLevel(player.level);
  const nextLevelXp = getXpForNextLevel(player.level);
  const relativeCurrent = player.currentXp - currentLevelXp;
  const relativeNeeded = nextLevelXp - currentLevelXp;

  return (
    <div className="space-y-4">
      {/* 1. RPG Character Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/90 border border-slate-800 shadow-xl rounded-2xl p-5 text-white flex flex-col gap-4">
        {/* Glow overlay */}
        <div className="absolute right-0 top-0 h-28 w-28 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/4 bottom-0 h-20 w-20 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <Avatar className="h-16 w-16 border-2 border-emerald-500/60 shadow-lg shadow-emerald-500/10 flex-shrink-0 bg-slate-900">
            <AvatarImage src={character.avatarUrl} alt={player.name} className="object-cover" />
            <AvatarFallback className="bg-slate-800 text-slate-200 text-base font-black">
              {player.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-1 min-w-0">
            <h2 className="text-base font-black leading-snug truncate">{player.name}</h2>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">
                {character.name[lang]}
              </span>
              <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-widest flex items-center gap-0.5">
                <Shield className="h-2.5 w-2.5" />
                LV. {player.level}
              </span>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="space-y-1.5 relative z-10 pt-1">
          <div className="flex items-center justify-between text-[10px] font-black tracking-wider text-slate-400">
            <span>EXP PROGRESS</span>
            <span className="text-emerald-400 font-extrabold">{relativeCurrent} / {relativeNeeded} XP ({progressPercent}%)</span>
          </div>
          <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* RPG Wallet Grid */}
        <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-3.5 mt-1 text-center relative z-10">
          <div className="bg-white/5 rounded-xl p-2.5 border border-white/10 flex flex-col items-center justify-center">
            <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-0.5">
              🪙 Gold Wallet
            </span>
            <span className="text-sm font-black text-white mt-0.5">{player.gold}</span>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5 border border-white/10 flex flex-col items-center justify-center">
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-0.5">
              🏆 {t("character.points")}
            </span>
            <span className="text-sm font-black text-white mt-0.5">{player.totalPoints}</span>
          </div>
        </div>
      </div>

      {/* 2. Badge Cabinet Card */}
      <Card className="border-slate-100 bg-white shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-4 space-y-3.5">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="h-4 w-4 text-emerald-600" />
            <span>{lang === "id" ? "Koleksi Lencana" : "Badge Cabinet"}</span>
          </h3>

          <div className="grid grid-cols-4 gap-3 pt-1">
            {REWARDS.filter((r) => r.type === "badge").map((badge) => {
              const isUnlocked = player.obtainedBadgeIds.includes(badge.id);
              return (
                <div key={badge.id} className="flex flex-col items-center text-center space-y-1.5">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center border shadow-inner relative transition-transform duration-300 ${
                    isUnlocked 
                      ? "bg-amber-50/50 border-amber-200" 
                      : "bg-slate-50 border-slate-100 opacity-30 grayscale"
                  }`}>
                    {badge.imageUrl ? (
                      <img src={badge.imageUrl} alt={badge.name[lang]} className="h-7 w-7 object-contain" />
                    ) : (
                      <span className="text-lg">🏅</span>
                    )}
                  </div>
                  <span className={`text-[9px] font-extrabold leading-tight line-clamp-2 px-0.5 ${
                    isUnlocked ? "text-slate-800" : "text-slate-400"
                  }`}>
                    {badge.name[lang]}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 3. Completed Quests Journey History */}
      <Card className="border-slate-100 bg-white shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-4 space-y-3.5">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="h-4 w-4 text-emerald-600" />
            <span>{t("profile.journey_history")}</span>
          </h3>

          {completedQuests.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {completedQuests.map((quest) => (
                <div key={quest.id} className="flex items-center gap-2.5 p-2.5 bg-slate-50/50 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors">
                  <span className="text-emerald-500 bg-emerald-50 h-5 w-5 rounded-full flex items-center justify-center border border-emerald-100 flex-shrink-0 text-xs font-black">
                    ✓
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-black text-slate-700 block truncate text-left">{quest.title[lang]}</span>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider text-left">{quest.type}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground font-bold italic text-center py-4">
              {lang === "id" ? "Belum ada misi yang diselesaikan. Mulailah bertualang!" : "No completed quests yet. Start your adventure!"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* 4. App Settings List */}
      <Card className="border-slate-100 bg-white shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-4 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Settings className="h-4 w-4 text-emerald-600" />
            <span>{lang === "id" ? "Pengaturan Sistem" : "System Settings"}</span>
          </h3>

          <div className="flex items-center justify-between py-1 border-b border-slate-50 font-bold">
            <span className="text-xs text-slate-600">{t("profile.language")}</span>
            <LanguageToggle />
          </div>

          <div className="flex flex-col gap-2 pt-1">
            {/* Reset Game button */}
            <Button
              variant="outline"
              onClick={handleResetGame}
              className="w-full flex items-center justify-between px-3 py-2 h-9 text-xs font-extrabold text-amber-600 hover:text-amber-700 border-dashed border-amber-200 hover:bg-amber-50/20 cursor-pointer rounded-xl"
            >
              <span>{t("profile.reset_game")}</span>
              <Trash2 className="h-4 w-4 text-amber-500" />
            </Button>

            {/* Logout Button */}
            {isAuthenticated && (
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-3 py-2 h-9 text-xs font-extrabold text-rose-600 hover:text-rose-700 border-rose-100 hover:bg-rose-50/20 cursor-pointer rounded-xl"
              >
                <span>{t("onboarding.logout") || "Keluar"}</span>
                <LogOut className="h-4 w-4 text-rose-500" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
