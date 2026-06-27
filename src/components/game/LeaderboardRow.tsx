import type { LeaderboardEntry } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
}

// Menampilkan baris user dalam tabel leaderboard dengan trophy styling untuk top 3
export default function LeaderboardRow({ entry }: LeaderboardRowProps) {
  const isTop3 = entry.rank <= 3;

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl border border-slate-100 transition-colors ${
        entry.isCurrentPlayer
          ? "bg-emerald-50/50 border-emerald-200"
          : "bg-white hover:bg-slate-50/50"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Peringkat / Rank */}
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center font-bold text-xs">
          {isTop3 ? (
            <Trophy
              className={`h-4.5 w-4.5 ${
                entry.rank === 1
                  ? "text-yellow-500"
                  : entry.rank === 2
                  ? "text-slate-400"
                  : "text-amber-600"
              }`}
            />
          ) : (
            <span className="text-slate-500">{entry.rank}</span>
          )}
        </div>

        {/* Avatar */}
        <Avatar className="h-8 w-8 border border-slate-200">
          <AvatarFallback className="bg-slate-100 text-xs font-bold text-slate-700">
            {entry.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Nama & Level */}
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-800">{entry.name}</span>
            {entry.isCurrentPlayer && (
              <span className="bg-emerald-600 text-white text-[8px] font-bold px-1 py-0.2 rounded-md uppercase">Me</span>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">Lv. {entry.level}</span>
        </div>
      </div>

      {/* Skor Poin */}
      <div className="text-right">
        <div className="text-xs font-bold text-slate-800">{entry.totalPoints}</div>
        <div className="text-[9px] text-muted-foreground font-medium">{entry.questsCompleted} Quests</div>
      </div>
    </div>
  );
}
