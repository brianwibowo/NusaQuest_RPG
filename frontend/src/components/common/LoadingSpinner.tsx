import { Compass } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  fullPage?: boolean;
}

export default function LoadingSpinner({ 
  message = "Memuat petualangan...", 
  fullPage = false 
}: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-4 animate-in fade-in duration-300">
      <div className="relative flex items-center justify-center">
        {/* Outer pulsing ring */}
        <div className="absolute h-14 w-14 rounded-full border-2 border-emerald-500/20 animate-ping z-0" />
        
        {/* Inner rotating compass */}
        <div className="h-12 w-12 rounded-full bg-white border border-[#E5E0D5] flex items-center justify-center shadow-md z-10">
          <Compass className="h-6 w-6 text-emerald-600 animate-[spin_3s_linear_infinite]" />
        </div>
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 select-none">
        {message}
      </p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-dvh w-full flex items-center justify-center bg-[#F8F7F4]">
        {content}
      </div>
    );
  }

  return content;
}
