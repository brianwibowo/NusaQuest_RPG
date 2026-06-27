import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import type { Reward, AppLanguage } from "@/types";
import { Trophy, CheckCircle2 } from "lucide-react";

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
  const canAfford = playerPoints >= (reward.pointCost || 0);

  return (
    <Card className="overflow-hidden border-slate-100 bg-white hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex gap-3 items-center">
        {/* Ikon/Gambar */}
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-2xl">
            {reward.type === "voucher_umkm" ? "🎫" : reward.type === "digital_collectible" ? "🎨" : "🏆"}
          </span>
        </div>

        {/* Konten detail */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-1.5 justify-between">
            <h4 className="font-bold text-slate-800 text-xs line-clamp-1 leading-snug">{reward.name[lang]}</h4>
            {obtained && (
              <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0 flex gap-0.5 items-center px-1.5 py-0">
                <CheckCircle2 className="h-3 w-3" />
                <span className="text-[9px] font-semibold">{t("reward.obtained")}</span>
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{reward.description[lang]}</p>

          {/* Harga & Tombol Redeem */}
          <div className="flex items-center justify-between pt-1">
            {reward.pointCost && !obtained ? (
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                <Trophy className="h-3 w-3" />
                <span>{t("reward.cost", { amount: reward.pointCost })}</span>
              </div>
            ) : (
              <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{reward.type.replace("_", " ")}</div>
            )}

            {!obtained && reward.pointCost && (
              <Button
                size="sm"
                disabled={!canAfford}
                onClick={() => onRedeem(reward.id, reward.pointCost || 0)}
                className="h-7 px-3 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {t("reward.redeem")}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
