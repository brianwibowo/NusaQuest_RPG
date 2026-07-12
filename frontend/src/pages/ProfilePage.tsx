import { usePlayer } from "@/context/PlayerContext";
import { useAuth } from "@/context/AuthContext";
import { CHARACTERS } from "@/data/characters";
import { QUESTS } from "@/data/quests";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LanguageToggle from "@/components/common/LanguageToggle";
import { User, Award, LogOut, CheckCircle2 } from "lucide-react";

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { player } = usePlayer();
  const { isAuthenticated, signOut } = useAuth();
  const lang = player.language || "id";

  const character = CHARACTERS.find((c) => c.id === player.selectedCharacterId);

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      signOut();
      navigate("/onboarding");
    }
  };

  if (!character) return null;

  // Filter completed quests to show in history list
  const completedQuests = QUESTS.filter((q) => player.completedQuestIds.includes(q.id));

  return (
    <div className="space-y-4">
      {/* 1. Profile Header Card */}
      <Card className="overflow-hidden border-slate-100 bg-white shadow-md">
        <CardContent className="p-5 flex items-center gap-4">
          <Avatar className="h-14 w-14 border border-slate-200 shadow-sm flex-shrink-0">
            <AvatarImage src={character.avatarUrl} alt={player.name} />
            <AvatarFallback className="bg-slate-100 text-slate-700 text-base font-bold">
              {player.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-base font-bold text-slate-800 leading-snug">{player.name}</h2>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/50 mt-1 inline-block">
              {character.name[lang]}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 2. App Settings List */}
      <Card className="border-slate-100 bg-white shadow-sm">
        <CardContent className="p-4 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <User className="h-4 w-4 text-emerald-600" />
            <span>Pengaturan</span>
          </h3>

          <div className="flex items-center justify-between py-1 border-b border-slate-50">
            <span className="text-xs font-semibold text-slate-600">{t("profile.language")}</span>
            <LanguageToggle />
          </div>

          {/* Logout Button */}
          {isAuthenticated && (
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-0 py-2 h-auto text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-transparent cursor-pointer"
            >
              <span>{t("onboarding.logout") || "Keluar"}</span>
              <LogOut className="h-4 w-4 text-rose-500" />
            </Button>
          )}
        </CardContent>
      </Card>

      {/* 3. Completed Quests Journey History */}
      <Card className="border-slate-100 bg-white shadow-sm">
        <CardContent className="p-4 space-y-3.5">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="h-4 w-4 text-emerald-600" />
            <span>{t("profile.journey_history")}</span>
          </h3>

          {completedQuests.length > 0 ? (
            <div className="flex flex-col gap-2">
              {completedQuests.map((quest) => (
                <div key={quest.id} className="flex items-center gap-2 p-2.5 bg-slate-50/50 rounded-lg border border-slate-100">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate-700 truncate">{quest.title[lang]}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground italic text-center py-4">
              Belum ada misi yang diselesaikan. Mulailah bertualang!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
