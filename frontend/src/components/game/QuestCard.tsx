import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePlayer } from "@/context/PlayerContext";
import type { Quest, AppLanguage } from "@/types";
import { getQuestTypeColor, getQuestTypeLabel } from "@/lib/quest";
import { Clock, Trophy, Award, Lock, ArrowRight } from "lucide-react";

interface QuestCardProps {
  quest: Quest;
  playerLevel?: number;
  lang?: AppLanguage;
}

// Menampilkan ringkasan misi, tipe, status aksesibilitas, progress, dan tombol detail
export default function QuestCard({ quest, playerLevel, lang }: QuestCardProps) {
  const { t } = useTranslation();
  const { player } = usePlayer();

  const actualPlayerLevel = playerLevel ?? player.level;
  const actualLang = lang ?? player.language ?? "id";

  const isLocked = actualPlayerLevel < quest.requiredLevel;
  const isCompleted = player.completedQuestIds.includes(quest.id);
  const isInProgress = player.activeQuestIds.includes(quest.id);

  // Load saved objective progress from localStorage
  let savedCompletedIds: string[] = [];
  try {
    const saved = localStorage.getItem("sinopiquest_completed_objectives");
    if (saved) {
      savedCompletedIds = JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load objectives in QuestCard", e);
  }

  const completedObjectivesCount = quest.objectives.filter(
    (obj) => savedCompletedIds.includes(obj.id) || obj.completed
  ).length;

  const progress = quest.objectives.length > 0
    ? Math.round((completedObjectivesCount / quest.objectives.length) * 100)
    : 0;


  let borderStyle = "border-slate-100 bg-white";
  let statusBadge = null;
  let actionButton = null;

  if (isLocked) {
    borderStyle = "border-slate-200 bg-slate-50/50 opacity-70";
    statusBadge = (
      <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">
        <Lock className="h-3 w-3" />
        {t("quest.level_required", { level: quest.requiredLevel })}
      </span>
    );
  } else if (isCompleted) {
    borderStyle = "border-emerald-100 bg-emerald-50/10 shadow-sm shadow-emerald-50/30";
    statusBadge = (
      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-widest flex items-center gap-0.5">
        ✓ {t("quest.completed")}
      </span>
    );
    actionButton = (
      <Link
        to={`/quests/${quest.id}`}
        className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-slate-100 hover:bg-slate-200 py-2.5 text-xs font-black text-slate-600 transition-all duration-300 mt-1 cursor-pointer active:scale-95"
      >
        <span>LIHAT DETAIL MISI</span>
        <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
      </Link>
    );
  } else if (isInProgress) {
    borderStyle = "border-indigo-200 bg-indigo-50/15 shadow-md shadow-indigo-100/30 ring-1 ring-indigo-100/50";
    statusBadge = (
      <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 uppercase tracking-widest flex items-center gap-1 animate-pulse">
        🧭 {progress}% AKTIF
      </span>
    );
    actionButton = (
      <Link
        to={`/quests/${quest.id}`}
        className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 py-2.5 text-xs font-black text-white shadow-md shadow-indigo-500/10 hover:shadow-lg transition-all duration-300 mt-1 cursor-pointer active:scale-95 hover:scale-[1.01]"
      >
        <span>{t("quest.continue").toUpperCase()}</span>
        <ArrowRight className="h-3.5 w-3.5 text-white animate-bounce-horizontal" />
      </Link>
    );
  } else {
    borderStyle = "border-slate-100 hover:border-emerald-200 bg-white shadow-sm hover:shadow-md";
    statusBadge = (
      <span className="text-[10px] font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100 uppercase tracking-widest">
        {t("quest.available")}
      </span>
    );
    actionButton = (
      <Link
        to={`/quests/${quest.id}`}
        className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-500/10 hover:shadow-lg transition-all duration-300 mt-1 cursor-pointer active:scale-95 hover:scale-[1.01]"
      >
        <span>{t("quest.start").toUpperCase()}</span>
        <ArrowRight className="h-3.5 w-3.5 text-white" />
      </Link>
    );
  }

  return (
    <div className={`overflow-hidden border rounded-2xl p-4 flex flex-col justify-between h-full gap-3.5 transition-all duration-300 ${borderStyle}`}>
      {/* Header: Tipe & Status */}
      <div className="flex items-center justify-between">
        <Badge className={`border-0 font-bold text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded-md ${getQuestTypeColor(quest.type)}`}>
          {getQuestTypeLabel(quest.type, actualLang)}
        </Badge>
        
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          {statusBadge}
        </div>
      </div>

      {/* Judul & Deskripsi */}
      <div className="space-y-1 text-left">
        <h3 className="font-black text-slate-800 text-sm leading-snug line-clamp-1">{quest.title[actualLang]}</h3>
        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed line-clamp-2">{quest.description[actualLang]}</p>
      </div>

      {/* Info detail (Waktu, XP, Point) */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2.5 border-t border-slate-50 font-bold">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>{quest.estimatedDuration[actualLang]}</span>
        </div>

        <div className="flex items-center gap-3 font-extrabold text-slate-700">
          <span className="flex items-center gap-1 text-emerald-600">
            <Award className="h-3.5 w-3.5" />
            <span>{quest.reward.xp} XP</span>
          </span>
          <span className="flex items-center gap-1 text-amber-600">
            <Trophy className="h-3.5 w-3.5" />
            <span>{quest.reward.points} Poin</span>
          </span>
        </div>
      </div>

      {/* Tombol aksi */}
      {actionButton}
    </div>
  );
}
