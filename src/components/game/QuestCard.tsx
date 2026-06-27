import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Quest, AppLanguage } from "@/types";
import { getQuestTypeColor, getQuestTypeLabel, getQuestProgress } from "@/lib/quest";
import { Clock, Trophy, Award, Lock, ArrowRight } from "lucide-react";

interface QuestCardProps {
  quest: Quest;
  playerLevel: number;
  lang: AppLanguage;
}

// Menampilkan ringkasan misi, tipe, status aksesibilitas, progress, dan tombol detail
export default function QuestCard({ quest, playerLevel, lang }: QuestCardProps) {
  const { t } = useTranslation();
  const isLocked = playerLevel < quest.requiredLevel;
  const isCompleted = quest.status === "completed";
  const isInProgress = quest.status === "in_progress";
  const progress = getQuestProgress(quest);

  return (
    <Card className={`overflow-hidden border-slate-100 transition-all hover:shadow-md ${isLocked ? "opacity-75 bg-slate-50/50" : "bg-white"}`}>
      <CardContent className="p-4 flex flex-col justify-between h-full gap-3">
        {/* Header: Tipe & Status */}
        <div className="flex items-center justify-between">
          <Badge className={`border-0 font-medium ${getQuestTypeColor(quest.type)}`}>
            {getQuestTypeLabel(quest.type, lang)}
          </Badge>
          
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {isLocked ? (
              <span className="flex items-center gap-1 text-slate-400">
                <Lock className="h-3 w-3" />
                {t("quest.level_required", { level: quest.requiredLevel })}
              </span>
            ) : isCompleted ? (
              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                {t("quest.completed")}
              </span>
            ) : isInProgress ? (
              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                {progress}%
              </span>
            ) : (
              <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-[10px]">
                {t("quest.all")}
              </span>
            )}
          </div>
        </div>

        {/* Judul & Deskripsi */}
        <div className="space-y-1">
          <h3 className="font-bold text-slate-800 line-clamp-1 leading-snug">{quest.title[lang]}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{quest.description[lang]}</p>
        </div>

        {/* Info detail (Waktu, XP, Point) */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-50">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>{quest.estimatedDuration[lang]}</span>
          </div>

          <div className="flex items-center gap-3 font-semibold text-slate-700">
            <span className="flex items-center gap-1 text-emerald-600">
              <Award className="h-3.5 w-3.5" />
              <span>{quest.reward.xp}</span>
            </span>
            <span className="flex items-center gap-1 text-amber-600">
              <Trophy className="h-3.5 w-3.5" />
              <span>{quest.reward.points}</span>
            </span>
          </div>
        </div>

        {/* Tombol aksi */}
        {!isLocked && (
          <Link
            to={`/quests/${quest.id}`}
            className="flex items-center justify-center gap-1 w-full rounded-lg bg-emerald-50 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors mt-1"
          >
            <span>{isInProgress ? t("quest.continue") : isCompleted ? t("quest.completed") : t("quest.start")}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
