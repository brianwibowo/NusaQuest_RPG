import { Button } from "@/components/ui/button";
import { usePlayer } from "@/context/PlayerContext";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

// Tombol toggle bahasa ID/EN yang terintegrasi dengan PlayerContext & i18next
export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const { player, dispatch } = usePlayer();

  const toggleLanguage = () => {
    const newLang = player.language === "id" ? "en" : "id";
    i18n.changeLanguage(newLang);
    dispatch({ type: "SET_LANGUAGE", language: newLang });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 h-8 px-2.5 text-xs font-medium border-slate-200 text-slate-600 hover:text-slate-900"
    >
      <Globe className="h-3.5 w-3.5" />
      <span>{player.language === "id" ? "ID" : "EN"}</span>
    </Button>
  );
}
