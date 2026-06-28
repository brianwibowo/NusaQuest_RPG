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

  return (
    <div className="min-h-dvh w-full flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden font-sans select-none">
      
      {/* 1. Fullscreen Background Hero Image (100% Opacity) */}
      <img 
        src="/images/ui/onboarding_hero.png" 
        alt="Adventure Backdrop" 
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
      />
      {/* Vignette bottom-heavy gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-slate-950/60 z-0" />

      {/* Language Toggle in a floating dark button */}
      <div className="absolute right-6 top-6 z-50">
        <LanguageToggle />
      </div>

      {/* 2. Centered Floating Glassmorphic Onboarding Card */}
      <div className="w-full max-w-md bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 md:p-8 shadow-2xl flex flex-col gap-5 text-center relative z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-1.5">
          {/* Logo with clean drop shadow */}
          <img 
            src="/images/ui/logo.png" 
            alt="NusaQuest Logo" 
            className="w-24 h-24 object-contain drop-shadow-[0_4px_16px_rgba(16,185,129,0.4)]" 
          />
          <h2 className="text-2xl font-black text-white tracking-widest leading-none mt-1">
            NUSA QUEST
          </h2>
          <p className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest max-w-[240px] leading-relaxed mt-1">
            Simulasi Penjelajahan Digital &amp; Warisan Budaya Nusantara
          </p>
        </div>

        {step === 1 ? (
          /* Step 1: Input Name */
          <div className="flex flex-col gap-4 pt-1">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-200">Siap Bermain?</h3>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                Masukkan nama petualang untuk melanjutkan
              </p>
            </div>

            <div className="space-y-2 text-left">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="e.g. Wira Nusa"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  maxLength={15}
                  className="h-11 text-xs border-white/10 focus-visible:ring-emerald-500 font-semibold bg-white/5 rounded-xl pr-12 text-white placeholder:text-slate-500"
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

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-3 text-[8px] font-bold text-slate-500 uppercase tracking-widest">Aman &amp; Terenkripsi</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>
          </div>
        ) : (
          /* Step 2: Choose Character */
          <div className="flex flex-col gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-200">Pilih Karakter</h3>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                Setiap karakter memiliki kekuatan unik.
              </p>
            </div>

            {/* Responsive grid with custom scrollbar */}
            <div className="grid grid-cols-2 gap-2 max-h-[190px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 text-left">
              {CHARACTERS.map((char) => {
                const isSelected = selectedCharId === char.id;
                return (
                  <button
                    key={char.id}
                    onClick={() => setSelectedCharId(char.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-95 cursor-pointer ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-950/40 text-emerald-100 shadow-sm font-extrabold"
                        : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg border transition-all ${
                      isSelected ? "bg-emerald-950/80 border-emerald-500/40" : "bg-white/5 border-white/5"
                    }`}>
                      {getCharacterIcon(char.id, isSelected)}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold block truncate">{char.name[lang]}</span>
                      <span className="text-[7px] font-semibold text-slate-400 block truncate uppercase tracking-wider mt-0.5">
                        {char.role[lang].replace("Wisatawan", "").replace("Explorer", "")}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* RPG preview detail panel */}
            {selectedCharacter && (
              <div className="p-3 rounded-xl bg-white/5 border border-dashed border-emerald-500/20 flex gap-3 text-left shadow-inner items-start">
                <img 
                  src={selectedCharacter.avatarUrl} 
                  alt={selectedCharacter.name[lang]} 
                  className="w-14 h-14 object-contain rounded-lg bg-emerald-950/50 border border-emerald-500/20 flex-shrink-0" 
                />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-100">
                      {selectedCharacter.name[lang]} · <span className="text-emerald-400 font-semibold text-[8px]">{selectedCharacter.role[lang]}</span>
                    </h4>
                    <p className="text-[8.5px] text-slate-400 leading-normal font-semibold mt-0.5">
                      {selectedCharacter.description[lang]}
                    </p>
                  </div>
                  <div className="pt-1.5 border-t border-white/5">
                    <span className="text-[7px] font-extrabold text-slate-500 uppercase tracking-wider block">Kekuatan Khusus</span>
                    <p className="text-[8px] font-bold text-emerald-300 mt-1 flex items-center gap-1 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20">
                      <span>✨</span>
                      <span>{selectedCharacter.specialPower[lang]}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-1">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1 h-10 text-xs font-bold text-slate-300 bg-white/5 border-white/10 rounded-full hover:bg-white/10 cursor-pointer"
              >
                Kembali
              </Button>
              <Button
                onClick={handleCompleteOnboarding}
                disabled={!selectedCharId}
                className="flex-1 h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md rounded-full hover:scale-[1.01] active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
              >
                Mulai Bermain
              </Button>
            </div>
          </div>
        )}

        {/* Brand Showcase Indicators */}
        <div className="flex justify-center gap-4 border-t border-white/5 pt-3 mt-1">
          <span className="text-[8px] font-bold text-slate-400 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> BILINGUAL AKTIF
          </span>
          <span className="text-[8px] font-bold text-slate-400 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> REAL-TIME GPS
          </span>
        </div>

      </div>
    </div>
  );
}
