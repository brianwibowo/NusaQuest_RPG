import type { ReactNode } from "react";

interface StatBadgeProps {
  icon: ReactNode;
  value: string | number;
  label?: string;
  className?: string;
}

// Badge kecil serbaguna untuk menampilkan angka statistik (misal di header/dashboard)
export default function StatBadge({ icon, value, label, className = "" }: StatBadgeProps) {
  return (
    <div className={`flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 border border-slate-100 shadow-sm ${className}`}>
      <span className="flex-shrink-0">{icon}</span>
      <div className="flex flex-col leading-none">
        {label && <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">{label}</span>}
        <span className="text-xs font-bold text-slate-700">{value}</span>
      </div>
    </div>
  );
}
