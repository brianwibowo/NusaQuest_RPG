import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import type { Character, PlayerState } from "@/types";
import XpBar from "./XpBar";
import LevelIndicator from "./LevelIndicator";
import { Coins, Trophy } from "lucide-react";

interface CharacterCardProps {
  player: PlayerState;
  character: Character;
  xpNeeded: number;
}

// Card ringkasan status karakter pemain (avatar, level, XP, coins, points)
export default function CharacterCard({ player, character, xpNeeded }: CharacterCardProps) {
  const { i18n } = useTranslation();
  const lang = player.language || (i18n.language as "id" | "en") || "id";

  const charName = character.name[lang];
  const charRole = character.role[lang];

  return (
    <Card className="overflow-hidden border-emerald-100 bg-gradient-to-br from-white to-emerald-50/20 shadow-md">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-emerald-500 shadow-sm">
            <AvatarImage src={character.avatarUrl} alt={charName} />
            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg font-bold">
              {charName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-0.5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 leading-tight">{player.name}</h2>
              <LevelIndicator level={player.level} />
            </div>
            <p className="text-xs font-semibold text-emerald-600">{charName} • <span className="text-slate-500">{charRole}</span></p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          <XpBar currentXp={player.currentXp} xpNeeded={xpNeeded} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 pt-1">
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2.5 border border-slate-100">
            <Trophy className="h-4 w-4 text-amber-500" />
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Points</div>
              <div className="text-sm font-bold text-slate-700">{player.totalPoints}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2.5 border border-slate-100">
            <Coins className="h-4 w-4 text-yellow-500" />
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Gold</div>
              <div className="text-sm font-bold text-slate-700">{player.gold}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
