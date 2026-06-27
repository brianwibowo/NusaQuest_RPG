interface LevelIndicatorProps {
  level: number;
}

// Komponen melingkar untuk menampilkan badge level pemain saat ini
export default function LevelIndicator({ level }: LevelIndicatorProps) {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-50 font-bold text-emerald-700 shadow-sm transition-transform hover:scale-105">
      <div className="text-center">
        <div className="text-[10px] uppercase tracking-wider text-emerald-600 leading-none">Lv</div>
        <div className="text-base leading-none">{level}</div>
      </div>
    </div>
  );
}
