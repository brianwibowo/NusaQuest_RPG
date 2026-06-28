import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { usePlayer } from "@/context/PlayerContext";
import { getUmkmById } from "@/services/umkmService";
import { getQuests } from "@/services/questService";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import QuestCard from "@/components/game/QuestCard";
import { ArrowLeft, Star, Gift, ShoppingBag, MapPin, Swords } from "lucide-react";
import type { Umkm, Quest } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function UmkmDetailPage() {
  const { t } = useTranslation();
  const { umkmId } = useParams<{ umkmId: string }>();
  const { player } = usePlayer();
  const lang = player.language || "id";

  const [umkm, setUmkm] = useState<Umkm | null>(null);
  const [linkedQuests, setLinkedQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!umkmId) return;
    setIsLoading(true);
    Promise.all([
      getUmkmById(umkmId),
      getQuests()
    ])
      .then(([uData, qList]) => {
        setUmkm(uData);
        const linked = qList.filter((q) => q.relatedUmkmId === umkmId || (uData as any).questIds?.includes(q.id));
        setLinkedQuests(linked);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [umkmId]);

  if (isLoading) {
    return <LoadingSpinner message={player.language === "id" ? "Memuat profil UMKM lokal..." : "Loading local business profile..."} />;
  }

  if (!umkm) {
    return (
      <div className="text-center py-10 space-y-3">
        <p className="text-sm font-semibold text-slate-500">UMKM Not Found</p>
        <Button asChild size="sm" className="text-xs bg-emerald-600">
          <Link to="/umkm">{t("common.back")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Link to="/umkm" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
        <ArrowLeft className="h-4 w-4" />
        <span>{t("common.back")}</span>
      </Link>

      {/* Main UMKM details */}
      <Card className="overflow-hidden border-slate-100 bg-white shadow-md">
        <div className="h-40 bg-slate-50 border-b flex items-center justify-center relative">
          <span className="text-5xl">🛍️</span>
        </div>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-slate-200 text-slate-500 bg-slate-50 font-medium">
                {t(`umkm.category.${umkm.category}`)}
              </Badge>
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                <span className="text-xs font-bold text-slate-700">{umkm.rating.toFixed(1)}</span>
              </div>
            </div>
            
            <h2 className="text-base font-bold text-slate-800 leading-snug">{umkm.name}</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">{umkm.description[lang]}</p>
          </div>

          {/* Vouchers/Discounts Available */}
          {umkm.voucherAvailable && (
            <div className="flex items-center gap-2 p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-bold">
              <Gift className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>{t("umkm.voucher_available")}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-3 border-t border-slate-50">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span>Setu Babakan, Jagakarsa</span>
          </div>
        </CardContent>
      </Card>

      {/* Products list */}
      <Card className="border-slate-100 bg-white shadow-sm">
        <CardContent className="p-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
            <ShoppingBag className="h-4 w-4 text-emerald-600" />
            <span>{t("umkm.products")}</span>
          </h3>

          <div className="flex flex-wrap gap-2 pt-1">
            {umkm.products.map((product, idx) => (
              <Badge key={idx} variant="secondary" className="text-[10px] font-semibold px-2.5 py-0.5 bg-slate-100 hover:bg-slate-100 text-slate-600 border-0">
                {product}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Linked Quests */}
      {linkedQuests.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1 pl-1">
            <Swords className="h-4 w-4 text-emerald-600" />
            <span>Quest Terkait</span>
          </h3>
          <div className="flex flex-col gap-2.5">
            {linkedQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                playerLevel={player.level}
                lang={lang}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
