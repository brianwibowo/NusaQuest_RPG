import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { QUEST_TYPES, DIFFICULTIES } from "./questTypes";

interface QuestFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  filterType: string;
  onFilterTypeChange: (val: string) => void;
  filterDifficulty: string;
  onFilterDifficultyChange: (val: string) => void;
  filterLevel: string;
  onFilterLevelChange: (val: string) => void;
  resultCount: number;
  totalCount: number;
  isFiltered: boolean;
}

export default function QuestFilterBar({
  searchQuery, onSearchChange,
  filterType, onFilterTypeChange,
  filterDifficulty, onFilterDifficultyChange,
  filterLevel, onFilterLevelChange,
  resultCount, totalCount, isFiltered,
}: QuestFilterBarProps) {

  const selectClass = "h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:outline-none font-normal transition-all";

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari judul misi..."
            className="h-10 pl-9 text-xs border-slate-200 bg-white text-slate-800 focus-visible:ring-emerald-500 font-normal placeholder:text-slate-400 rounded-xl"
          />
        </div>

        {/* Type */}
        <select value={filterType} onChange={(e) => onFilterTypeChange(e.target.value)} className={selectClass}>
          <option value="">Semua Tipe Misi</option>
          {QUEST_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        {/* Difficulty */}
        <select value={filterDifficulty} onChange={(e) => onFilterDifficultyChange(e.target.value)} className={selectClass}>
          <option value="">Semua Kesulitan</option>
          {DIFFICULTIES.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>

        {/* Level */}
        <select value={filterLevel} onChange={(e) => onFilterLevelChange(e.target.value)} className={selectClass}>
          <option value="">Semua Level</option>
          {[1,2,3,4,5,6,7,8,9,10].map((l) => (
            <option key={l} value={l}>Level {l}</option>
          ))}
        </select>
      </div>

      {/* Result indicator */}
      <p className="text-[11px] text-slate-400 font-normal px-1">
        Menampilkan <span className="font-semibold text-slate-600">{resultCount}</span> dari {totalCount} misi
        {isFiltered && <span className="text-emerald-600 font-semibold"> (terfilter)</span>}
      </p>
    </div>
  );
}
