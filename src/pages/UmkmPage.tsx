import { usePlayer } from "@/context/PlayerContext";
import { UMKM_LIST } from "@/data/umkm";
import UmkmCard from "@/components/game/UmkmCard";
import { useTranslation } from "react-i18next";

export default function UmkmPage() {
  const { t } = useTranslation();
  const { player } = usePlayer();
  const lang = player.language || "id";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-0.5">
        <h1 className="text-xl font-bold text-slate-800 leading-snug">{t("umkm.title")}</h1>
        <p className="text-xs text-muted-foreground font-semibold leading-normal">
          Dukung UMKM lokal dengan membeli kuliner legendaris dan suvenir khas daerah!
        </p>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 gap-3">
        {UMKM_LIST.map((umkm) => (
          <UmkmCard
            key={umkm.id}
            umkm={umkm}
            lang={lang}
          />
        ))}
      </div>
    </div>
  );
}
