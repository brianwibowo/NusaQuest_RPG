import { useState, useEffect } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { REWARDS } from "@/data/rewards";
import { getUmkmList } from "@/services/umkmService";
import RewardCard from "@/components/game/RewardCard";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy } from "lucide-react";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function RewardsPage() {
  const { t } = useTranslation();
  const { player, dispatch } = usePlayer();
  const lang = player.language || "id";

  const [umkmList, setUmkmList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getUmkmList()
      .then(setUmkmList)
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  // Filter static rewards by type
  const staticVouchers = REWARDS.filter((r) => r.type === "voucher_umkm");
  const collectibles = REWARDS.filter((r) => r.type === "digital_collectible");

  // Map dynamic UMKM vouchers
  const dynamicVouchers = umkmList
    .filter((u) => u.voucherAvailable)
    .map((u) => ({
      id: `voucher_dynamic_${u.id}`,
      name: { 
        id: `Voucher Diskon ${u.name}`, 
        en: `${u.name} Discount Voucher` 
      },
      description: {
        id: `Dapatkan potongan harga eksklusif untuk produk kuliner/suvenir di ${u.name}.`,
        en: `Get exclusive discount for culinary/souvenir products at ${u.name}.`
      },
      type: "voucher_umkm" as const,
      imageUrl: u.imageUrl || "/images/rewards/voucher_default.png",
      pointCost: 150, // standard points cost
      obtained: player.obtainedRewardIds.includes(`voucher_dynamic_${u.id}`)
    }));

  const vouchers = [...staticVouchers, ...dynamicVouchers];

  const handleRedeemReward = (rewardId: string, pointCost: number) => {
    if (player.totalPoints >= pointCost) {
      dispatch({ type: "SPEND_POINTS", amount: pointCost });
      dispatch({ type: "OBTAIN_REWARD", rewardId });
    }
  };

  if (isLoading) {
    return <LoadingSpinner message={player.language === "id" ? "Memuat toko hadiah..." : "Loading rewards shop..."} />;
  }

  return (
    <div className="space-y-4">
      {/* 1. Points Balance Indicator Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-950 to-emerald-950/70 border border-slate-800 shadow-xl rounded-2xl p-5 text-white flex items-center justify-between gap-4">
        {/* Glow overlay */}
        <div className="absolute right-0 top-0 h-24 w-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 h-16 w-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <span className="text-[9px] text-emerald-400 uppercase tracking-widest font-black block">
            {lang === "id" ? "SALDO POIN KLAIM" : "CLAIMABLE POINTS BALANCE"}
          </span>
          <div className="text-2xl font-black flex items-center gap-2 leading-none text-white tracking-tight">
            <Trophy className="h-6 w-6 text-amber-400 fill-amber-400/15 animate-pulse" />
            <span>{player.totalPoints} <span className="text-xs font-black text-slate-400">PTS</span></span>
          </div>
        </div>

        <div className="h-11 w-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xl relative z-10 backdrop-blur-md shadow-inner animate-bounce-short">
          🎒
        </div>
      </div>

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
