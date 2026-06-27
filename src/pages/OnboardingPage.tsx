import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "@/context/PlayerContext";
import { CHARACTERS } from "@/data/characters";
import type { CharacterRole } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LanguageToggle from "@/components/common/LanguageToggle";
import { Badge } from "@/components/ui/badge";
import { Compass, Shield, Utensils, Leaf, Landmark, Users, Key, Swords, ChevronRight, User } from "lucide-react";

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
    const activeColor = isActive ? "text-emerald-600" : "text-slate-500";
    const icons: Record<CharacterRole, React.ReactNode> = {
      explorer: <Compass className={`h-5 w-5 ${activeColor}`} />,
      cultural_guardian: <Shield className={`h-5 w-5 ${activeColor}`} />,
      culinary_hunter: <Utensils className={`h-5 w-5 ${activeColor}`} />,
      eco_warrior: <Leaf className={`h-5 w-5 ${activeColor}`} />,
      heritage_seeker: <Landmark className={`h-5 w-5 ${activeColor}`} />,
      local_hero: <Users className={`h-5 w-5 ${activeColor}`} />,
      treasure_seeker: <Key className={`h-5 w-5 ${activeColor}`} />,
    };
    return icons[id] || <Compass className="h-5 w-5" />;
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#0B1528] p-4 md:p-12 relative overflow-hidden">
      
      {/* Background Decorative Glow Circles */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-3xl -z-10" />

      {/* Language Toggle in a floating dark button */}
      <div className="absolute right-6 top-6 z-50">
        <LanguageToggle />
      </div>

      {/* Main Dual-Panel Canvas Container - Upgraded to max-w-5xl and min-h-600px */}
      <div className="w-full max-w-5xl bg-white md:bg-gradient-to-r md:from-white md:to-[#F4F7FB] rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[600px] border border-white/10 transition-all duration-300">
        
        {/* ==========================================
            LEFT PANEL: Logo & Title (Brand Showcase)
           ========================================== */}
        <div className="flex-1 flex flex-col items-center justify-center p-10 md:p-16 text-center bg-white border-b md:border-b-0 md:border-r border-slate-100 relative">
          
          {/* Glowing Aura behind Logo */}
          <div className="absolute w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl z-0 pointer-events-none" />
          
          {/* White Card Logo */}
          <div className="w-24 h-24 bg-white rounded-[24px] border border-slate-100 flex items-center justify-center shadow-lg shadow-slate-100/50 relative z-10">
            <Swords className="h-10 w-10 text-emerald-600 animate-pulse" />
          </div>

          <h2 className="text-4xl font-black text-[#0B1528] tracking-widest mt-6 leading-none">
            NUSA QUEST
          </h2>
          <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mt-3.5 max-w-[280px] leading-relaxed">
            Simulasi Penjelajahan Digital &amp; Warisan Budaya Nusantara
          </p>

          {/* Badges with Green Dots */}
          <div className="flex flex-wrap gap-2.5 justify-center mt-8">
            <Badge variant="outline" className="bg-[#EAFDF5] border-emerald-100 text-emerald-800 text-[10px] font-extrabold py-1.5 px-3.5 rounded-full flex items-center gap-1.5 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              BILINGUAL AKTIF
            </Badge>
            <Badge variant="outline" className="bg-[#EBF3FE] border-blue-100 text-blue-800 text-[10px] font-extrabold py-1.5 px-3.5 rounded-full flex items-center gap-1.5 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
              REAL-TIME GPS
            </Badge>
          </div>
        </div>

        {/* ==========================================
            RIGHT PANEL: Play / Onboarding Action Card
           ========================================== */}
        <div className="flex-1 flex items-center justify-center p-8 md:p-12 bg-[#F4F7FB]/50 md:bg-transparent">
          
          {step === 1 ? (
            /* Card size upgraded to max-w-md and p-8 */
            <Card className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-slate-100/50 flex flex-col gap-6 text-center justify-center transition-all duration-300">
              <div className="space-y-1.5">
                <h3 className="text-xl font-black text-[#0B1528] tracking-wide">Siap Bermain?</h3>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  Masukkan nama petualang untuk melanjutkan
                </p>
              </div>

              <div className="space-y-2 text-left pt-2">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="e.g. Wira Nusa"
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    maxLength={15}
                    className="h-12 text-xs border-slate-200 focus-visible:ring-emerald-500 font-semibold bg-slate-50/50 rounded-xl pr-12"
                  />
                  <span className="absolute right-4 top-4 text-[10px] font-bold text-slate-400">
                    {name.length}/15
                  </span>
                </div>
              </div>

              <Button
                onClick={handleNextStep}
                disabled={!name.trim()}
                className="w-full h-12 text-xs font-bold bg-[#0B1528] text-white hover:bg-slate-800 shadow-lg shadow-[#0B1528]/15 rounded-full hover:scale-[1.01] active:scale-95 transition-all tracking-wider flex items-center justify-center gap-2 uppercase cursor-pointer"
              >
                <User className="h-4 w-4" />
                <span>Pilih Karakter</span>
                <ChevronRight className="h-4 w-4" />
              </Button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Aman &amp; Terenkripsi</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>
            </Card>
          ) : (
            /* Card size upgraded to max-w-md and p-7 */
            <Card className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-7 shadow-xl shadow-slate-100/50 flex flex-col gap-5 text-center transition-all duration-300">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-[#0B1528] tracking-wide">Pilih Karakter</h3>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  Setiap karakter memiliki kekuatan unik.
                </p>
              </div>

              {/* Grid height increased to 220px to show 4 items comfortably */}
              <div className="grid grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1.5 scrollbar-thin">
                {CHARACTERS.map((char) => {
                  const isSelected = selectedCharId === char.id;
                  return (
                    <button
                      key={char.id}
                      onClick={() => setSelectedCharId(char.id)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-95 cursor-pointer ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50/50 text-emerald-900 shadow-sm font-extrabold"
                          : "border-slate-100 bg-slate-50/30 text-slate-700 hover:border-slate-200 hover:bg-white"
                      }`}
                    >
                      <div className={`p-2 rounded-lg border transition-all ${
                        isSelected ? "bg-emerald-100/70 border-emerald-200" : "bg-slate-50 border-slate-100"
                      }`}>
                        {getCharacterIcon(char.id, isSelected)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold block truncate">{char.name[lang]}</span>
                        <span className="text-[7px] font-bold text-slate-400 block truncate uppercase tracking-wider mt-0.5">
                          {char.role[lang].replace("Wisatawan", "").replace("Explorer", "")}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* RPG preview detail panel */}
              {selectedCharacter && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-dashed border-emerald-200 space-y-2 text-left shadow-inner">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-800">
                      {selectedCharacter.name[lang]} · <span className="text-emerald-600 font-semibold text-[10px]">{selectedCharacter.role[lang]}</span>
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                      {selectedCharacter.description[lang]}
                    </p>
                  </div>
                  <div className="pt-2.5 border-t border-slate-200/50">
                    <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider block">Kekuatan Khusus</span>
                    <p className="text-[9px] font-bold text-emerald-800 mt-1 flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-emerald-100/50">
                      <span>✨</span>
                      <span>{selectedCharacter.specialPower[lang]}</span>
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-1">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 h-11 text-xs font-bold text-slate-600 bg-white border-slate-200 rounded-full hover:bg-slate-50 cursor-pointer"
                >
                  Kembali
                </Button>
                <Button
                  onClick={handleCompleteOnboarding}
                  disabled={!selectedCharId}
                  className="flex-1 h-11 text-xs font-bold bg-[#0B1528] hover:bg-slate-800 text-white shadow-md rounded-full hover:scale-[1.01] active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
                >
                  Mulai Bermain
                </Button>
              </div>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
