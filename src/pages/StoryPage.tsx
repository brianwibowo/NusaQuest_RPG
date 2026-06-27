import { usePlayer } from "@/context/PlayerContext";
import { STORIES } from "@/data/stories";
import StoryCard from "@/components/game/StoryCard";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export default function StoryPage() {
  const { t } = useTranslation();
  const { player } = usePlayer();
  const lang = player.language || "id";

  // Merge runtime unlock state from playerState
  const mappedStories = STORIES.map((story) => ({
    ...story,
    unlocked: story.unlocked || player.unlockedStoryIds.includes(story.id),
  }));

  const unlockedCount = mappedStories.filter((s) => s.unlocked).length;

  return (
    <div className="space-y-4">
      {/* 1. Progress Banner */}
      <Card className="overflow-hidden border-slate-100 bg-white shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{t("story.title")}</h3>
              <span className="text-[10px] font-semibold text-slate-500 block mt-0.5">
                Koleksi Unlocked: {unlockedCount} / {STORIES.length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Story Card List Grid */}
      <div className="grid grid-cols-1 gap-3">
        {mappedStories.map((story) => (
          <StoryCard
            key={story.id}
            story={story}
            lang={lang}
          />
        ))}
      </div>
    </div>
  );
}
