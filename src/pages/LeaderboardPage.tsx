import { usePlayer } from "@/context/PlayerContext";
import { LEADERBOARD } from "@/data/leaderboard";
import LeaderboardRow from "@/components/game/LeaderboardRow";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export default function LeaderboardPage() {
  const { t } = useTranslation();
  const { player } = usePlayer();

  // Create runtime player entry for the leaderboard
  const playerEntry = {
    rank: 1, // Will compute actual rank below
    name: player.name || "Adventurer",
    characterId: player.selectedCharacterId || "explorer",
    level: player.level,
    totalPoints: player.totalPoints,
    questsCompleted: player.completedQuestIds.length,
    isCurrentPlayer: true,
  };

  // Combine player entry into leaderboard and sort by points
  const combinedLeaderboard = [...LEADERBOARD, playerEntry]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  const top3 = combinedLeaderboard.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Header title */}
      <div className="space-y-0.5">
        <h1 className="text-xl font-bold text-slate-800 leading-snug">{t("leaderboard.title")}</h1>
        <p className="text-xs text-muted-foreground font-semibold leading-normal">
          Jelajahi destinasi, selesaikan misi, dan raih posisi puncak klasemen!
        </p>
      </div>

      {/* Top 3 special cards layout */}
      <div className="grid grid-cols-3 gap-2.5 items-end pt-3 pb-1">
        {/* Rank 2 */}
        {top3[1] && (
          <Card className="border-slate-100 bg-white shadow-sm flex flex-col items-center p-3 text-center h-28 justify-center relative">
            <span className="text-lg">🥈</span>
            <span className="text-[10px] font-bold text-slate-800 truncate w-full mt-1">{top3[1].name}</span>
            <span className="text-[11px] font-extrabold text-slate-700 mt-0.5">{top3[1].totalPoints} Pts</span>
          </Card>
        )}

        {/* Rank 1 */}
        {top3[0] && (
          <Card className="border-emerald-100 bg-emerald-50/20 shadow-md flex flex-col items-center p-3.5 text-center h-32 justify-center relative border-b-2 border-b-emerald-500">
            <Trophy className="h-6 w-6 text-yellow-500 fill-yellow-500/10" />
            <span className="text-xs font-extrabold text-slate-800 truncate w-full mt-1.5">{top3[0].name}</span>
            <span className="text-xs font-black text-emerald-700 mt-0.5">{top3[0].totalPoints} Pts</span>
          </Card>
        )}

        {/* Rank 3 */}
        {top3[2] && (
          <Card className="border-slate-100 bg-white shadow-sm flex flex-col items-center p-3 text-center h-26 justify-center relative">
            <span className="text-lg">🥉</span>
            <span className="text-[10px] font-bold text-slate-800 truncate w-full mt-1">{top3[2].name}</span>
            <span className="text-[11px] font-extrabold text-slate-700 mt-0.5">{top3[2].totalPoints} Pts</span>
          </Card>
        )}
      </div>

      {/* Remaining list */}
      <div className="space-y-2">
        {combinedLeaderboard.map((entry) => (
          <LeaderboardRow key={entry.name} entry={entry} />
        ))}
      </div>
    </div>
  );
}
