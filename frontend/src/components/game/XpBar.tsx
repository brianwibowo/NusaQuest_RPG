import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

interface XpBarProps {
  currentXp: number;
  xpNeeded: number;
}

// Menampilkan bilah progress XP dengan persentase dan nilai numerik
export default function XpBar({ currentXp, xpNeeded }: XpBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (xpNeeded > 0) {
      const percentage = Math.min(100, Math.round((currentXp / xpNeeded) * 100));
      const timer = setTimeout(() => setProgress(percentage), 100);
      return () => clearTimeout(timer);
    } else {
      setProgress(100);
    }
  }, [currentXp, xpNeeded]);

  return (
    <div className="w-full space-y-1.5">
      <div className="flex justify-between text-[10px] text-slate-400 font-black uppercase tracking-wider">
        <span>XP: {currentXp} / {xpNeeded > 0 ? xpNeeded : "MAX"}</span>
        <span className="text-emerald-400">{xpNeeded > 0 ? `${progress}%` : "100%"}</span>
      </div>
      <Progress value={progress} className="h-2 w-full bg-slate-800/80 border border-slate-700/30" />
    </div>
  );
}
