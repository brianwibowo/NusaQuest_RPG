import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { usePlayer } from "@/context/PlayerContext";
import { getQuestById } from "@/services/questService";
import { getStories } from "@/services/storyService";
import { REWARDS } from "@/data/rewards";
import { useTranslation } from "react-i18next";
import { type Quest, type Story, type QuestObjective } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { getQuestTypeColor, getQuestTypeLabel } from "@/lib/quest";
import BattleQuiz from "@/components/game/BattleQuiz";
import { getLevelDefinition } from "@/lib/xp";
import { calculateDistance } from "@/lib/geo";
import { useGeolocation } from "@/hooks/useGeolocation";
import { audioManager } from "@/lib/audio";
import { hapticsManager } from "@/lib/haptics";
import { useToast } from "@/context/ToastContext";
import { ArrowLeft, Clock, Award, Trophy, Play, ShieldAlert, MapPin, CheckCircle, Navigation, Camera, Store, Coins, BookOpen } from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function QuestDetailPage() {
  const { t } = useTranslation();
  const { questId } = useParams<{ questId: string }>();
  const { player, dispatch } = usePlayer();
  const toast = useToast();
  const lang = player.language || "id";

  const [quest, setQuest] = useState<Quest | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [battleActive, setBattleActive] = useState(false);
  const [showLevelUpDialog, setShowLevelUpDialog] = useState(false);
  const [justLeveledUpTo, setJustLeveledUpTo] = useState<number | null>(null);

  // Real-time Geolocation hook
  const geo = useGeolocation();
  // State for testing/simulating being at the destination
  const [isSimulated, setIsSimulated] = useState(false);
  const [distanceInfo, setDistanceInfo] = useState<string | null>(null);

  // Interactive objective states
  const [savedPhotos, setSavedPhotos] = useState<Record<string, string>>({});
  const [activeReviewObjId, setActiveReviewObjId] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    if (!questId) return;
    setIsLoading(true);
    Promise.all([
      getQuestById(questId),
      getStories()
    ])
      .then(([qData, sData]) => {
        // Load saved objective progress from localStorage
        let savedCompletedIds: string[] = [];
        try {
          const saved = localStorage.getItem("sinopiquest_completed_objectives");
          if (saved) {
            savedCompletedIds = JSON.parse(saved);
          }
        } catch (e) {
          console.error("Failed to load objectives from localStorage", e);
        }

        // Merge saved completed objectives
        if (qData && qData.objectives) {
          qData.objectives = qData.objectives.map((obj: any) => ({
            ...obj,
            completed: obj.completed || savedCompletedIds.includes(obj.id),
          }));
        }

        setQuest(qData);
        setStories(sData);
      })
      .catch((err) => console.error("Quest detail load failed", err))
      .finally(() => setIsLoading(false));
  }, [questId]);

  useEffect(() => {
    const loadedPhotos: Record<string, string> = {};
    if (quest && quest.objectives) {
      quest.objectives.forEach((obj) => {
        if (obj.type === "take_photo") {
          const photo = localStorage.getItem(`sinopiquest_photo_${obj.id}`);
          if (photo) {
            loadedPhotos[obj.id] = photo;
          }
        }
      });
      setSavedPhotos(loadedPhotos);
    }
  }, [quest]);

  if (isLoading) {
    return <LoadingSpinner message={player.language === "id" ? "Memuat detail misi..." : "Loading quest details..."} />;
  }

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
  const battle = quest.battle;

  // 1. Start Quest
  const handleStartQuest = () => {
    audioManager.playClick();
    hapticsManager.triggerClick();
    dispatch({ type: "START_QUEST", questId: quest.id });
  };

  // 2. Complete objective locally and check overall quest completion
  const handleCompleteObjective = (objId: string, isChecked: boolean) => {
    if (!quest || !isActive || isCompleted) return;

    // Persist to localStorage
    try {
      const saved = localStorage.getItem("sinopiquest_completed_objectives");
      let completedIds: string[] = saved ? JSON.parse(saved) : [];
      if (isChecked) {
        if (!completedIds.includes(objId)) {
          completedIds.push(objId);
        }
      } else {
        completedIds = completedIds.filter(id => id !== objId);
      }
      localStorage.setItem("sinopiquest_completed_objectives", JSON.stringify(completedIds));
    } catch (e) {
      console.error("Failed to save objective progress", e);
    }

    const updatedObjectives = quest.objectives.map((obj: QuestObjective) =>
      obj.id === objId ? { ...obj, completed: isChecked } : obj
    );

    const updatedQuest = { ...quest, objectives: updatedObjectives };
    setQuest(updatedQuest);

    // If all objectives are now completed, automatically trigger quest completion
    const allDone = updatedObjectives.every((obj: QuestObjective) => obj.completed);
    if (allDone) {
      handleCompleteQuest();

      // Clean up localStorage for objectives of this completed quest
      try {
        const saved = localStorage.getItem("sinopiquest_completed_objectives");
        if (saved) {
          let completedIds: string[] = JSON.parse(saved);
          completedIds = completedIds.filter(id => !quest.objectives.some(o => o.id === id));
          localStorage.setItem("sinopiquest_completed_objectives", JSON.stringify(completedIds));
        }
      } catch (e) {
        console.error("Failed to clean completed objectives from localStorage", e);
      }
    }
  };

  // GPS check-in validator
  const handleCheckGpsLocation = (objId: string) => {
    audioManager.playClick();
    hapticsManager.triggerClick();

    const destination = quest.location;
    if (!destination) return;

    let userLat = geo.coordinates?.lat || 0;
    let userLng = geo.coordinates?.lng || 0;

    // Use mock coordinates if simulation is turned on
    if (isSimulated) {
      userLat = destination.latitude;
      userLng = destination.longitude;
    }

    if (!isSimulated && (!geo.coordinates || !geo.loaded)) {
      alert(player.language === "id" 
        ? "Mendapatkan lokasi GPS Anda... Pastikan izin lokasi aktif." 
        : "Fetching your GPS location... Please ensure location permissions are enabled."
      );
      return;
    }

    const distanceMeters = calculateDistance(
      userLat,
      userLng,
      destination.latitude,
      destination.longitude
    );

    if (distanceMeters <= 100) {
      // Success check-in!
      audioManager.playSuccess();
      hapticsManager.triggerSuccess();
      handleCompleteObjective(objId, true);
      setDistanceInfo(player.language === "id" 
        ? "Check-in berhasil! Anda berada di lokasi destinasi." 
        : "Check-in successful! You are at the destination."
      );
    } else {
      audioManager.playError();
      hapticsManager.triggerError();
      const distanceKm = (distanceMeters / 1000).toFixed(2);
      setDistanceInfo(player.language === "id"
        ? `Jarak Anda ${distanceKm} km dari lokasi. Silakan mendekat (<100m) untuk check-in!`
        : `You are ${distanceKm} km away. Please move closer (<100m) to check-in!`
      );
    }
  };

  // Objective Photo capture handler
  const handleTakePhoto = (objId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      try {
        localStorage.setItem(`sinopiquest_photo_${objId}`, base64String);
        setSavedPhotos(prev => ({ ...prev, [objId]: base64String }));
        audioManager.playSuccess();
        hapticsManager.triggerSuccess();
        handleCompleteObjective(objId, true);
        toast.success(player.language === "id" ? "Foto berhasil disimpan!" : "Photo captured successfully!");
      } catch (err) {
        console.error("Failed to save photo to localStorage", err);
        // Fallback: complete anyway
        handleCompleteObjective(objId, true);
      }
    };
    reader.readAsDataURL(file);
  };

  // Simulated purchase handler
  const handleSimulatePurchase = (objId: string) => {
    audioManager.playSuccess();
    hapticsManager.triggerSuccess();
    handleCompleteObjective(objId, true);
    toast.success(player.language === "id" ? "Pembelian produk berhasil disimulasikan!" : "Product purchase simulation successful!");
  };

  // Submit text review handler
  const handleSubmitReview = (objId: string) => {
    if (!reviewText.trim()) return;
    audioManager.playSuccess();
    hapticsManager.triggerSuccess();
    handleCompleteObjective(objId, true);
    toast.success(player.language === "id" ? "Ulasan berhasil dikirim!" : "Review submitted successfully!");
    setReviewText("");
    setActiveReviewObjId(null);
  };

  // 3. Complete Quest & Claim Rewards
  const handleCompleteQuest = () => {
    // Check for level up beforehand
    const nextLevelDef = getLevelDefinition(player.level + 1);
    const rewardXp = quest.reward?.xp || 0;
    const rewardPoints = quest.reward?.points || 0;
    const willLevelUp = player.currentXp + rewardXp >= nextLevelDef.requiredXp && player.level < 6;

    dispatch({ type: "COMPLETE_QUEST", questId: quest.id });

    // Clean up photos from localStorage to prevent storage bloat
    quest.objectives.forEach((obj) => {
      if (obj.type === "take_photo") {
        localStorage.removeItem(`sinopiquest_photo_${obj.id}`);
      }
    });
    dispatch({ type: "GAIN_XP", amount: rewardXp });
    dispatch({ type: "GAIN_POINTS", amount: rewardPoints });

    // Unlock story if applicable
    if (quest.reward?.storyUnlockId) {
      dispatch({ type: "UNLOCK_STORY", storyId: quest.reward.storyUnlockId });
    }

    // Award badge if applicable
    if (quest.reward?.badgeId) {
      dispatch({ type: "OBTAIN_BADGE", badgeId: quest.reward.badgeId });
      dispatch({ type: "OBTAIN_REWARD", rewardId: quest.reward.badgeId });
    }

    // Award voucher if applicable
    if (quest.reward?.voucherId) {
      dispatch({ type: "OBTAIN_REWARD", rewardId: quest.reward.voucherId });
    }

    // Award collectible if applicable
    if (quest.reward?.collectibleId) {
      dispatch({ type: "OBTAIN_REWARD", rewardId: quest.reward.collectibleId });
    }

    // Trigger Success Audio & Visual celebration (Confetti!)
    import("canvas-confetti").then((module) => {
      const confetti = module.default;
      
      if (willLevelUp) {
        // Grand Level-up Celebration Confetti
        audioManager.playLevelUp();
        hapticsManager.triggerLevelUp();
        
        // Multi-burst confetti
        const duration = 2.5 * 1000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.8 },
            colors: ["#10b981", "#fbbf24", "#3b82f6"]
          });
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.8 },
            colors: ["#10b981", "#fbbf24", "#3b82f6"]
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
      } else {
        // Standard Quest Completed Confetti (single burst)
        audioManager.playSuccess();
        hapticsManager.triggerSuccess();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.7 },
          colors: ["#10b981", "#fbbf24"]
        });
      }
    });

    if (willLevelUp) {
      setJustLeveledUpTo(player.level + 1);
      setShowLevelUpDialog(true);
    }
  };

  // 4. Battle finish trigger callback
  const handleBattleFinish = (_score: number, passed: boolean) => {
    setBattleActive(false);
    if (passed && quest) {
      // Find the objective that requires answer_quiz
      const quizObjective = quest.objectives.find((obj: QuestObjective) => obj.type === "answer_quiz");
      if (quizObjective) {
        handleCompleteObjective(quizObjective.id, true);
      }
    }
  };

  // Get rewards details to display
  const rewardBadge = REWARDS.find((r) => r.id === quest.reward?.badgeId);
  const rewardVoucher = REWARDS.find((r) => r.id === quest.reward?.voucherId);
  const rewardCollectible = REWARDS.find((r) => r.id === quest.reward?.collectibleId);
  const unlockedStory = stories.find((s) => s.id === quest.reward?.storyUnlockId);

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
              {quest.objectives.map((obj: QuestObjective) => {
                const isVisitLocation = obj.type === "visit_location";
                const isInteractiveAction = obj.type === "answer_quiz" || obj.type === "visit_location" || obj.type === "take_photo" || obj.type === "buy_product" || obj.type === "write_review";
                return (
                  <div key={obj.id} className="flex items-start gap-3 p-2.5 bg-slate-50/50 rounded-lg border border-slate-100">
                    <Checkbox
                      id={obj.id}
                      checked={isCompleted || obj.completed}
                      disabled={isCompleted || !isActive || isInteractiveAction}
                      onCheckedChange={(checked: boolean | "indeterminate") => handleCompleteObjective(obj.id, !!checked)}
                      className="mt-0.5 border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <div className="flex-1 space-y-1">
                      <label
                        htmlFor={obj.id}
                        className={`text-xs font-semibold text-slate-700 leading-snug select-none ${
                          (isCompleted || obj.completed) ? "line-through text-slate-400 font-medium" : ""
                        }`}
                      >
                        {obj.description[lang]}
                      </label>

                      {/* GPS Check-in Action Button */}
                      {isVisitLocation && !obj.completed && !isCompleted && isActive && (
                        <div className="pt-1.5 flex flex-wrap gap-2 items-center">
                          <Button
                            size="sm"
                            onClick={() => handleCheckGpsLocation(obj.id)}
                            className="h-7 px-3 text-[9px] font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white flex gap-1 items-center rounded-full tracking-wider cursor-pointer"
                          >
                            <MapPin className="h-3 w-3" />
                            <span>CEK LOKASI GPS</span>
                          </Button>
                        </div>
                      )}

                      {isVisitLocation && (isCompleted || obj.completed) && (
                        <div className="pt-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider">
                            <CheckCircle className="h-2.5 w-2.5" />
                            Berhasil Check-in
                          </span>
                        </div>
                      )}

                      {/* Quiz/Battle action button */}
                      {obj.type === "answer_quiz" && !obj.completed && !isCompleted && isActive && battle && (
                        <div className="pt-1.5">
                          <Button
                            size="sm"
                            onClick={() => setBattleActive(true)}
                            className="h-7 px-3 text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-white flex gap-1 items-center rounded-full cursor-pointer"
                          >
                            <Play className="h-3 w-3 fill-white" />
                            <span>{t("battle.title")} ({battle.title[lang]})</span>
                          </Button>
                        </div>
                      )}

                      {/* Interactive Camera Objective Uploader */}
                      {obj.type === "take_photo" && !obj.completed && !isCompleted && isActive && (
                        <div className="pt-1.5">
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            id={`photo-input-${obj.id}`}
                            className="hidden"
                            onChange={(e) => handleTakePhoto(obj.id, e)}
                          />
                          <label
                            htmlFor={`photo-input-${obj.id}`}
                            className="inline-flex h-7 px-3 text-[9px] font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white gap-1 items-center rounded-full tracking-wider cursor-pointer select-none"
                          >
                            <Camera className="h-3 w-3 mr-1" />
                            <span>AMBIL FOTO</span>
                          </label>
                        </div>
                      )}

                      {obj.type === "take_photo" && (obj.completed || isCompleted) && (
                        <div className="pt-1.5 space-y-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider">
                            <CheckCircle className="h-2.5 w-2.5" />
                            Foto Berhasil Diambil
                          </span>
                          {savedPhotos[obj.id] && (
                            <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-slate-200 shadow-sm mt-1">
                              <img src={savedPhotos[obj.id]} alt="Captured objective" className="h-full w-full object-cover" />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Interactive Shop Purchase Simulation */}
                      {obj.type === "buy_product" && !obj.completed && !isCompleted && isActive && (
                        <div className="pt-1.5 flex flex-wrap gap-2">
                          {quest.relatedUmkmId && (
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="h-7 px-3 text-[9px] font-extrabold border-slate-200 text-slate-600 bg-white rounded-full tracking-wider"
                            >
                              <Link to={`/umkm/${quest.relatedUmkmId}`}>
                                <Store className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                                KUNJUNGI TOKO
                              </Link>
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => handleSimulatePurchase(obj.id)}
                            className="h-7 px-3 text-[9px] font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-full tracking-wider cursor-pointer"
                          >
                            <Coins className="h-3 w-3 mr-1 text-yellow-300" />
                            SIMULASI BELI
                          </Button>
                        </div>
                      )}

                      {obj.type === "buy_product" && (obj.completed || isCompleted) && (
                        <div className="pt-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider">
                            <CheckCircle className="h-2.5 w-2.5" />
                            Produk Dibeli
                          </span>
                        </div>
                      )}

                      {/* Interactive Review Form */}
                      {obj.type === "write_review" && !obj.completed && !isCompleted && isActive && (
                        <div className="pt-1.5 space-y-2">
                          {activeReviewObjId === obj.id ? (
                            <div className="space-y-2 bg-slate-100/80 p-2.5 rounded-lg border border-slate-200/50">
                              <textarea
                                placeholder={player.language === "id" ? "Tulis ulasan Anda di sini..." : "Write your review here..."}
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                className="w-full text-xs p-2 rounded border border-slate-300 bg-white focus:outline-emerald-500 min-h-[60px]"
                              />
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setActiveReviewObjId(null);
                                    setReviewText("");
                                  }}
                                  className="h-6 text-[9px] text-slate-500 font-bold"
                                >
                                  Batal
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleSubmitReview(obj.id)}
                                  disabled={!reviewText.trim()}
                                  className="h-6 px-2.5 text-[9px] bg-emerald-600 hover:bg-emerald-700 text-white font-black"
                                >
                                  Kirim Ulasan
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => {
                                audioManager.playClick();
                                hapticsManager.triggerClick();
                                setActiveReviewObjId(obj.id);
                              }}
                              className="h-7 px-3 text-[9px] font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-full tracking-wider cursor-pointer"
                            >
                              <BookOpen className="h-3.5 w-3.5 mr-1" />
                              TULIS ULASAN
                            </Button>
                          )}
                        </div>
                      )}

                      {obj.type === "write_review" && (obj.completed || isCompleted) && (
                        <div className="pt-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider">
                            <CheckCircle className="h-2.5 w-2.5" />
                            Ulasan Dikirim
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* GPS Feedback & Simulation Tool (Only shown when active and has visit objectives) */}
            {isActive && !isCompleted && quest.objectives.some((o: QuestObjective) => o.type === "visit_location") && (
              <div className="pt-3 mt-2 border-t border-slate-100 space-y-2">
                {distanceInfo && (
                  <p className="text-[10px] font-bold text-emerald-700 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100/50">
                    ℹ️ {distanceInfo}
                  </p>
                )}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 border border-slate-200">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block">🔧 Alat Pengujian (Testing Tool)</span>
                    <span className="text-[10px] text-slate-700 font-bold block">Simulasi Posisi GPS di Destinasi</span>
                  </div>
                  <Button
                    size="sm"
                    variant={isSimulated ? "default" : "outline"}
                    onClick={() => {
                      audioManager.playClick();
                      hapticsManager.triggerClick();
                      setIsSimulated(!isSimulated);
                      setDistanceInfo(null);
                    }}
                    className={`h-7 px-2.5 text-[9px] font-extrabold rounded-full tracking-wider cursor-pointer ${
                      isSimulated ? "bg-amber-500 hover:bg-amber-600 text-white border-0" : "text-slate-600 border-slate-300 bg-white"
                    }`}
                  >
                    <Navigation className={`h-3 w-3 mr-1 ${isSimulated ? "animate-pulse" : ""}`} />
                    {isSimulated ? "SIMULASI AKTIF" : "AKTIFKAN SIMULASI"}
                  </Button>
                </div>
              </div>
            )}
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
