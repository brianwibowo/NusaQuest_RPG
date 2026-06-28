import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";
import type { Battle, AppLanguage } from "@/types";
import { Award, Trophy, Timer, CheckCircle2, XCircle } from "lucide-react";
import { audioManager } from "@/lib/audio";
import { hapticsManager } from "@/lib/haptics";

interface BattleQuizProps {
  battle: Battle;
  lang: AppLanguage;
  onFinish: (score: number, passed: boolean) => void;
  onCancel: () => void;
}

// Komponen kuis interaktif (Knowledge Battle) dengan timer, skor kelulusan, dan review penjelasan
export default function BattleQuiz({ battle, lang, onFinish, onCancel }: BattleQuizProps) {
  const { t } = useTranslation();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(battle.timeLimit || 60);
  const [battleOver, setBattleOver] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Lower BGM volume when quiz starts, restore when quiz unmounts
  useEffect(() => {
    audioManager.lowerBgm();
    return () => {
      audioManager.restoreBgm();
    };
  }, []);

  const question = battle.questions[currentIdx];
  const progress = Math.round((currentIdx / battle.questions.length) * 100);

  // Timer Countdown
  useEffect(() => {
    if (battleOver || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setBattleOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, battleOver]);

  // Handle final result sound effect and haptic when quiz finishes
  useEffect(() => {
    if (battleOver) {
      const passed = score >= battle.passingScore;
      if (passed) {
        audioManager.playLevelUp(); // Plays short fanfare
        hapticsManager.triggerLevelUp();
      } else {
        audioManager.playError();
        hapticsManager.triggerError();
      }
    }
  }, [battleOver, score, battle.passingScore]);

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedAns(idx);
    setIsAnswered(true);

    if (idx === question.correctIndex) {
      setScore((prev) => prev + 1);
      audioManager.playSuccess();
      hapticsManager.triggerSuccess();
    } else {
      audioManager.playError();
      hapticsManager.triggerError();
      // Trigger CSS shaking animation
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleNext = () => {
    audioManager.playClick();
    hapticsManager.triggerClick();
    setIsAnswered(false);
    setSelectedAns(null);
    if (currentIdx < battle.questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setBattleOver(true);
    }
  };

  const handleCancelClick = () => {
    audioManager.playClick();
    hapticsManager.triggerClick();
    onCancel();
  };

  const handleFinish = () => {
    const passed = score >= battle.passingScore;
    audioManager.restoreBgm();
    onFinish(score, passed);
  };

  const handleFinishClick = () => {
    audioManager.playClick();
    hapticsManager.triggerClick();
    handleFinish();
  };

  // Render Layar Hasil Kuis
  if (battleOver || timeLeft <= 0) {
    const passed = score >= battle.passingScore;
    return (
      <Card className="border-slate-100 bg-white shadow-md">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-base font-bold text-slate-800">{t("battle.result")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 border border-slate-100">
            <span className="text-3xl">{passed ? "🎉" : "💪"}</span>
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-base font-bold text-slate-800">{passed ? t("battle.passed") : t("battle.failed")}</h3>
            <p className="text-xs text-muted-foreground">{t("battle.score", { correct: score, total: battle.questions.length })}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-xs pt-2">
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2.5 border border-slate-100">
              <Award className="h-4 w-4 text-emerald-500" />
              <div>
                <div className="text-[9px] text-muted-foreground uppercase font-semibold">XP</div>
                <div className="text-xs font-bold text-slate-700">{passed ? battle.rewardXp : 0}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2.5 border border-slate-100">
              <Trophy className="h-4 w-4 text-amber-500" />
              <div>
                <div className="text-[9px] text-muted-foreground uppercase font-semibold">Points</div>
                <div className="text-xs font-bold text-slate-700">{passed ? battle.rewardPoints : 0}</div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-3 pt-2">
          {!passed && (
            <Button variant="outline" size="sm" onClick={handleCancelClick} className="text-xs">
              {t("common.close")}
            </Button>
          )}
          <Button size="sm" onClick={handleFinishClick} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
            {t("battle.finish")}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className={`border-slate-100 bg-white shadow-md transition-all ${isShaking ? "animate-shake border-red-300 shadow-red-50" : ""}`}>
      <CardHeader className="pb-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-emerald-600 uppercase tracking-wider">{battle.title[lang]}</span>
          <div className="flex items-center gap-1 font-medium">
            <Timer className="h-3.5 w-3.5" />
            <span>{timeLeft}s</span>
          </div>
        </div>
        <Progress value={progress} className="h-1 bg-emerald-100" />
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pertanyaan */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {t("battle.question", { current: currentIdx + 1, total: battle.questions.length })}
          </span>
          <p className="text-sm font-bold text-slate-800 leading-snug">{question.question[lang]}</p>
        </div>

        {/* Pilihan Jawaban */}
        <div className="flex flex-col gap-2 pt-1">
          {question.options.map((opt, idx) => {
            let btnStyle = "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer";
            let icon = null;

            if (isAnswered) {
              if (idx === question.correctIndex) {
                btnStyle = "border-emerald-200 bg-emerald-50 text-emerald-800";
                icon = <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />;
              } else if (idx === selectedAns) {
                btnStyle = "border-rose-200 bg-rose-50 text-rose-800";
                icon = <XCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />;
              } else {
                btnStyle = "border-slate-100 bg-slate-50/50 text-slate-400 opacity-60";
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelectOption(idx)}
                className={`flex items-center justify-between p-3 rounded-lg border text-xs font-semibold text-left transition-colors ${btnStyle}`}
              >
                <span>{opt[lang]}</span>
                {icon}
              </button>
            );
          })}
        </div>

        {/* Ulasan penjelasan edukasi */}
        {isAnswered && (
          <div className="rounded-lg bg-emerald-50/40 p-3 border border-emerald-100/50 space-y-1">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
              {selectedAns === question.correctIndex ? t("battle.correct") : t("battle.wrong")}
            </span>
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              {question.explanation[lang]}
            </p>
          </div>
        )}
      </CardContent>

      {isAnswered && (
        <CardFooter className="flex justify-end pt-0 pb-4 pr-6">
          <Button size="sm" onClick={handleNext} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">
            {t("battle.next")}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
