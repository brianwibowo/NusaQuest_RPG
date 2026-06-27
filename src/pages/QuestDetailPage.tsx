import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { usePlayer } from "@/context/PlayerContext";
import { QUESTS } from "@/data/quests";
import { BATTLES } from "@/data/battles";
import { STORIES } from "@/data/stories";
import { REWARDS } from "@/data/rewards";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { getQuestTypeColor, getQuestTypeLabel } from "@/lib/quest";
import BattleQuiz from "@/components/game/BattleQuiz";
import { getLevelDefinition } from "@/lib/xp";
import { ArrowLeft, Clock, Award, Trophy, Play, ShieldAlert } from "lucide-react";

export default function QuestDetailPage() {
  const { t } = useTranslation();
  const { questId } = useParams<{ questId: string }>();
  const { player, dispatch } = usePlayer();
  const lang = player.language || "id";

  const originalQuest = QUESTS.find((q) => q.id === questId);
  const [quest, setQuest] = useState(originalQuest);
  const [battleActive, setBattleActive] = useState(false);
  const [showLevelUpDialog, setShowLevelUpDialog] = useState(false);
  const [justLeveledUpTo, setJustLeveledUpTo] = useState<number | null>(null);

  if (!quest) {
    return (
      <div className="text-center py-10 space-y-3">
        <p className="text-sm font-semibold text-slate-500">Quest Not Found</p>
        <Button asChild size="sm" className="text-xs bg-emerald-600">
          <Link to="/quests">{t("common.back")}</Link>
        </Button>
      </div>
    );
  }

  const isLocked = player.level < quest.requiredLevel;
  const isCompleted = player.completedQuestIds.includes(quest.id);
  const isActive = player.activeQuestIds.includes(quest.id);
  const battle = BATTLES.find((b) => b.id === quest.battleId);

  // 1. Start Quest
  const handleStartQuest = () => {
    dispatch({ type: "START_QUEST", questId: quest.id });
  };

  // 2. Complete objective locally and check overall quest completion
  const handleCompleteObjective = (objId: string, isChecked: boolean) => {
    if (!isActive || isCompleted) return;

    const updatedObjectives = quest.objectives.map((obj) =>
      obj.id === objId ? { ...obj, completed: isChecked } : obj
    );

    const updatedQuest = { ...quest, objectives: updatedObjectives };
    setQuest(updatedQuest);

    // If all objectives are now completed, automatically trigger quest completion
    const allDone = updatedObjectives.every((obj) => obj.completed);
    if (allDone) {
      handleCompleteQuest();
    }
  };

  // 3. Complete Quest & Claim Rewards
  const handleCompleteQuest = () => {
    // Check for level up beforehand
    const nextLevelDef = getLevelDefinition(player.level + 1);
    const willLevelUp = player.currentXp + quest.reward.xp >= nextLevelDef.requiredXp && player.level < 6;

    dispatch({ type: "COMPLETE_QUEST", questId: quest.id });
    dispatch({ type: "GAIN_XP", amount: quest.reward.xp });
    dispatch({ type: "GAIN_POINTS", amount: quest.reward.points });

    // Unlock story if applicable
    if (quest.reward.storyUnlockId) {
      dispatch({ type: "UNLOCK_STORY", storyId: quest.reward.storyUnlockId });
    }

    // Award badge if applicable
    if (quest.reward.badgeId) {
      dispatch({ type: "OBTAIN_BADGE", badgeId: quest.reward.badgeId });
      dispatch({ type: "OBTAIN_REWARD", rewardId: quest.reward.badgeId });
    }

    // Award voucher if applicable
    if (quest.reward.voucherId) {
      dispatch({ type: "OBTAIN_REWARD", rewardId: quest.reward.voucherId });
    }

    // Award collectible if applicable
    if (quest.reward.collectibleId) {
      dispatch({ type: "OBTAIN_REWARD", rewardId: quest.reward.collectibleId });
    }

    if (willLevelUp) {
      setJustLeveledUpTo(player.level + 1);
      setShowLevelUpDialog(true);
    }
  };

  // 4. Battle finish trigger callback
  const handleBattleFinish = (_score: number, passed: boolean) => {
    setBattleActive(false);
    if (passed) {
      // Find the objective that requires answer_quiz
      const quizObjective = quest.objectives.find((obj) => obj.type === "answer_quiz");
      if (quizObjective) {
        handleCompleteObjective(quizObjective.id, true);
      }
    }
  };

  // Get rewards details to display
  const rewardBadge = REWARDS.find((r) => r.id === quest.reward.badgeId);
  const rewardVoucher = REWARDS.find((r) => r.id === quest.reward.voucherId);
  const rewardCollectible = REWARDS.find((r) => r.id === quest.reward.collectibleId);
  const unlockedStory = STORIES.find((s) => s.id === quest.reward.storyUnlockId);

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Link to="/quests" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" />
        <span>{t("common.back")}</span>
      </Link>

      {/* Level Locked Alert */}
      {isLocked && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs font-semibold">
          <ShieldAlert className="h-4 w-4 text-rose-600 flex-shrink-0" />
          <span>{t("quest.locked")} · {t("quest.level_required", { level: quest.requiredLevel })}</span>
        </div>
      )}

      {/* Quest Banner details */}
      <Card className="overflow-hidden border-slate-100 bg-white shadow-md">
        <CardContent className="p-5 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge className={`border-0 font-medium ${getQuestTypeColor(quest.type)}`}>
                {getQuestTypeLabel(quest.type, lang)}
              </Badge>
              {isCompleted && (
                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {t("quest.completed")}
                </span>
              )}
            </div>

            <h2 className="text-lg font-bold text-slate-800 leading-snug">{quest.title[lang]}</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">{quest.description[lang]}</p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 pt-3 border-t border-slate-50">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>{quest.estimatedDuration[lang]}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                quest.difficulty === "easy" ? "bg-emerald-50 text-emerald-700" :
                quest.difficulty === "medium" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
              }`}>
                {t(`quest.${quest.difficulty}`)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quest Objectives (If active or completed) */}
      {(isActive || isCompleted) && (
        <Card className="border-slate-100 bg-white shadow-sm">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {t("quest.objectives")}
            </h3>
            
            <div className="flex flex-col gap-2.5">
              {quest.objectives.map((obj) => (
                <div key={obj.id} className="flex items-start gap-3 p-2 bg-slate-50/50 rounded-lg border border-slate-100">
                  <Checkbox
                    id={obj.id}
                    checked={isCompleted || obj.completed}
                    disabled={isCompleted || !isActive || obj.type === "answer_quiz"}
                    onCheckedChange={(checked: boolean | "indeterminate") => handleCompleteObjective(obj.id, !!checked)}
                    className="mt-0.5 border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                  />
                  <div className="flex-1 space-y-1">
                    <label
                      htmlFor={obj.id}
                      className={`text-xs font-semibold text-slate-700 leading-snug cursor-pointer select-none ${
                        (isCompleted || obj.completed) ? "line-through text-slate-400" : ""
                      }`}
                    >
                      {obj.description[lang]}
                    </label>

                    {/* Quiz/Battle action button */}
                    {obj.type === "answer_quiz" && !obj.completed && !isCompleted && isActive && battle && (
                      <div className="pt-1.5">
                        <Button
                          size="sm"
                          onClick={() => setBattleActive(true)}
                          className="h-7 px-3 text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-white flex gap-1 items-center"
                        >
                          <Play className="h-3 w-3 fill-white" />
                          <span>{t("battle.title")} ({battle.title[lang]})</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quest Rewards Section */}
      <Card className="border-slate-100 bg-white shadow-sm">
        <CardContent className="p-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {t("quest.rewards")}
          </h3>

          <div className="grid grid-cols-2 gap-3 pb-2">
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 border border-slate-100 shadow-sm">
              <Award className="h-4.5 w-4.5 text-emerald-500" />
              <div>
                <div className="text-[9px] text-muted-foreground uppercase font-semibold">XP</div>
                <div className="text-xs font-bold text-slate-700">+{quest.reward.xp}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 border border-slate-100 shadow-sm">
              <Trophy className="h-4.5 w-4.5 text-amber-500" />
              <div>
                <div className="text-[9px] text-muted-foreground uppercase font-semibold">Points</div>
                <div className="text-xs font-bold text-slate-700">+{quest.reward.points}</div>
              </div>
            </div>
          </div>

          {/* Special items rewarded */}
          {(rewardBadge || rewardVoucher || rewardCollectible || unlockedStory) && (
            <div className="space-y-2 pt-2 border-t border-slate-50">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bonus Item</span>
              <div className="flex flex-col gap-2">
                {rewardBadge && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-violet-50/50 p-2 rounded-lg border border-violet-100">
                    <span className="text-lg">🏆</span>
                    <span>Badge: {rewardBadge.name[lang]}</span>
                  </div>
                )}
                {rewardVoucher && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                    <span className="text-lg">🎫</span>
                    <span>Voucher: {rewardVoucher.name[lang]}</span>
                  </div>
                )}
                {rewardCollectible && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-pink-50/50 p-2 rounded-lg border border-pink-100">
                    <span className="text-lg">🎨</span>
                    <span>Collectible: {rewardCollectible.name[lang]}</span>
                  </div>
                )}
                {unlockedStory && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                    <span className="text-lg">📜</span>
                    <span>Story: {unlockedStory.title[lang]}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Start Quest Action Trigger */}
      {!isActive && !isCompleted && !isLocked && (
        <Button
          onClick={handleStartQuest}
          className="w-full h-11 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
        >
          {t("quest.start")}
        </Button>
      )}

      {/* ─── Modal Dialog: Battle Quiz Quiz ─── */}
      {battle && (
        <Dialog open={battleActive} onOpenChange={setBattleActive}>
          <DialogContent className="max-w-md p-4 rounded-xl border-slate-100 gap-0">
            <DialogTitle className="sr-only">Knowledge Battle</DialogTitle>
            <DialogDescription className="sr-only">Educational challenge quiz</DialogDescription>
            <BattleQuiz
              battle={battle}
              lang={lang}
              onFinish={handleBattleFinish}
              onCancel={() => setBattleActive(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* ─── Modal Dialog: Level Up Notification ─── */}
      <Dialog open={showLevelUpDialog} onOpenChange={setShowLevelUpDialog}>
        <DialogContent className="max-w-xs p-5 rounded-2xl border-slate-100 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 border-2 border-amber-400 shadow-sm animate-bounce">
            <span className="text-2xl">⭐</span>
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-base font-bold text-slate-800">{t("common.level_up")}</DialogTitle>
            <DialogDescription className="text-xs text-emerald-600 font-bold">
              {t("common.new_level", {
                level: justLeveledUpTo,
                name: justLeveledUpTo ? getLevelDefinition(justLeveledUpTo).name[lang] : "",
              })}
            </DialogDescription>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal font-medium">
            🎉 Selamat! Level kamu meningkat. Kamu memperoleh akses ke misi baru dan reward eksklusif!
          </p>
          <Button
            size="sm"
            onClick={() => setShowLevelUpDialog(false)}
            className="w-full h-9 mt-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {t("common.close")}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
