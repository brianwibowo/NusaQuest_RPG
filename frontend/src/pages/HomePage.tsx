import { useState, useEffect } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { CHARACTERS } from "@/data/characters";
import { REWARDS } from "@/data/rewards";
import { getQuests } from "@/services/questService";
import { getLocations } from "@/services/locationService";
import { getXpForNextLevel } from "@/lib/xp";
import CharacterCard from "@/components/game/CharacterCard";
import QuestCard from "@/components/game/QuestCard";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Map, Swords, Sparkles, MapPin, CheckCircle2, ChevronRight, HelpCircle, Coins, CalendarCheck, Calendar } from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { audioManager } from "@/lib/audio";
import { hapticsManager } from "@/lib/haptics";
import { useToast } from "@/context/ToastContext";
import type { Quest, Location } from "@/types";

// Daily cultural trivia questions rotated by day of the week
const TRIVIA_QUESTIONS = [
  {
    question: "Alat musik tradisional Jawa Barat yang dimainkan dengan cara digoyang adalah...",
    options: ["Angklung", "Sasando", "Kolintang", "Kecapi"],
    correctIndex: 0,
    explanation: "Angklung adalah alat musik multitonikal yang terbuat dari bambu khas Sunda."
  },
  {
    question: "Rumah adat Honai berasal dari provinsi...",
    options: ["Papua", "Sumatra Barat", "Sulawesi Selatan", "Kalimantan Barat"],
    correctIndex: 0,
    explanation: "Honai adalah rumah khas masyarakat Papua berbentuk lingkaran dengan atap kerucut dari jerami."
  },
  {
    question: "Tari Piring merupakan tari tradisional yang berasal dari daerah...",
    options: ["Minangkabau", "Batak", "Dayak", "Betawi"],
    correctIndex: 0,
    explanation: "Tari Piring berasal dari Solok, Sumatra Barat (kebudayaan Minangkabau)."
  },
  {
    question: "Lagu daerah 'Soleram' berasal dari daerah...",
    options: ["Riau", "Aceh", "Maluku", "Papua"],
    correctIndex: 0,
    explanation: "Soleram adalah lagu pengantar tidur tradisional dari daerah Riau."
  },
  {
    question: "Senjata tradisional khas suku Betawi adalah...",
    options: ["Golok", "Keris", "Rencong", "Kujang"],
    correctIndex: 0,
    explanation: "Golok Betawi adalah senjata tradisional sekaligus perkakas khas masyarakat Betawi."
  },
  {
    question: "Candi Borobudur dibangun pada masa dinasti...",
    options: ["Syailendra", "Sanjaya", "Majapahit", "Singasari"],
    correctIndex: 0,
    explanation: "Candi Borobudur merupakan candi Buddha terbesar di dunia yang dibangun oleh Dinasti Syailendra sekitar abad ke-8."
  },
  {
    question: "Upacara adat pembakaran jenazah di Bali disebut...",
    options: ["Ngaben", "Rambu Solo", "Tedak Siten", "Tiwah"],
    correctIndex: 0,
    explanation: "Ngaben adalah upacara pembakaran jenazah umat Hindu di Bali untuk melepaskan jiwa leluhur."
  }
];

const STREAK_REWARDS = [
  { day: 1, type: "gold", amount: 10, label: "+10 Gold" },
  { day: 2, type: "gold", amount: 20, label: "+20 Gold" },
  { day: 3, type: "gold", amount: 30, label: "+30 Gold" },
  { day: 4, type: "points", amount: 15, label: "+15 Poin" },
  { day: 5, type: "gold", amount: 50, label: "+50 Gold" },
  { day: 6, type: "points", amount: 25, label: "+25 Poin" },
  { day: 7, type: "gold_points", amount: { gold: 100, points: 50 }, label: "+100 Gold & +50 Pts" }
];

export default function HomePage() {
  const { t } = useTranslation();
  const { player, dispatch } = usePlayer();
  const toast = useToast();

  const character = CHARACTERS.find((c) => c.id === player.selectedCharacterId);
  const xpNeeded = getXpForNextLevel(player.level);
  const lang = player.language || "id";

  const [activeQuests, setActiveQuests] = useState<Quest[]>([]);
  const [featuredLocations, setFeaturedLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Daily Trivia state
  const [triviaAnswered, setTriviaAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [triviaError, setTriviaError] = useState(false);
  const [triviaDialogOpen, setTriviaDialogOpen] = useState(false);

  // Daily Login Streak states
  const [streakCount, setStreakCount] = useState(1);
  const [alreadyClaimedToday, setAlreadyClaimedToday] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  // Daily Quests states
  const [quest1Completed, setQuest1Completed] = useState(false);
  const [quest1Claimed, setQuest1Claimed] = useState(false);
  const [quest2Completed, setQuest2Completed] = useState(false);
  const [quest2Claimed, setQuest2Claimed] = useState(false);
  const [quest3Completed, setQuest3Completed] = useState(false);
  const [quest3Claimed, setQuest3Claimed] = useState(false);

  const todayDateStr = new Date().toDateString();

  // Active Badge Tooltip state (click/touch toggle)
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  // Close tooltip when clicking anywhere outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".badge-cell")) {
        setActiveTooltipId(null);
      }
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Get current day's trivia
  const dayIndex = new Date().getDay(); // 0 - 6
  const currentTrivia = TRIVIA_QUESTIONS[dayIndex];

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      getQuests(),
      getLocations()
    ])
      .then(([quests, locs]) => {
        const active = quests.filter((q) => player.activeQuestIds.includes(q.id));
        setActiveQuests(active);
        setFeaturedLocations(locs.slice(0, 3));
      })
      .catch((err) => console.error("Failed to load lobby data:", err))
      .finally(() => setIsLoading(false));
  }, [player.activeQuestIds]);

  // 1. Daily Login Streak Initial Logic
  useEffect(() => {
    const todayStr = new Date().toDateString();
    const lastClaimed = localStorage.getItem("sinopiquest_last_claimed_date");
    const savedStreakStr = localStorage.getItem("sinopiquest_streak_count");
    
    let currentStreak = savedStreakStr ? parseInt(savedStreakStr) : 0;
    
    if (lastClaimed === todayStr) {
      setAlreadyClaimedToday(true);
      setStreakCount(currentStreak || 1);
    } else if (lastClaimed) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();
      
      if (lastClaimed === yesterdayStr) {
        const newStreak = (currentStreak % 7) + 1;
        setStreakCount(newStreak);
        setAlreadyClaimedToday(false);
      } else {
        setStreakCount(1);
        setAlreadyClaimedToday(false);
      }
    } else {
      setStreakCount(1);
      setAlreadyClaimedToday(false);
    }
  }, []);

  // 2. Daily Quests Initial Logic
  useEffect(() => {
    const q1Completed = localStorage.getItem(`sinopiquest_daily_quest_1_completed_${todayDateStr}`) === "true";
    const q1Claimed = localStorage.getItem(`sinopiquest_daily_quest_1_claimed_${todayDateStr}`) === "true";
    setQuest1Completed(q1Completed);
    setQuest1Claimed(q1Claimed);

    const q2Completed = localStorage.getItem(`sinopiquest_daily_quest_2_completed_${todayDateStr}`) === "true";
    const q2Claimed = localStorage.getItem(`sinopiquest_daily_quest_2_claimed_${todayDateStr}`) === "true";
    setQuest2Completed(q2Completed);
    setQuest2Claimed(q2Claimed);

    const q3Completed = localStorage.getItem(`sinopiquest_daily_quest_3_completed_${todayDateStr}`) === "true";
    const q3Claimed = localStorage.getItem(`sinopiquest_daily_quest_3_claimed_${todayDateStr}`) === "true";
    setQuest3Completed(q3Completed);
    setQuest3Claimed(q3Claimed);
  }, [todayDateStr, triviaAnswered]);

  const handleClaimDailyLogin = () => {
    audioManager.playSuccess();
    hapticsManager.triggerSuccess();

    const todayStr = new Date().toDateString();
    localStorage.setItem("sinopiquest_last_claimed_date", todayStr);
    localStorage.setItem("sinopiquest_streak_count", streakCount.toString());
    setAlreadyClaimedToday(true);

    const currentReward = STREAK_REWARDS[streakCount - 1];

    if (currentReward.type === "gold") {
      dispatch({ type: "GAIN_GOLD", amount: currentReward.amount as number });
      toast.success(player.language === "id" ? `Klaim sukses! +${currentReward.amount} Gold didapatkan.` : `Claim success! Earned +${currentReward.amount} Gold.`);
    } else if (currentReward.type === "points") {
      dispatch({ type: "GAIN_POINTS", amount: currentReward.amount as number });
      toast.success(player.language === "id" ? `Klaim sukses! +${currentReward.amount} Poin didapatkan.` : `Claim success! Earned +${currentReward.amount} Points.`);
    } else {
      const rewardAmt = currentReward.amount as { gold: number, points: number };
      dispatch({ type: "GAIN_GOLD", amount: rewardAmt.gold });
      dispatch({ type: "GAIN_POINTS", amount: rewardAmt.points });
      toast.success(
        player.language === "id" 
          ? `Klaim Misi Streak Hari 7! +${rewardAmt.gold} Gold & +${rewardAmt.points} Poin didapatkan!` 
          : `Streak Completed! Earned +${rewardAmt.gold} Gold & +${rewardAmt.points} Points!`
      );
    }
  };

  const handleClaimQuestReward = (questNum: number, reward: { xp: number; gold: number; points: number }) => {
    audioManager.playSuccess();
    hapticsManager.triggerSuccess();

    const today = new Date().toDateString();
    localStorage.setItem(`sinopiquest_daily_quest_${questNum}_claimed_${today}`, "true");

    if (questNum === 1) setQuest1Claimed(true);
    if (questNum === 2) setQuest2Claimed(true);
    if (questNum === 3) setQuest3Claimed(true);

    dispatch({ type: "GAIN_XP", amount: reward.xp });
    dispatch({ type: "GAIN_POINTS", amount: reward.points });
    dispatch({ type: "GAIN_GOLD", amount: reward.gold });

    toast.success(
      player.language === "id" 
        ? `Hadiah Misi ${questNum} diklaim: +${reward.xp} XP, +${reward.gold} Gold, +${reward.points} Poin!`
        : `Claimed Quest ${questNum} rewards: +${reward.xp} XP, +${reward.gold} Gold, +${reward.points} Points!`
    );
  };

  const handleExploreMapClick = () => {
    audioManager.playClick();
    hapticsManager.triggerClick();
    const today = new Date().toDateString();
    localStorage.setItem(`sinopiquest_daily_quest_2_completed_${today}`, "true");
    setQuest2Completed(true);
  };

  useEffect(() => {
    const lastAnswered = localStorage.getItem("sinopiquest_daily_trivia_last_answered");
    const today = new Date().toDateString();
    if (lastAnswered === today) {
      setTriviaAnswered(true);
      setSelectedOption(currentTrivia.correctIndex);
      setShowExplanation(true);
    }
  }, [currentTrivia.correctIndex]);

  const handleAnswerTrivia = (optionIdx: number) => {
    audioManager.playClick();
    hapticsManager.triggerClick();
    setSelectedOption(optionIdx);

    if (optionIdx === currentTrivia.correctIndex) {
      audioManager.playSuccess();
      hapticsManager.triggerSuccess();
      setTriviaError(false);
      setTriviaAnswered(true);
      setShowExplanation(true);

      const today = new Date().toDateString();
      localStorage.setItem("sinopiquest_daily_trivia_last_answered", today);
      localStorage.setItem(`sinopiquest_daily_quest_1_completed_${today}`, "true");
      setQuest1Completed(true);

      dispatch({ type: "GAIN_POINTS", amount: 25 });
      toast.success(player.language === "id" ? "Benar! +25 Poin diraih!" : "Correct! Earned +25 Points!");
    } else {
      audioManager.playError();
      hapticsManager.triggerError();
      setTriviaError(true);
      toast.error(player.language === "id" ? "Jawaban salah, coba lagi!" : "Wrong answer, try again!");
    }
  };

  const completedCount = (quest1Completed ? 1 : 0) + (quest2Completed ? 1 : 0) + (quest3Completed ? 1 : 0);

  if (isLoading) {
    return <LoadingSpinner message={player.language === "id" ? "Memuat beranda..." : "Loading lobby..."} />;
  }


  return (
    <div className="space-y-6 pb-6">
      {/* 1. Header Greeting */}
      <div className="bg-white/40 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100/50 backdrop-blur-sm shadow-sm relative overflow-hidden flex items-center justify-between gap-4">
        {/* Abstract vector shape overlay in background */}
        <div className="absolute right-0 top-0 h-16 w-16 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="space-y-1 relative z-10 flex-1">
          <h1 className="text-xl font-black text-slate-800 leading-tight tracking-tight dark:text-white">
            {t("home.greeting", { name: player.name })}
          </h1>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold leading-normal flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-500 fill-amber-400/20 animate-pulse" />
            <span>{t("app.tagline")}</span>
          </p>
        </div>

        <div className="flex gap-2 flex-shrink-0 relative z-10">
          {/* Floating Daily Check-in Button */}
          <Button
            size="icon"
            onClick={() => {
              audioManager.playClick();
              hapticsManager.triggerClick();
              setLoginDialogOpen(true);
            }}
            className="h-10 w-10 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 flex items-center justify-center relative cursor-pointer z-10 transition-transform active:scale-95 border-0 hover:scale-105"
            title="Klaim Login Harian"
          >
            <CalendarCheck className="h-5.5 w-5.5 text-white" />
            {!alreadyClaimedToday && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border border-white"></span>
              </span>
            )}
          </Button>

          {/* Floating Daily Trivia Icon Button */}
          <Button
            size="icon"
            onClick={() => {
              audioManager.playClick();
              hapticsManager.triggerClick();
              setTriviaDialogOpen(true);
            }}
            className="h-10 w-10 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20 flex items-center justify-center relative cursor-pointer z-10 transition-transform active:scale-95 border-0 hover:scale-105"
            title="Kuis Harian Budaya"
          >
            <HelpCircle className="h-5.5 w-5.5 text-white" />
            {!triviaAnswered && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 border border-white"></span>
              </span>
            )}
          </Button>
        </div>
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
      <div className="grid grid-cols-2 gap-4">
        <Button
          asChild
          className="h-12 text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-xl shadow-md shadow-emerald-500/10 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-0"
        >
          <Link to="/explore" onClick={handleExploreMapClick}>
            <Map className="mr-2 h-4.5 w-4.5 text-white" />
            {t("home.explore_map")}
          </Link>
        </Button>
        <Button
          asChild
          className="h-12 text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl shadow-md shadow-amber-500/10 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-0"
        >
          <Link to="/quests">
            <Swords className="mr-2 h-4.5 w-4.5 text-white" />
            {t("home.view_quests")}
          </Link>
        </Button>
      </div>

      {/* Daily Quests Board (Papan Misi Harian) */}
      <div className="space-y-3.5 pt-1">
        <div className="flex items-center justify-between pl-1">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest dark:text-slate-200">
            📜 Misi Harian Kamu
          </h3>
          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wider">
            {completedCount}/3 Selesai
          </span>
        </div>

        <div className="border border-slate-100 bg-white shadow-md shadow-slate-100/50 rounded-2xl p-4 space-y-3.5">
          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/20">
              <div 
                className="bg-emerald-600 h-full transition-all duration-500 rounded-full"
                style={{ width: `${(completedCount / 3) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {/* Quest 1 */}
            <div className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-b-0 last:pb-0">
              <div className="space-y-0.5 flex-1 min-w-0 pr-3">
                <h4 className={`text-[10px] font-black leading-snug line-clamp-1 ${quest1Completed ? 'text-slate-500 line-through font-semibold' : 'text-slate-800'}`}>
                  1. Selesaikan Kuis Budaya Harian
                </h4>
                <div className="flex items-center gap-1.5 text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <span className="text-emerald-600">+10 XP</span>
                  <span>•</span>
                  <span className="text-yellow-600">+20 Gold</span>
                  <span>•</span>
                  <span className="text-amber-600">+10 Pts</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                {quest1Claimed ? (
                  <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 uppercase tracking-wider">Claimed</span>
                ) : quest1Completed ? (
                  <Button
                    size="sm"
                    onClick={() => handleClaimQuestReward(1, { xp: 10, gold: 20, points: 10 })}
                    className="h-7 px-3 text-[9px] font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-lg border-0 shadow-sm cursor-pointer"
                  >
                    KLAIM
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      audioManager.playClick();
                      hapticsManager.triggerClick();
                      setTriviaDialogOpen(true);
                    }}
                    className="h-7 px-3 text-[9px] font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg border-0 shadow-inner cursor-pointer"
                  >
                    MULAI
                  </Button>
                )}
              </div>
            </div>

            {/* Quest 2 */}
            <div className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-b-0 last:pb-0">
              <div className="space-y-0.5 flex-1 min-w-0 pr-3">
                <h4 className={`text-[10px] font-black leading-snug line-clamp-1 ${quest2Completed ? 'text-slate-500 line-through font-semibold' : 'text-slate-800'}`}>
                  2. Ketuk & Jelajahi Peta Wisata
                </h4>
                <div className="flex items-center gap-1.5 text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <span className="text-emerald-600">+10 XP</span>
                  <span>•</span>
                  <span className="text-yellow-600">+10 Gold</span>
                  <span>•</span>
                  <span className="text-amber-600">+5 Pts</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                {quest2Claimed ? (
                  <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 uppercase tracking-wider">Claimed</span>
                ) : quest2Completed ? (
                  <Button
                    size="sm"
                    onClick={() => handleClaimQuestReward(2, { xp: 10, gold: 10, points: 5 })}
                    className="h-7 px-3 text-[9px] font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-lg border-0 shadow-sm cursor-pointer"
                  >
                    KLAIM
                  </Button>
                ) : (
                  <Button
                    asChild
                    size="sm"
                    className="h-7 px-3 text-[9px] font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg border-0 shadow-inner cursor-pointer"
                  >
                    <Link to="/explore" onClick={handleExploreMapClick}>
                      MULAI
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Quest 3 */}
            <div className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-b-0 last:pb-0">
              <div className="space-y-0.5 flex-1 min-w-0 pr-3">
                <h4 className={`text-[10px] font-black leading-snug line-clamp-1 ${quest3Completed ? 'text-slate-500 line-through font-semibold' : 'text-slate-800'}`}>
                  3. Periksa Peringkat di Papan Skor
                </h4>
                <div className="flex items-center gap-1.5 text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <span className="text-emerald-600">+15 XP</span>
                  <span>•</span>
                  <span className="text-yellow-600">+15 Gold</span>
                  <span>•</span>
                  <span className="text-amber-600">+10 Pts</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                {quest3Claimed ? (
                  <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 uppercase tracking-wider">Claimed</span>
                ) : quest3Completed ? (
                  <Button
                    size="sm"
                    onClick={() => handleClaimQuestReward(3, { xp: 15, gold: 15, points: 10 })}
                    className="h-7 px-3 text-[9px] font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-lg border-0 shadow-sm cursor-pointer"
                  >
                    KLAIM
                  </Button>
                ) : (
                  <Button
                    asChild
                    size="sm"
                    className="h-7 px-3 text-[9px] font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg border-0 shadow-inner cursor-pointer"
                  >
                    <Link to="/leaderboard">
                      MULAI
                    </Link>
                  </Button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>



      {/* 4. Active Quests Section */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest pl-1 dark:text-slate-200">
          ⚔️ {t("home.active_quests")}
        </h3>

        {activeQuests.length > 0 ? (
          <div className="flex flex-col gap-4">
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
          <div className="rounded-2xl border border-dashed border-slate-200 bg-gradient-to-b from-slate-50/50 to-slate-100/30 p-8 text-center shadow-inner relative overflow-hidden">
            {/* Decorative faint background element */}
            <div className="absolute -right-6 -bottom-6 text-6xl opacity-[0.03] pointer-events-none select-none font-extrabold">⚔️</div>
            
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3.5 shadow-sm">
              <Map className="h-5.5 w-5.5 text-emerald-600" />
            </div>
            <h4 className="text-xs font-bold text-slate-700 leading-snug dark:text-slate-300">Lembaran Misi Kosong</h4>
            <p className="text-[10px] text-muted-foreground max-w-[200px] mx-auto mt-1 mb-4 leading-normal font-medium">
              {t("home.no_active_quests")}
            </p>
            <Button asChild size="sm" className="h-8 px-4 text-[10px] font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-sm cursor-pointer transition-transform hover:scale-105 active:scale-95 border-0">
              <Link to="/quests">
                <Swords className="mr-1 h-3.5 w-3.5" />
                Cari Misi Baru
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* 5. Featured Locations Section */}
      {featuredLocations.length > 0 && (
        <div className="space-y-3.5 pt-1">
          <div className="flex items-center justify-between pl-1">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest dark:text-slate-200">
              📍 Destinasi Rekomendasi
            </h3>
            <Link to="/explore" className="text-[10px] font-extrabold text-emerald-600 hover:text-emerald-700 flex items-center tracking-wider uppercase">
              Lihat Semua
              <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            {featuredLocations.map((loc) => (
              <div 
                key={loc.id}
                className="overflow-hidden border border-slate-100 bg-white w-[215px] flex-shrink-0 shadow-md shadow-slate-100/80 rounded-2xl hover:shadow-lg transition-all active:scale-[0.98] duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-24 w-full bg-slate-100 overflow-hidden">
                    {loc.imageUrl ? (
                      <img src={loc.imageUrl} alt={loc.name[lang]} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-2xl bg-slate-200">🏝️</div>
                    )}
                    <span className={`absolute bottom-2 left-2 text-[8px] font-black px-2 py-0.5 rounded-full border shadow-sm backdrop-blur-sm uppercase tracking-widest ${
                      loc.category === "wisata_sejarah" ? "bg-violet-50 text-violet-700 border-violet-100/80" :
                      loc.category === "wisata_budaya" ? "bg-sky-50 text-sky-700 border-sky-100/80" :
                      loc.category === "wisata_kuliner" ? "bg-amber-50 text-amber-700 border-amber-100/80" :
                      "bg-emerald-50 text-emerald-700 border-emerald-100/80"
                    }`}>
                      {loc.category.replace("wisata_", "").replace("eko", "eco")}
                    </span>
                  </div>
                  <div className="px-3 pt-3 pb-1.5 space-y-1">
                    <h4 className="text-[11px] font-black text-slate-800 leading-snug line-clamp-1">{loc.name[lang]}</h4>
                    <p className="text-[9px] text-slate-400 font-semibold line-clamp-2 leading-relaxed h-[28px] overflow-hidden">{loc.address?.id || loc.address?.en || "Indonesia"}</p>
                  </div>
                </div>
                <div className="p-3 pt-0">
                  <Button 
                    asChild
                    size="sm"
                    className="h-8 w-full text-[9px] font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl border-0 shadow-sm shadow-emerald-500/10 cursor-pointer transition-colors active:scale-95"
                  >
                    <Link to={`/explore?locationId=${loc.id}`}>
                      <MapPin className="h-3 w-3 mr-1" />
                      JELAJAHI PETA
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Trophy Cabinet (RPG Lencana Cabinet) */}
      <div className="space-y-3.5 pt-1">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest pl-1 dark:text-slate-200">
          🏆 Lemari Lencana Kamu
        </h3>

        <div className="border border-slate-100 bg-white shadow-md shadow-slate-100/50 rounded-2xl p-4">
          <div className="p-0">
            <div className="grid grid-cols-4 gap-4">
              {REWARDS.filter((r) => r.type === "badge").map((badge) => {
                const isUnlocked = player.obtainedBadgeIds.includes(badge.id);
                return (
                  <div 
                    key={badge.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      audioManager.playClick();
                      hapticsManager.triggerClick();
                      setActiveTooltipId(prev => prev === badge.id ? null : badge.id);
                    }}
                    className="badge-cell flex flex-col items-center justify-center space-y-1.5 cursor-pointer relative group active:scale-95 transition-transform"
                  >
                    {/* Badge Slot */}
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center border shadow-inner relative transition-transform duration-300 group-hover:scale-105 ${
                      isUnlocked 
                        ? "bg-gradient-to-br from-amber-500/10 to-yellow-500/20 border-amber-300 shadow-amber-100/30" 
                        : "bg-slate-50 border-slate-200 shadow-slate-100/10"
                    }`}>
                      {badge.imageUrl ? (
                        <img 
                          src={badge.imageUrl} 
                          alt={badge.name[lang]} 
                          className={`h-9 w-9 object-cover rounded-full ${isUnlocked ? "" : "grayscale opacity-25"}`} 
                        />
                      ) : (
                        <span className={`text-base ${isUnlocked ? "" : "grayscale opacity-30"}`}>🥇</span>
                      )}

                      {/* Lock overlay for locked badges */}
                      {!isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-full">
                          <span className="text-[8px]">🔒</span>
                        </div>
                      )}
                    </div>

                    {/* Badge mini title */}
                    <span className={`text-[8px] font-black text-center truncate w-full tracking-tighter ${
                      isUnlocked ? "text-slate-700 dark:text-slate-200" : "text-slate-400 font-semibold"
                    }`}>
                      {badge.name[lang]}
                    </span>

                    {/* Clickable Inline Tooltip Description */}
                    {activeTooltipId === badge.id && (
                      <div className="absolute bottom-[110%] mb-1 w-44 p-2.5 bg-slate-900 text-white text-[8px] rounded-xl border border-slate-800 shadow-xl backdrop-blur-md z-[60] text-center pointer-events-none transition-all animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <p className="font-extrabold text-amber-400 uppercase tracking-wider">{badge.name[lang]}</p>
                        <p className="mt-0.5 leading-normal opacity-90">{badge.description[lang]}</p>
                        <p className="mt-1 font-bold text-[7px] text-emerald-400 uppercase">
                          {isUnlocked ? "STATUS: Telah Diraih" : "STATUS: Terkunci"}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Cultural Trivia Dialog Popup */}
      <Dialog open={triviaDialogOpen} onOpenChange={setTriviaDialogOpen}>
        <DialogContent className="max-w-[340px] rounded-2xl border-rose-100 bg-gradient-to-br from-white to-rose-50/20 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-rose-100/50 pb-2">
            <DialogTitle className="text-sm font-black text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="h-4.5 w-4.5 text-rose-500 fill-rose-50" />
              Kuis Harian Budaya
            </DialogTitle>
            <span className="text-[9px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 uppercase tracking-wider flex items-center gap-0.5">
              <Coins className="h-3 w-3 animate-bounce" />
              +25 POIN
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-bold text-slate-700 leading-relaxed">
              {currentTrivia.question}
            </p>

            <div className="grid grid-cols-1 gap-2">
              {currentTrivia.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentTrivia.correctIndex;
                let btnStyle = "border-slate-200 bg-white text-slate-600 hover:bg-slate-50";

                if (isSelected) {
                  if (isCorrect) {
                    btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-800 font-extrabold shadow-sm shadow-emerald-100";
                  } else if (triviaError) {
                    btnStyle = "border-red-500 bg-red-50/50 text-red-800 font-extrabold shadow-sm shadow-red-100";
                  }
                } else if (triviaAnswered && isCorrect) {
                  btnStyle = "border-emerald-500 bg-emerald-50/50 text-emerald-800 font-extrabold";
                }

                return (
                  <Button
                    key={idx}
                    disabled={triviaAnswered}
                    variant="outline"
                    onClick={() => handleAnswerTrivia(idx)}
                    className={`h-9 px-3 text-[10px] rounded-lg justify-start text-left truncate leading-tight font-medium ${btnStyle} cursor-pointer transition-all duration-200 active:scale-95`}
                  >
                    <span className="mr-1.5 text-[9px] font-bold opacity-60">{["A", "B", "C", "D"][idx]}.</span>
                    <span className="truncate">{option}</span>
                  </Button>
                );
              })}
            </div>

            {showExplanation && (
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5 space-y-1 mt-1">
                <span className="text-[8px] font-black text-emerald-700 uppercase tracking-widest block flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Trivia Terpecahkan
                </span>
                <p className="text-[10px] text-slate-500 leading-normal font-medium">
                  {currentTrivia.explanation}
                </p>
              </div>
            )}

            {triviaAnswered && (
              <div className="pt-2 flex justify-end">
                <Button
                  size="sm"
                  onClick={() => setTriviaDialogOpen(false)}
                  className="h-8 px-4 text-[10px] font-extrabold bg-rose-600 hover:bg-rose-700 text-white rounded-full border-0 cursor-pointer"
                >
                  Tutup Kuis
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Daily Login Streak Dialog Popup */}
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent className="max-w-[340px] rounded-2xl border-slate-100 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <DialogTitle className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-4.5 w-4.5 text-amber-500" />
              Login Harian (Streak)
            </DialogTitle>
            <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wider">
              Streak: {alreadyClaimedToday ? streakCount : streakCount - 1}/7 Hari
            </span>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] text-slate-500 leading-normal text-center font-medium">
              Masuk setiap hari berturut-turut untuk meraih poin dan gold melimpah!
            </p>

            {/* 7 Day Grid */}
            <div className="grid grid-cols-4 gap-2.5">
              {STREAK_REWARDS.map((reward) => {
                const dayNum = reward.day;
                const isClaimed = alreadyClaimedToday ? dayNum <= streakCount : dayNum < streakCount;
                const isCurrent = dayNum === streakCount && !alreadyClaimedToday;
                
                let boxStyle = "bg-slate-50 border-slate-200 text-slate-400";
                if (isClaimed) {
                  boxStyle = "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm shadow-emerald-50";
                } else if (isCurrent) {
                  boxStyle = "bg-amber-50 border-amber-300 text-amber-700 animate-pulse shadow-sm shadow-amber-50";
                }

                return (
                  <div 
                    key={dayNum}
                    className={`border rounded-xl p-2 flex flex-col items-center justify-center space-y-1 relative ${boxStyle}`}
                  >
                    <span className="text-[8px] font-black uppercase tracking-wider">Hari {dayNum}</span>
                    <span className="text-sm">{reward.type === "gold" ? "🪙" : reward.type === "points" ? "🏆" : "🎁"}</span>
                    <span className="text-[7px] font-black text-center line-clamp-1 w-full leading-none">{reward.label}</span>
                    {isClaimed && (
                      <span className="absolute -top-1 -right-1 text-[8px] bg-emerald-500 text-white rounded-full h-3 w-3 flex items-center justify-center font-bold">✓</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Claim button or already claimed banner */}
            <div className="pt-2">
              {alreadyClaimedToday ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-slate-500 font-bold leading-normal flex items-center justify-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Hadiah hari ini telah diklaim. Kembali lagi besok!
                  </p>
                </div>
              ) : (
                <Button
                  onClick={handleClaimDailyLogin}
                  className="h-10 w-full text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl border-0 shadow-md shadow-amber-500/10 cursor-pointer transition-transform active:scale-95 hover:scale-[1.02]"
                >
                  Klaim Hadiah Hari {streakCount}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
