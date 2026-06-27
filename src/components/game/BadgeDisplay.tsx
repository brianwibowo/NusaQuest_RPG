import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import type { Reward, AppLanguage } from "@/types";
import { Lock } from "lucide-react";

interface BadgeDisplayProps {
  badges: Reward[];
  obtainedBadgeIds: string[];
  lang: AppLanguage;
}

// Menampilkan grid badge yang didapatkan pemain vs yang terkunci
export default function BadgeDisplay({ badges, obtainedBadgeIds, lang }: BadgeDisplayProps) {
  const { t } = useTranslation();

  if (badges.length === 0) {
    return <div className="text-center text-xs text-muted-foreground py-4">{t("character.no_badges")}</div>;
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {badges.map((badge) => {
        const isObtained = obtainedBadgeIds.includes(badge.id);
        return (
          <Card
            key={badge.id}
            className={`border-0 bg-transparent shadow-none ${isObtained ? "opacity-100" : "opacity-40"}`}
            title={badge.description[lang]}
          >
            <CardContent className="p-0 flex flex-col items-center gap-1.5">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 border border-slate-200">
                {isObtained ? (
                  <span className="text-xl">🏆</span>
                ) : (
                  <Lock className="h-4 w-4 text-slate-400" />
                )}
              </div>
              <span className="text-[10px] font-semibold text-center line-clamp-1 text-slate-600">
                {badge.name[lang]}
              </span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
