import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "@/context/PlayerContext";
import { CHARACTERS } from "@/data/characters";
import type { CharacterRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LanguageToggle from "@/components/common/LanguageToggle";
import { Compass, Shield, Utensils, Leaf, Landmark, Users, Key, ChevronRight, User } from "lucide-react";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { player, dispatch } = usePlayer();

  const [name, setName] = useState("");
  const [selectedCharId, setSelectedCharId] = useState<CharacterRole | null>(null);
  const [step, setStep] = useState(1); // 1: Enter Name, 2: Choose Character

  const selectedCharacter = CHARACTERS.find((c) => c.id === selectedCharId);
  const lang = player.language || "id";

  const handleNextStep = () => {
    if (name.trim()) setStep(2);
  };

  const handleCompleteOnboarding = () => {
    if (name.trim() && selectedCharId) {
      dispatch({
        type: "COMPLETE_ONBOARDING",
        name: name.trim(),
        characterId: selectedCharId,
      });
      dispatch({ type: "OBTAIN_BADGE", badgeId: "badge_starter" });
      navigate("/");
    }
  };

  const getCharacterIcon = (id: CharacterRole, isActive: boolean) => {
    const activeColor = isActive ? "text-emerald-400" : "text-slate-400";
    const icons: Record<CharacterRole, React.ReactNode> = {
      explorer: <Compass className={`h-4.5 w-4.5 ${activeColor}`} />,
      cultural_guardian: <Shield className={`h-4.5 w-4.5 ${activeColor}`} />,
      culinary_hunter: <Utensils className={`h-4.5 w-4.5 ${activeColor}`} />,
      eco_warrior: <Leaf className={`h-4.5 w-4.5 ${activeColor}`} />,
      heritage_seeker: <Landmark className={`h-4.5 w-4.5 ${activeColor}`} />,
      local_hero: <Users className={`h-4.5 w-4.5 ${activeColor}`} />,
      treasure_seeker: <Key className={`h-4.5 w-4.5 ${activeColor}`} />,
    };
    return icons[id] || <Compass className="h-4.5 w-4.5" />;
  };

  if (step === 2) {
    return (
      <div className="min-h-dvh w-full flex flex-col md:flex-row bg-[#0B1528] overflow-hidden font-sans select-none relative">
        
        {/* Floating Language Toggle */}
        <div className="absolute top-6 right-6 z-30">
          <LanguageToggle />
        </div>

        {/* 1. LEFT SIDE: LARGE CHARACTER ARTWORK DISPLAY (50% Desktop / 35dvh Mobile) */}
        <div className="w-full h-[35dvh] md:h-dvh md:w-[45%] lg:w-[50%] flex-shrink-0 bg-gradient-to-br from-slate-900/90 to-[#0B1528] border-b md:border-b-0 md:border-r border-white/5 relative flex items-center justify-center p-6 md:p-12 overflow-hidden">
          
          {/* Subtle background glow effect behind character */}
          <div className="absolute w-[300px] h-[300px] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none z-0" />
          
          {selectedCharacter ? (
            <div key={selectedCharacter.id} className="relative z-10 flex flex-col items-center justify-center h-full w-full transition-all duration-500 animate-in fade-in zoom-in-95">
              <img
                src={selectedCharacter.avatarUrl}
                alt={selectedCharacter.name[lang]}
                className="w-full max-w-[280px] md:max-w-[400px] h-[80%] md:h-[80%] object-contain drop-shadow-[0_12px_40px_rgba(16,185,129,0.35)] transition-transform hover:scale-105 duration-500 filter brightness-105"
              />
              <span className="hidden md:block absolute bottom-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                {selectedCharacter.name[lang]} · Spotlight
              </span>
            </div>
          ) : (
            <div className="text-slate-500 text-xs font-semibold z-10">
              Pilih karakter di sebelah kanan untuk melihat detail
            </div>
          )}
        </div>

        {/* 2. RIGHT SIDE: SELECTION LIST & DETAILS (50% Desktop / 65dvh Mobile) */}
        <div className="w-full h-[65dvh] md:h-dvh md:w-[55%] lg:w-[50%] bg-[#0B1528] flex flex-col justify-between p-6 md:p-12 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 relative z-10 shadow-2xl">
          
          {/* Main content flow */}
          <div className="space-y-6 flex-1 flex flex-col justify-center max-w-xl mx-auto w-full">
            
            {/* Header */}
            <div className="space-y-1.5 text-left pt-2">
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-widest uppercase">
                Pilih Karakter
              </h2>
              <p className="text-xs font-semibold text-slate-400">
                Setiap karakter memiliki kekuatan unik dan bonus afinitas misi.
              </p>
            </div>

            {/* Selection Grid (2 columns on desktop/tablet, 1-2 columns on small screens) */}
            <div className="grid grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-white/10 text-left w-full">
              {CHARACTERS.map((char) => {
                const isSelected = selectedCharId === char.id;
                return (
                  <button
                    key={char.id}
                    onClick={() => setSelectedCharId(char.id)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-left cursor-pointer transition-all hover:scale-[1.01] active:scale-95 duration-200 ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-950/30 text-emerald-100 shadow-md ring-1 ring-emerald-500/25"
                        : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <div className={`p-2 rounded-xl border transition-all ${
                      isSelected ? "bg-emerald-950/80 border-emerald-500/40" : "bg-white/5 border-white/5"
                    }`}>
                      {getCharacterIcon(char.id, isSelected)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold block truncate">{char.name[lang]}</span>
                      <span className="text-[9px] font-semibold text-slate-400 block truncate uppercase tracking-wider mt-0.5">
                        {char.role[lang].replace("Wisatawan", "").replace("Explorer", "")}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected character detail preview */}
            {selectedCharacter && (
              <div className="p-4 md:p-5 rounded-2xl bg-white/5 border border-dashed border-emerald-500/20 flex gap-4 text-left shadow-2xl items-start w-full transition-all duration-300">
                <div className="min-w-0 flex-1 space-y-2.5">
                  <div>
                    <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <span>{selectedCharacter.name[lang]}</span>
                      <span className="text-slate-500 font-normal text-sm">·</span>
                      <span className="text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
                        {selectedCharacter.role[lang]}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium mt-1">
                      {selectedCharacter.description[lang]}
                    </p>
                  </div>
                  
                  <div className="pt-2.5 border-t border-white/5 space-y-1">
                    <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block">
                      Kekuatan Khusus
                    </span>
                    <div className="text-xs font-extrabold text-emerald-300 flex items-center gap-2 bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-500/20 w-fit">
                      <span>✨</span>
                      <span>{selectedCharacter.specialPower[lang]}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 w-full max-w-sm pt-2">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1 h-11 text-xs font-bold text-slate-300 bg-white/5 border-white/10 rounded-full hover:bg-white/10 cursor-pointer"
              >
                Kembali
              </Button>
              <Button
                onClick={handleCompleteOnboarding}
                disabled={!selectedCharId}
                className="flex-1 h-11 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 rounded-full hover:scale-[1.01] active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
              >
                Mulai Bermain
              </Button>
            </div>

          </div>

          {/* Footer of Sidebar */}
          <div className="space-y-3 pt-4 border-t border-white/5 flex-shrink-0 w-full text-center">
            <div className="flex justify-center gap-4">
              <span className="text-[8px] font-bold text-slate-500 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> BILINGUAL AKTIF
              </span>
              <span className="text-[8px] font-bold text-slate-500 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> REAL-TIME GPS
              </span>
            </div>
            <p className="text-[7px] font-bold text-slate-600 uppercase tracking-widest">
              Aman &amp; Terenkripsi
            </p>
          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-dvh w-full flex flex-col md:flex-row bg-[#0B1528] overflow-hidden font-sans select-none relative">
      
      {/* 1. HERO VISUAL SIDE PANEL (60% Desktop / 40% Mobile) */}
      <div className="w-full h-[40dvh] md:h-dvh md:w-[60%] relative overflow-hidden flex-shrink-0 bg-slate-900 border-b md:border-b-0 md:border-r border-white/5">
        <img 
          src="/images/ui/onboarding_hero.png" 
          alt="Adventure Backdrop" 
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        />
        {/* Subtle shadow overlay from the right (on desktop) and bottom (on mobile) to blend */}
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent to-slate-950/30 z-0" />

        {/* Minimalist Watermark Logo on Top Left of the image */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-slate-950/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
          <img src="/images/ui/logo.png" alt="Logo" className="h-4.5 w-4.5 object-contain" />
          <span className="text-[9px] font-black text-white tracking-widest">NUSAQUEST</span>
        </div>
      </div>

      {/* 2. SIDEBAR CONTENT PANEL (40% Desktop / 60% Mobile) */}
      <div className="w-full h-[60dvh] md:h-dvh md:w-[40%] bg-[#0B1528] flex flex-col justify-between p-6 md:p-10 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 relative z-10 shadow-2xl">
        
        {/* Floating Language Toggle to avoid breaking vertical alignment */}
        <div className="absolute top-4 right-4 z-20">
          <LanguageToggle />
        </div>

        {/* Inner container centered vertically like a pyramid */}
        <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-between py-2">
          
          {/* Top Header of Sidebar (Centered Stack) */}
          <div className="flex flex-col items-center text-center space-y-3 pt-4 md:pt-8 flex-shrink-0">
            <img 
              src="/images/ui/logo.png" 
              alt="NusaQuest Logo" 
              className="w-28 h-28 object-contain drop-shadow-[0_4px_16px_rgba(16,185,129,0.45)] transition-transform hover:scale-105 duration-300" 
            />
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white tracking-widest leading-none">
                NUSA QUEST
              </h2>
              <p className="text-[9.5px] font-extrabold text-emerald-400 uppercase tracking-widest">
                Simulasi Penjelajahan Digital &amp; Warisan Nusantara
              </p>
            </div>
          </div>

          {/* Middle Form / Content area (Centered content flow) */}
          <div className="flex-1 flex flex-col justify-start pt-6 md:pt-14 pb-6">
            {step === 1 && (
              /* Step 1: Input Name */
              <div className="flex flex-col gap-4 text-center items-center w-full">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-200">Siap Bermain?</h3>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                    Masukkan nama petualang untuk melanjutkan
                  </p>
                </div>

                <div className="space-y-2 w-full">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="e.g. Wira Nusa"
                      value={name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                      maxLength={15}
                      className="h-11 text-center text-xs border-white/10 focus-visible:ring-emerald-500 font-semibold bg-white/5 rounded-xl pr-10 pl-4 text-white placeholder:text-slate-500"
                    />
                    <span className="absolute right-4 top-3.5 text-[9px] font-bold text-slate-500">
                      {name.length}/15
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleNextStep}
                  disabled={!name.trim()}
                  className="w-full h-11 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/15 rounded-full hover:scale-[1.01] active:scale-95 transition-all tracking-wider flex items-center justify-center gap-2 uppercase cursor-pointer"
                >
                  <User className="h-4 w-4" />
                  <span>Pilih Karakter</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Bottom of Sidebar (Centered Stack) */}
          <div className="space-y-3 pt-3 border-t border-white/5 flex-shrink-0 w-full text-center">
            <div className="flex justify-center gap-4">
              <span className="text-[8px] font-bold text-slate-500 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> BILINGUAL AKTIF
              </span>
              <span className="text-[8px] font-bold text-slate-500 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> REAL-TIME GPS
              </span>
            </div>
            <p className="text-[7px] font-bold text-slate-600 uppercase tracking-widest">
              Aman &amp; Terenkripsi
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
