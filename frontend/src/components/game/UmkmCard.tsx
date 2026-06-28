import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Umkm, AppLanguage } from "@/types";
import { Star, Gift, ArrowRight } from "lucide-react";

interface UmkmCardProps {
  umkm: Umkm;
  lang: AppLanguage;
}

// Menampilkan card ringkasan informasi UMKM partner
export default function UmkmCard({ umkm, lang }: UmkmCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="overflow-hidden border-slate-100 bg-white hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex gap-3 items-center">
        {/* Gambar/Foto UMKM */}
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-2xl">
            {umkm.category === "kuliner" ? "🍲" : umkm.category === "suvenir" ? "🛍️" : umkm.category === "fashion" ? "👕" : "📦"}
          </span>
        </div>

        {/* Informasi Bisnis */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between gap-1.5">
            <h4 className="font-bold text-slate-800 text-xs line-clamp-1 leading-snug">{umkm.name}</h4>
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-slate-200 text-slate-500 bg-slate-50 font-medium">
              {t(`umkm.category.${umkm.category}`)}
            </Badge>
          </div>

          <p className="text-[10px] text-muted-foreground line-clamp-1 leading-relaxed">{umkm.description[lang]}</p>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              {/* Rating */}
              <div className="flex items-center gap-0.5 text-amber-500 text-[10px] font-bold">
                <Star className="h-3 w-3 fill-amber-500" />
                <span>{umkm.rating.toFixed(1)}</span>
              </div>

              {/* Voucher Badge */}
              {umkm.voucherAvailable && (
                <div className="flex items-center gap-0.5 text-emerald-600 text-[10px] font-bold">
                  <Gift className="h-3 w-3" />
                  <span>{t("umkm.voucher_available")}</span>
                </div>
              )}
            </div>

            <Link
              to={`/umkm/${umkm.id}`}
              className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 whitespace-nowrap"
            >
              <span>{t("umkm.visit")}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
