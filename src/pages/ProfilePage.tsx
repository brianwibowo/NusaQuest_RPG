import { usePlayer } from "@/context/PlayerContext";
import { CHARACTERS } from "@/data/characters";
import { QUESTS } from "@/data/quests";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LanguageToggle from "@/components/common/LanguageToggle";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { User, Award, ShieldAlert, LogOut, CheckCircle2 } from "lucide-react";

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { player, dispatch } = usePlayer();
  const lang = player.language || "id";

  const character = CHARACTERS.find((c) => c.id === player.selectedCharacterId);

  const handleResetGame = () => {
    dispatch({ type: "RESET_GAME" });
    navigate("/onboarding");
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

          {/* Reset Game Dialog Trigger */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between px-0 py-2 h-auto text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-transparent"
              >
                <span>{t("profile.reset_game")}</span>
                <LogOut className="h-4 w-4 text-rose-500" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xs p-5 rounded-2xl border-slate-100 flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 border border-rose-100 text-rose-600">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <DialogTitle className="text-sm font-bold text-slate-800">{t("profile.reset_game")}</DialogTitle>
              <DialogDescription className="text-xs text-slate-500 leading-relaxed font-medium">
                {t("profile.reset_confirm")} Progres level, poin, dan koleksi reward kamu akan terhapus secara permanen.
              </DialogDescription>
              <div className="flex gap-2.5 w-full pt-1.5">
                <DialogClose asChild>
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    {t("common.cancel")}
                  </Button>
                </DialogClose>
                <Button
                  size="sm"
                  onClick={handleResetGame}
                  className="flex-1 text-xs bg-rose-600 hover:bg-rose-700 text-white"
                >
                  {t("common.confirm")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
