import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Edit2, Trash2, Sword } from "lucide-react";
import type { QuestItem } from "./questTypes";
import { getTypeLabel, getTypeColor, getDifficultyLabel, getDifficultyColor } from "./questTypes";

interface QuestCardProps {
  quest: QuestItem;
  onEdit: (quest: QuestItem) => void;
  onDelete: (id: string) => void;
}

export default function QuestCard({ quest: q, onEdit, onDelete }: QuestCardProps) {
  const isEco = q.type === "eco";
  const [imageError, setImageError] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <div className={`border-slate-200/80 bg-white overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-300 relative group rounded-2xl ${
      isEco ? "ring-2 ring-emerald-500/20" : ""
    }`}>
      {isEco && (
        <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[7px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md shadow-md z-20">
          Eco
        </span>
      )}

      <div>
        {/* Image */}
        <div 
          onClick={() => q.imageUrl && !imageError && setIsPreviewOpen(true)}
          className={`h-44 bg-gradient-to-br from-slate-100 to-slate-50 relative overflow-hidden ${
            q.imageUrl && !imageError ? "cursor-zoom-in" : ""
          }`}
        >
          {q.imageUrl && !imageError ? (
            <img 
              src={q.imageUrl} 
              alt={q.titleId} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <Sword className="h-10 w-10 animate-pulse" />
            </div>
          )}
          {/* Type badge */}
          <span className={`absolute top-3 left-3 text-white text-[8px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-md ${getTypeColor(q.type)}`}>
            {getTypeLabel(q.type)}
          </span>
        </div>

        {/* Content */}
        <CardContent className="p-4 sm:p-5 space-y-2.5">
          <div>
            <h3 className="text-sm font-bold text-slate-800 leading-tight">{q.titleId}</h3>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-normal">{q.titleEn}</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 font-normal">
            {q.descId}
          </p>
          {/* Meta tags */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
            <MetaTag>Lvl {q.requiredLevel}</MetaTag>
            <MetaTag className={getDifficultyColor(q.difficulty)}>{getDifficultyLabel(q.difficulty)}</MetaTag>
            <MetaTag>{q.objectives?.length || 0} tugas</MetaTag>
            <MetaTag className="text-emerald-600 font-semibold">{q.reward?.xp || 0} XP</MetaTag>
          </div>
        </CardContent>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-5 flex gap-2">
        <Button
          onClick={() => onEdit(q)}
          variant="outline"
          className="flex-1 h-9 text-xs font-semibold text-slate-600 border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 bg-white rounded-lg"
        >
          <Edit2 className="h-3.5 w-3.5" />
          <span>Ubah</span>
        </Button>
        <Button
          onClick={() => onDelete(q.id)}
          variant="ghost"
          className="flex-1 h-9 text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center gap-1.5 rounded-lg"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Hapus</span>
        </Button>
      </div>

      {/* Premium Lightbox Overlay */}
      {isPreviewOpen && q.imageUrl && (
        <div 
          onClick={() => setIsPreviewOpen(false)}
          className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out animate-in fade-in duration-200"
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <img 
              src={q.imageUrl} 
              alt="Pratinjau Misi" 
              className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/10 select-none animate-in zoom-in-95 duration-200" 
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-all shadow-md text-lg font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Inline helper ──
function MetaTag({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`text-[9px] uppercase tracking-wider font-normal text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md ${className}`}>
      {children}
    </span>
  );
}
