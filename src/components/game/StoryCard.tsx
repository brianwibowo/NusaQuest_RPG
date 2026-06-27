import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Story, AppLanguage } from "@/types";
import { Lock, BookOpen } from "lucide-react";

interface StoryCardProps {
  story: Story;
  lang: AppLanguage;
}

// Menampilkan card cerita lokal (terkunci dengan petunjuk misi atau terbuka untuk dibaca)
export default function StoryCard({ story, lang }: StoryCardProps) {
  const { t } = useTranslation();

  return (
    <Card className={`overflow-hidden border-slate-100 bg-white transition-all hover:shadow-md ${!story.unlocked ? "bg-slate-50/50 opacity-75" : ""}`}>
      <CardContent className="p-4 flex gap-3 items-center">
        {/* Thumbnail/Ikon */}
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200">
          <span className="text-2xl">{story.category === "sejarah" ? "📜" : story.category === "budaya" ? "🎭" : story.category === "kuliner" ? "🍲" : "🌳"}</span>
        </div>

        {/* Info detail */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-1.5 justify-between">
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-slate-200 text-slate-500 bg-slate-50 font-medium">
              {t(`story.category.${story.category}`)}
            </Badge>
            {!story.unlocked && <Lock className="h-3.5 w-3.5 text-slate-400" />}
          </div>

          <h4 className="font-bold text-slate-800 text-xs line-clamp-1 leading-snug">{story.title[lang]}</h4>

          {story.unlocked ? (
            <div className="flex items-center justify-between pt-1">
              <p className="text-[10px] text-muted-foreground line-clamp-1 flex-1 pr-4">{story.content[lang].slice(0, 50)}...</p>
              <Link
                to={`/story/${story.id}`}
                className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 whitespace-nowrap"
              >
                <BookOpen className="h-3 w-3" />
                <span>{t("story.read")}</span>
              </Link>
            </div>
          ) : (
            <p className="text-[10px] text-slate-400 italic line-clamp-1 leading-relaxed">
              {t("story.locked")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
