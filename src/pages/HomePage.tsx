import { usePlayer } from "@/context/PlayerContext";
import { CHARACTERS } from "@/data/characters";
import { QUESTS } from "@/data/quests";
import { getXpForNextLevel } from "@/lib/xp";
import CharacterCard from "@/components/game/CharacterCard";
import QuestCard from "@/components/game/QuestCard";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Map, Swords, Sparkles } from "lucide-react";

export default function HomePage() {
  const { t } = useTranslation();
  const { player } = usePlayer();

  const character = CHARACTERS.find((c) => c.id === player.selectedCharacterId);
  const xpNeeded = getXpForNextLevel(player.level);
  const lang = player.language || "id";

  // Filter active quests (in_progress)
  const activeQuests = QUESTS.filter((q) => player.activeQuestIds.includes(q.id));

  return (
    <div className="space-y-5">
      {/* 1. Header Greeting */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-slate-800 leading-snug">
          {t("home.greeting", { name: player.name })}
        </h1>
        <p className="text-xs text-muted-foreground font-medium leading-normal flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
          {t("app.tagline")}
        </p>
      </div>

      {/* 2. Character Status Card */}
      {character && (
        <CharacterCard
          player={player}
          character={character}
          xpNeeded={xpNeeded}
        />
      )}

      {/* 3. Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          asChild
          variant="outline"
          className="h-10 text-xs font-bold border-slate-200 text-slate-600 hover:text-slate-900 bg-white"
        >
          <Link to="/explore">
            <Map className="mr-1.5 h-4 w-4 text-emerald-600" />
            {t("home.explore_map")}
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-10 text-xs font-bold border-slate-200 text-slate-600 hover:text-slate-900 bg-white"
        >
          <Link to="/quests">
            <Swords className="mr-1.5 h-4 w-4 text-emerald-600" />
            {t("home.view_quests")}
          </Link>
        </Button>
      </div>

      {/* 4. Active Quests Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          {t("home.active_quests")}
        </h3>

        {activeQuests.length > 0 ? (
          <div className="flex flex-col gap-3">
            {activeQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                playerLevel={player.level}
                lang={lang}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
            <span className="text-2xl block mb-1">🗺️</span>
            <p className="text-xs text-muted-foreground font-semibold leading-normal max-w-[240px] mx-auto">
              {t("home.no_active_quests")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
