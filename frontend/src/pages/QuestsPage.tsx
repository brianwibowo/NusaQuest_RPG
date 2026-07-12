import { useState, useEffect } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { getQuests } from "@/services/questService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuestCard from "@/components/game/QuestCard";
import { useTranslation } from "react-i18next";
import { useSearchParams, Link } from "react-router-dom";
import type { Quest } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function QuestsPage() {
  const { t } = useTranslation();
  const { player } = usePlayer();
  const lang = player.language || "id";

  const [quests, setQuests] = useState<Quest[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const locationId = searchParams.get("locationId");

  useEffect(() => {
    setIsLoading(true);
    getQuests()
      .then(setQuests)
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  // Tab configuration
  const tabs = [
    { value: "all", label: t("quest.all") },
    { value: "main", label: t("story.category.sejarah").toUpperCase() },
    { value: "cultural", label: t("story.category.budaya").toUpperCase() },
    { value: "culinary", label: t("story.category.kuliner").toUpperCase() },
    { value: "eco", label: t("story.category.lingkungan").toUpperCase() },
  ];

  // Prioritize active, available, locked, and completed quests in that order
  const getSortedFilteredQuests = () => {
    let list = quests;
    if (locationId) {
      list = list.filter((q) => q.locationId === locationId);
    }

    const filtered = activeTab === "all"
      ? list
      : list.filter((q) => {
          if (activeTab === "main") return q.type === "main" || q.type === "historical";
          return q.type === activeTab;
        });

    const getStatusWeight = (q: Quest) => {
      const isCompleted = player.completedQuestIds.includes(q.id);
      const isActive = player.activeQuestIds.includes(q.id);
      const isLocked = player.level < q.requiredLevel;

      if (isActive) return 0;
      if (isLocked) return 2;
      if (isCompleted) return 3;
      return 1; // available
    };

    return [...filtered].sort((a, b) => {
      const weightA = getStatusWeight(a);
      const weightB = getStatusWeight(b);
      if (weightA !== weightB) return weightA - weightB;
      // tie-breaker: requiredLevel ascending
      return a.requiredLevel - b.requiredLevel;
    });
  };

  const filteredQuests = getSortedFilteredQuests();

  if (isLoading) {
    return <LoadingSpinner message={player.language === "id" ? "Memuat petualangan misi..." : "Loading adventure quests..."} />;
  }

  return (
    <div className="space-y-4">
      {/* 1. Header Title */}
      <div className="space-y-0.5">
        <h1 className="text-xl font-bold text-slate-800 leading-snug">{t("quest.title")}</h1>
        <p className="text-xs text-muted-foreground font-semibold leading-normal">
          {t("quest.subtitle")}
        </p>
      </div>

      {locationId && (
        <div className="flex items-center justify-between p-2.5 bg-emerald-50/70 border border-emerald-100/50 rounded-xl text-[10px] text-emerald-800 font-bold">
          <span>Menampilkan misi untuk lokasi terpilih</span>
          <Link to="/quests" className="text-emerald-600 hover:text-emerald-700 underline font-extrabold">
            Lihat Semua Misi
          </Link>
        </div>
      )}

      {/* 2. Tabs */}
      <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 h-8 bg-slate-100/80 p-0.5 rounded-lg">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-[10px] font-bold py-1 px-1.5 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm rounded-md transition-all"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            {filteredQuests.length > 0 ? (
              <div className="grid grid-cols-1 gap-3.5">
                {filteredQuests.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    playerLevel={player.level}
                    lang={lang}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                <span className="text-2xl block mb-1">⚔️</span>
                <p className="text-xs text-muted-foreground font-bold leading-normal">
                  No Quests Available
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
