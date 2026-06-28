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
    <div className="w-full space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground font-medium">
        <span>XP: {currentXp} / {xpNeeded > 0 ? xpNeeded : "MAX"}</span>
        <span>{xpNeeded > 0 ? `${progress}%` : "100%"}</span>
      </div>
      <Progress value={progress} className="h-2 w-full bg-emerald-100" />
    </div>
  );
}
