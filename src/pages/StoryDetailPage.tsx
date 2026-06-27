import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { usePlayer } from "@/context/PlayerContext";
import { STORIES } from "@/data/stories";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { audioManager } from "@/lib/audio";
import { hapticsManager } from "@/lib/haptics";
import { ArrowLeft, MapPin } from "lucide-react";

export default function StoryDetailPage() {
  const { t } = useTranslation();
  const { storyId } = useParams<{ storyId: string }>();
  const { player } = usePlayer();
  const lang = player.language || "id";

  const story = STORIES.find((s) => s.id === storyId);
  const isUnlocked = story && (story.unlocked || player.unlockedStoryIds.includes(story.id));

  // Play scroll opening chime and haptic when the story loads
  useEffect(() => {
    if (story && isUnlocked) {
      audioManager.playSuccess();
      hapticsManager.triggerSuccess();
    }
  }, [story, isUnlocked]);

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

  const handleBackClick = () => {
    audioManager.playClick();
    hapticsManager.triggerClick();
  };

  const storyParagraphs = story.content[lang].split("\n\n");

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-8">
      {/* Back Button */}
      <Link 
        to="/story" 
        onClick={handleBackClick}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{t("common.back")}</span>
      </Link>

      {/* Parchment Scroll Card Container */}
      <Card className="overflow-hidden border-2 border-[#D4B585] bg-gradient-to-b from-[#FAF4E6] to-[#F1E4C3] shadow-xl rounded-2xl relative">
        {/* Scroll Header Ornament */}
        <div className="h-1 bg-[#D4B585] w-full" />
        <div className="h-32 bg-[#E9D9B2]/60 relative flex flex-col items-center justify-center border-b border-[#D4B585]">
          <span className="text-5xl drop-shadow-md">📜</span>
          <span className="text-[9px] font-black text-[#8C6D42] tracking-[0.2em] uppercase mt-2">Naskah Nusantara</span>
        </div>

        <CardContent className="p-6 space-y-5 relative">
          {/* Scroll Side margins decoration lines */}
          <div className="absolute top-0 bottom-0 left-3 w-px bg-[#D4B585]/30 hidden sm:block" />
          <div className="absolute top-0 bottom-0 right-3 w-px bg-[#D4B585]/30 hidden sm:block" />

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="bg-[#8C6D42] text-white px-2.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider shadow-sm">
                {t(`story.category.${story.category}`)}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-[#8C6D42] font-extrabold">
                <MapPin className="h-3.5 w-3.5" />
                <span>JAKARTA</span>
              </div>
            </div>
            <h2 className="text-xl font-extrabold text-[#5A452C] leading-snug tracking-tight border-b-2 border-dashed border-[#D4B585]/50 pb-3 mt-2">
              {story.title[lang]}
            </h2>
          </div>

          {/* Narrative Content with vintage scroll aesthetic */}
          <div className="text-xs text-[#4F3C26] leading-relaxed space-y-4 font-semibold text-justify">
            {storyParagraphs.map((para, idx) => {
              if (idx === 0 && para.length > 0) {
                // Classic Drop Cap for the first letter of the first paragraph
                const firstChar = para.charAt(0);
                const remainingText = para.slice(1);
                return (
                  <p key={idx} className="relative first-letter:float-left first-letter:text-3xl first-letter:font-black first-letter:text-[#8C6D42] first-letter:mr-2 first-letter:line-height-[1] mt-1">
                    <span className="float-left text-3xl font-black text-[#8C6D42] mr-1">{firstChar}</span>
                    {remainingText}
                  </p>
                );
              }
              return <p key={idx} className="indent-4">{para}</p>;
            })}
          </div>
        </CardContent>

        {/* Scroll Footer Ornament */}
        <div className="h-2 bg-[#D4B585] w-full" />
      </Card>
    </div>
  );
}
