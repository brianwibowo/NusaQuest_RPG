import { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePlayer } from "@/context/PlayerContext";
import { Globe, Menu, BookOpen, ShoppingBag, Trophy, Home, User, Swords, Gift, Map, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { getLevelDefinition } from "@/lib/xp";
import { Link, useLocation } from "react-router-dom";
import { audioManager } from "@/lib/audio";
import { hapticsManager } from "@/lib/haptics";

export default function Header() {
  const { t, i18n } = useTranslation();
  const { player, dispatch } = usePlayer();
  const location = useLocation();
  const [isMuted, setIsMuted] = useState(audioManager.getMutedState());

  const levelDef = getLevelDefinition(player.level);
  const levelName = player.language === "id" ? levelDef.name.id : levelDef.name.en;

  const toggleLanguage = () => {
    audioManager.playClick();
    hapticsManager.triggerClick();
    const newLang = player.language === "id" ? "en" : "id";
    i18n.changeLanguage(newLang);
    dispatch({ type: "SET_LANGUAGE", language: newLang });
  };

  const toggleMute = () => {
    const nextMute = audioManager.toggleMute();
    setIsMuted(nextMute);
    // Trigger small click sound/haptic if not muted
    if (!nextMute) {
      audioManager.playClick();
    }
    hapticsManager.triggerClick();
  };

  const menuItems = [
    { to: "/", icon: Home, label: t("nav.home") },
    { to: "/explore", icon: Map, label: t("nav.explore") },
    { to: "/quests", icon: Swords, label: t("nav.quests") },
    { to: "/rewards", icon: Gift, label: t("nav.rewards") },
    { to: "/profile", icon: User, label: t("profile.title") },
    { to: "/story", icon: BookOpen, label: t("story.title") },
    { to: "/umkm", icon: ShoppingBag, label: t("umkm.title") },
    { to: "/leaderboard", icon: Trophy, label: t("leaderboard.title") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-2.5">
        {/* Menu & Logo */}
        <div className="flex items-center gap-2">
          {player.hasCompletedOnboarding && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-slate-900">
                  <Menu className="h-4.5 w-4.5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-4 border-r-slate-100 bg-white flex flex-col gap-4">
                <SheetHeader className="pb-2 border-b border-slate-100">
                  <SheetTitle className="text-left text-base font-bold text-emerald-700">
                    🏝️ {t("app.name")}
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-1 flex-1">
                  {menuItems.map((item) => {
                    const isActive = location.pathname === item.to;
                    return (
                      <SheetClose asChild key={item.to}>
                        <Link
                          to={item.to}
                          className={`flex flex-row items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all w-full ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 shadow-sm"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <item.icon className={`h-4.5 w-4.5 flex-shrink-0 ${isActive ? "text-emerald-700" : "text-slate-400"}`} />
                          <span>{item.label}</span>
                        </Link>
                      </SheetClose>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          )}

          <Link to="/" className="text-base font-bold text-emerald-700 tracking-tight select-none">
            🏝️ {t("app.name")}
          </Link>
        </div>

        {/* Level + Language + Audio Toggle */}
        <div className="flex items-center gap-2">
          {player.hasCompletedOnboarding && (
            <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0.5 border-slate-100 bg-slate-100 hover:bg-slate-100 text-slate-600">
              Lv.{player.level} · {levelName}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="h-8 w-8 text-slate-600 hover:text-slate-900"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-red-500" /> : <Volume2 className="h-4 w-4 text-emerald-600" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            className="h-8 w-8 text-slate-600 hover:text-slate-900"
            title={t("profile.language")}
          >
            <Globe className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
