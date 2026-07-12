import type { ReactNode } from "react";

interface FieldGroupProps {
  label: string;
  hint?: string;
  compact?: boolean;
  required?: boolean;
  children: ReactNode;
}

export default function FieldGroup({ label, hint, compact, required, children }: FieldGroupProps) {
  return (
    <div className={compact ? "space-y-1" : "space-y-1.5"}>
      <label className={`block text-slate-600 tracking-wide ${
        compact ? "text-[10px] font-semibold" : "text-[11px] font-semibold"
      }`}>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && (
        <p className="text-[10px] text-slate-400 font-normal leading-snug">{hint}</p>
      )}
    </div>
  );
}
