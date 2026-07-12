import { Input } from "@/components/ui/input";
import { Search, ChevronDown } from "lucide-react";
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

  const selectClass = "w-full h-10 pl-3 sm:pl-4 pr-8 sm:pr-10 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:outline-none font-normal transition-all cursor-pointer appearance-none";

  return (
    <div className="space-y-2">
      <div id="filter-bar" className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors duration-200">
        {/* Search */}
        <div className="relative col-span-3 sm:col-span-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari judul misi..."
            className="h-10 pl-9 text-xs border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-white focus-visible:ring-emerald-500 font-normal placeholder:text-slate-400 rounded-full"
          />
        </div>

        {/* Type */}
        <div className="relative col-span-1">
          <select value={filterType} onChange={(e) => onFilterTypeChange(e.target.value)} className={selectClass}>
            <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">Tipe Misi</option>
            {QUEST_TYPES.map((t) => (
              <option key={t.value} value={t.value} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{t.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 sm:right-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Difficulty */}
        <div className="relative col-span-1">
          <select value={filterDifficulty} onChange={(e) => onFilterDifficultyChange(e.target.value)} className={selectClass}>
            <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">Kesulitan</option>
            {DIFFICULTIES.map((d) => (
              <option key={d.value} value={d.value} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{d.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 sm:right-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Level */}
        <div className="relative col-span-1">
          <select value={filterLevel} onChange={(e) => onFilterLevelChange(e.target.value)} className={selectClass}>
            <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">Level</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((l) => (
              <option key={l} value={l} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">Lvl {l}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 sm:right-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Result indicator */}
      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-normal px-1">
        Menampilkan <span className="font-semibold text-slate-600 dark:text-slate-300">{resultCount}</span> dari {totalCount} misi
        {isFiltered && <span className="text-emerald-600 dark:text-emerald-400 font-semibold"> (terfilter)</span>}
      </p>
    </div>
  );
}
