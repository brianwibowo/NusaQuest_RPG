import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Reward, AppLanguage } from "@/types";
import { Trophy, CheckCircle2, Lock, ArrowRight, Sparkles } from "lucide-react";

interface RewardCardProps {
  reward: Reward;
  playerPoints: number;
  obtained: boolean;
  lang: AppLanguage;
  onRedeem: (rewardId: string, pointCost: number) => void;
}

// Menampilkan card item reward (voucher/collectible) di toko penukaran
export default function RewardCard({ reward, playerPoints, obtained, lang, onRedeem }: RewardCardProps) {
  const { t } = useTranslation();
  
  const hasPointsCost = reward.pointCost !== undefined && reward.pointCost !== null;
  const pointCost = reward.pointCost || 0;
  const canAfford = playerPoints >= pointCost;

  // Render Left Side Icon / Graphic Container
  const renderIconContainer = () => {
    if (reward.type === "voucher_umkm") {
      return (
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 text-amber-600 border border-amber-100/50 shadow-inner">
          <span className="text-2xl animate-pulse">🎫</span>
        </div>
      );
    }
    if (reward.type === "digital_collectible") {
      return (
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 text-violet-600 border border-violet-100/50 shadow-inner">
          <span className="text-2xl animate-pulse">🎨</span>
        </div>
      );
    }
    return (
      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-blue-600 border border-blue-100/50 shadow-inner">
        <span className="text-2xl animate-pulse">🏆</span>
      </div>
    );
  };

  return (
    <div className={`overflow-hidden border rounded-2xl p-4 flex gap-3.5 items-center transition-all duration-300 ${
      obtained
        ? "border-emerald-100 bg-emerald-50/5 shadow-sm"
        : !hasPointsCost
        ? "border-slate-100 bg-slate-50/20"
        : canAfford
        ? "border-slate-100 hover:border-emerald-200 bg-white shadow-sm hover:shadow-md"
        : "border-slate-100/80 bg-white opacity-85"
    }`}>
      {/* 1. Icon Container */}
      {renderIconContainer()}

      {/* 2. Detail Content */}
      <div className="flex-1 space-y-1 text-left min-w-0">
        <div className="flex items-center gap-1.5 justify-between">
          <h4 className="font-black text-slate-800 text-[13px] line-clamp-1 leading-snug">
            {reward.name[lang]}
          </h4>
          
          {/* Status Badge (Top Right) */}
          {obtained ? (
            <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-widest flex items-center gap-0.5 shrink-0">
              <CheckCircle2 className="h-3 w-3" />
              {t("reward.obtained")}
            </span>
          ) : !hasPointsCost ? (
            <span className="text-[9px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-widest flex items-center gap-0.5 shrink-0">
              <Lock className="h-3 w-3 text-blue-500" />
              {lang === "id" ? "MISI" : "QUEST"}
            </span>
          ) : null}
        </div>

        <p className="text-[11px] text-slate-500 font-semibold line-clamp-2 leading-relaxed">
          {reward.description[lang]}
        </p>

        {/* 3. Pricing / CTA Actions Row (Bottom Row) */}
        <div className="flex items-center justify-between pt-1.5 border-t border-slate-50/60 mt-1">
          {/* Cost Indicator / Lock Label */}
          {obtained ? (
            <div className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest flex items-center gap-0.5">
              <Sparkles className="h-3 w-3 animate-spin-slow" />
              {reward.type.replace("_", " ")}
            </div>
          ) : hasPointsCost ? (
            <div className={`flex items-center gap-1 text-[11px] font-extrabold ${canAfford ? "text-amber-600" : "text-slate-400"}`}>
              <Trophy className={`h-3.5 w-3.5 ${canAfford ? "text-amber-500 fill-amber-500/10" : "text-slate-400"}`} />
              <span>{t("reward.cost", { amount: pointCost })}</span>
            </div>
          ) : (
            <div className="text-[9px] text-blue-600 font-extrabold uppercase tracking-widest flex items-center gap-1">
              🔒 {lang === "id" ? "HADIAH EKSKLUSIF MISI" : "EXCLUSIVE QUEST REWARD"}
            </div>
          )}

          {/* Action Buttons */}
          {!obtained && (
            <div className="shrink-0">
              {hasPointsCost ? (
                <Button
                  size="sm"
                  disabled={!canAfford}
                  onClick={() => onRedeem(reward.id, pointCost)}
                  className={`h-7 px-3 text-[10px] font-extrabold rounded-xl border-0 transition-transform active:scale-95 cursor-pointer ${
                    canAfford
                      ? "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white shadow-md shadow-emerald-500/10"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {canAfford ? t("reward.redeem").toUpperCase() : (lang === "id" ? "POIN KURANG" : "LACK POINTS")}
                </Button>
              ) : (
                <Button
                  asChild
                  size="sm"
                  className="h-7 px-3 text-[10px] font-extrabold bg-blue-50 hover:bg-blue-100 text-blue-700 border-0 rounded-xl transition-all duration-300 cursor-pointer flex items-center gap-1 active:scale-95"
                >
                  <Link to="/quests">
                    <span>{lang === "id" ? "CARI MISI" : "FIND QUEST"}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
