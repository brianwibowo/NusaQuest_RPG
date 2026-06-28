import { useState, useEffect } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { getQuests } from "@/services/questService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuestCard from "@/components/game/QuestCard";
import { useTranslation } from "react-i18next";
import type { Quest } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function QuestsPage() {
  const { t } = useTranslation();
  const { player } = usePlayer();
  const lang = player.language || "id";

  const [quests, setQuests] = useState<Quest[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

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

  // Prioritize eco-quests for the default list, and filter based on tabs
  const getSortedFilteredQuests = () => {
    const filtered = activeTab === "all"
      ? quests
      : quests.filter((q) => {
          if (activeTab === "main") return q.type === "main" || q.type === "historical";
          return q.type === activeTab;
        });

    return [...filtered].sort((a, b) => {
      if (a.type === "eco" && b.type !== "eco") return -1;
      if (a.type !== "eco" && b.type === "eco") return 1;
      return 0;
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
          {t("onboarding.intro").slice(62, 110)}...
        </p>
      </div>

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
