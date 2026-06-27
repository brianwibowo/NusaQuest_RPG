import { useParams, Link } from "react-router-dom";
import { usePlayer } from "@/context/PlayerContext";
import { STORIES } from "@/data/stories";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MapPin } from "lucide-react";

export default function StoryDetailPage() {
  const { t } = useTranslation();
  const { storyId } = useParams<{ storyId: string }>();
  const { player } = usePlayer();
  const lang = player.language || "id";

  const story = STORIES.find((s) => s.id === storyId);
  const isUnlocked = story && (story.unlocked || player.unlockedStoryIds.includes(story.id));

  if (!story || !isUnlocked) {
    return (
      <div className="text-center py-10 space-y-3">
        <p className="text-sm font-semibold text-slate-500">Story Locked or Not Found</p>
        <Button asChild size="sm" className="text-xs bg-emerald-600">
          <Link to="/story">{t("common.back")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Link to="/story" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" />
        <span>{t("common.back")}</span>
      </Link>

      {/* Main Story Container */}
      <Card className="overflow-hidden border-slate-100 bg-white shadow-md">
        <div className="h-40 bg-slate-100 relative flex items-center justify-center border-b">
          <span className="text-5xl">📜</span>
        </div>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                {t(`story.category.${story.category}`)}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
                <MapPin className="h-3 w-3" />
                <span>Jakarta</span>
              </div>
            </div>
            <h2 className="text-base font-bold text-slate-800 leading-snug">{story.title[lang]}</h2>
          </div>

          {/* Narrative Content */}
          <div className="text-xs text-slate-600 leading-relaxed space-y-3 pt-3 border-t border-slate-50 font-medium">
            {story.content[lang].split("\n\n").map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
