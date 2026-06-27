import { usePlayer } from "@/context/PlayerContext";
import { CHARACTERS } from "@/data/characters";
import { REWARDS } from "@/data/rewards";
import { getXpForNextLevel } from "@/lib/xp";
import BadgeDisplay from "@/components/game/BadgeDisplay";
import XpBar from "@/components/game/XpBar";
import LevelIndicator from "@/components/game/LevelIndicator";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Coins, Award, Swords } from "lucide-react";

export default function CharacterPage() {
  const { t } = useTranslation();
  const { player } = usePlayer();
  const lang = player.language || "id";

  const character = CHARACTERS.find((c) => c.id === player.selectedCharacterId);
  const xpNeeded = getXpForNextLevel(player.level);

  // Filter rewards of type "badge"
  const allBadges = REWARDS.filter((r) => r.type === "badge");

  if (!character) return null;

  return (
    <div className="space-y-4">
      {/* 1. Header Profile Avatar */}
      <Card className="overflow-hidden border-slate-100 bg-white shadow-md">
        <CardContent className="p-5 flex flex-col items-center text-center gap-3">
          <div className="relative">
            <Avatar className="h-20 w-20 border-2 border-emerald-500 shadow-sm">
              <AvatarImage src={character.avatarUrl} alt={character.name[lang]} />
              <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xl font-bold">
                {character.name[lang].slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2">
              <LevelIndicator level={player.level} />
            </div>
          </div>

          <div className="space-y-0.5 mt-1">
            <h2 className="text-base font-bold text-slate-800 leading-snug">{player.name}</h2>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100/50">
              {character.name[lang]} · {character.role[lang]}
            </span>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed font-medium max-w-[280px]">
            {character.description[lang]}
          </p>
        </CardContent>
      </Card>

      {/* 2. Stats Overview */}
      <Card className="border-slate-100 bg-white shadow-sm">
        <CardContent className="p-4 space-y-4">
          <XpBar currentXp={player.currentXp} xpNeeded={xpNeeded} />

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 border border-slate-100">
              <Trophy className="h-4 w-4 text-amber-500" />
              <div>
                <div className="text-[8px] text-muted-foreground uppercase font-semibold">Points</div>
                <div className="text-xs font-bold text-slate-700">{player.totalPoints}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 border border-slate-100">
              <Coins className="h-4 w-4 text-yellow-500" />
              <div>
                <div className="text-[8px] text-muted-foreground uppercase font-semibold">Gold</div>
                <div className="text-xs font-bold text-slate-700">{player.gold}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 border border-slate-100">
              <Swords className="h-4 w-4 text-emerald-600" />
              <div>
                <div className="text-[8px] text-muted-foreground uppercase font-semibold">Quests</div>
                <div className="text-xs font-bold text-slate-700">{player.completedQuestIds.length}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Special Power Details */}
      <Card className="border-slate-100 bg-white shadow-sm">
        <CardContent className="p-4 space-y-1.5">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Award className="h-4 w-4 text-emerald-600" />
            <span>{t("character.special_power")}</span>
          </h3>
          <p className="text-xs font-bold text-slate-800 leading-normal">
            ✨ {character.specialPower[lang]}
          </p>
        </CardContent>
      </Card>

      {/* 4. Badges Obtained Grid */}
      <Card className="border-slate-100 bg-white shadow-sm">
        <CardContent className="p-4 space-y-3.5">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {t("character.badges")} ({player.obtainedBadgeIds.length}/{allBadges.length})
          </h3>
          <BadgeDisplay
            badges={allBadges}
            obtainedBadgeIds={player.obtainedBadgeIds}
            lang={lang}
          />
        </CardContent>
      </Card>
    </div>
  );
}
