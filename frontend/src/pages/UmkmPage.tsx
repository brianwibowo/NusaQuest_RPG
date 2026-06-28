import { useState, useEffect } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { getUmkmList } from "@/services/umkmService";
import UmkmCard from "@/components/game/UmkmCard";
import { useTranslation } from "react-i18next";
import type { Umkm } from "@/types";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function UmkmPage() {
  const { t } = useTranslation();
  const { player } = usePlayer();
  const lang = player.language || "id";

  const [umkmList, setUmkmList] = useState<Umkm[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getUmkmList()
      .then(setUmkmList)
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <LoadingSpinner message={player.language === "id" ? "Memuat daftar mitra UMKM..." : "Loading local business directory..."} />;
  }

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
        {umkmList.map((umkm) => (
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
