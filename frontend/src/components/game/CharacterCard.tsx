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
    <Card className="overflow-hidden border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/70 text-white shadow-xl relative">
      {/* Glow decorative effects background */}
      <div className="absolute -left-10 -top-10 h-24 w-24 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />
      <div className="absolute -right-10 -bottom-10 h-24 w-24 rounded-full bg-amber-500/5 blur-xl pointer-events-none" />

      <CardContent className="p-5 relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16 border-2 border-emerald-500 shadow-lg">
              <AvatarImage src={character.avatarUrl} alt={charName} />
              <AvatarFallback className="bg-slate-800 text-emerald-400 text-lg font-bold">
                {charName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-black text-slate-950 shadow-sm animate-pulse">✓</span>
          </div>

          <div className="flex-1 space-y-0.5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white leading-tight tracking-wide drop-shadow-sm">{player.name}</h2>
              <LevelIndicator level={player.level} />
            </div>
            <p className="text-xs font-bold text-emerald-400 tracking-wide">
              {charName} <span className="text-slate-400 font-semibold">• {charRole}</span>
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/60">
          <XpBar currentXp={player.currentXp} xpNeeded={xpNeeded} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 pt-1">
          <div className="flex items-center gap-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md p-3 shadow-inner hover:bg-white/10 transition-colors">
            <Trophy className="h-4.5 w-4.5 text-amber-400 fill-amber-400/10" />
            <div>
              <div className="text-[9px] text-slate-400 uppercase tracking-widest font-extrabold">Points</div>
              <div className="text-base font-black text-white mt-0.5 leading-none">{player.totalPoints}</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md p-3 shadow-inner hover:bg-white/10 transition-colors">
            <Coins className="h-4.5 w-4.5 text-yellow-400 fill-yellow-400/10" />
            <div>
              <div className="text-[9px] text-slate-400 uppercase tracking-widest font-extrabold">Gold</div>
              <div className="text-base font-black text-white mt-0.5 leading-none">{player.gold}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
