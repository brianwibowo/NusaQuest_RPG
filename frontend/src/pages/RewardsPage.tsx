import { usePlayer } from "@/context/PlayerContext";
import { REWARDS } from "@/data/rewards";
import RewardCard from "@/components/game/RewardCard";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export default function RewardsPage() {
  const { t } = useTranslation();
  const { player, dispatch } = usePlayer();
  const lang = player.language || "id";

  // Filter rewards by type
  const vouchers = REWARDS.filter((r) => r.type === "voucher_umkm");
  const collectibles = REWARDS.filter((r) => r.type === "digital_collectible");

  const handleRedeemReward = (rewardId: string, pointCost: number) => {
    if (player.totalPoints >= pointCost) {
      dispatch({ type: "SPEND_POINTS", amount: pointCost });
      dispatch({ type: "OBTAIN_REWARD", rewardId });
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Points Balance Indicator Banner */}
      <Card className="overflow-hidden border-emerald-100 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] text-emerald-100 uppercase tracking-wider font-bold">Points Balance</span>
            <div className="text-xl font-bold flex items-center gap-1.5 leading-none">
              <Trophy className="h-5 w-5 text-amber-300 fill-amber-300/20" />
              <span>{player.totalPoints} Pts</span>
            </div>
          </div>
          <span className="text-2xl">🎒</span>
        </CardContent>
      </Card>

      {/* 2. Tabs */}
      <Tabs defaultValue="vouchers" className="w-full">
        <TabsList className="grid grid-cols-2 h-8 bg-slate-100/80 p-0.5 rounded-lg">
          <TabsTrigger
            value="vouchers"
            className="text-[10px] font-bold py-1 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm rounded-md transition-all"
          >
            {t("reward.vouchers").toUpperCase()}
          </TabsTrigger>
          <TabsTrigger
            value="collectibles"
            className="text-[10px] font-bold py-1 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm rounded-md transition-all"
          >
            {t("reward.collectibles").toUpperCase()}
          </TabsTrigger>
        </TabsList>

        {/* 3. Vouchers Tab Content */}
        <TabsContent value="vouchers" className="mt-4">
          <div className="grid grid-cols-1 gap-3">
            {vouchers.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                playerPoints={player.totalPoints}
                obtained={player.obtainedRewardIds.includes(reward.id)}
                lang={lang}
                onRedeem={handleRedeemReward}
              />
            ))}
          </div>
        </TabsContent>

        {/* 4. Collectibles Tab Content */}
        <TabsContent value="collectibles" className="mt-4">
          <div className="grid grid-cols-1 gap-3">
            {collectibles.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                playerPoints={player.totalPoints}
                obtained={player.obtainedRewardIds.includes(reward.id)}
                lang={lang}
                onRedeem={handleRedeemReward}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
