import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePlayer } from "@/context/PlayerContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { CHARACTERS } from "@/data/characters";
import type { CharacterRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LanguageToggle from "@/components/common/LanguageToggle";
import { Compass, Shield, Utensils, Leaf, Landmark, Users, Key, ChevronRight, User, Settings, LogOut } from "lucide-react";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { player, dispatch } = usePlayer();
  const { user, isAuthenticated, isAdmin, signInWithGoogleToken, signOut } = useAuth();
  const toast = useToast();

  const [name, setName] = useState("");
  const [selectedCharId, setSelectedCharId] = useState<CharacterRole | null>(null);
  const [step, setStep] = useState(1); // 1: Enter Name, 2: Choose Character
  const [showGuide, setShowGuide] = useState(false);
  
  const [googleLoaded, setGoogleLoaded] = useState(false);

  // Poll for window.google to handle async script loading
  useEffect(() => {
    if ((window as any).google) {
      setGoogleLoaded(true);
      return;
    }
    const interval = setInterval(() => {
      if ((window as any).google) {
        setGoogleLoaded(true);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const selectedCharacter = CHARACTERS.find((c) => c.id === selectedCharId);
  const lang = player.language || "id";

  // Pre-fill name from auth profile if authenticated and automatically proceed
  useEffect(() => {
    if (user) {
      // Auto-redirect admin/super_admin to admin panel
      if (user.role === 'admin' || user.role === 'super_admin') {
        navigate('/admin', { replace: true });
        return;
      }
      setName(user.name);
      setStep(2);
    }
  }, [user]);

  // Google GSI button initialization
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "not_set";
    if (clientId !== "not_set" && googleLoaded && !isAuthenticated) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            signInWithGoogleToken(response.credential)
              .then(() => {
                toast.success(lang === "id" ? "Login Google berhasil!" : "Google Login successful!");
              })
              .catch((err) => {
                toast.error(lang === "id" ? "Login gagal: " + err.message : "Login failed: " + err.message);
              });
          },
        });
        (window as any).google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { theme: "outline", size: "large", width: 280 }
        );
      } catch (err) {
        console.error("GSI initialization error:", err);
      }
    }
  }, [isAuthenticated, googleLoaded]);

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
      toast.success(lang === "id" ? "Petualangan dimulai! Selamat jalan!" : "Adventure started! Safe travels!");
      navigate("/");
    }
  };

  const getCharacterIcon = (id: CharacterRole, isActive: boolean) => {
    const activeColor = isActive ? "text-emerald-700" : "text-slate-500";
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
      <div className="min-h-dvh w-full flex flex-col md:flex-row bg-[#F8F7F4] overflow-hidden font-sans select-none relative">
        
        {/* Floating Language Toggle */}
        <div className="absolute top-6 right-6 z-30">
          <LanguageToggle />
        </div>

        {/* 1. LEFT SIDE: LARGE CHARACTER ARTWORK DISPLAY (50% Desktop / 35dvh Mobile) */}
        <div className="w-full h-[35dvh] md:h-dvh md:w-[45%] lg:w-[50%] flex-shrink-0 bg-[#FAF8F5] border-b md:border-b-0 md:border-r border-[#E5E0D5] relative flex items-center justify-center p-6 md:p-12 overflow-hidden">
          
          {/* Subtle background glow effect behind character */}
          <div className="absolute w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none z-0" />
          
          {selectedCharacter ? (
            <div key={selectedCharacter.id} className="relative z-10 flex flex-col items-center justify-center h-full w-full transition-all duration-500 animate-in fade-in zoom-in-95">
              <img
                src={selectedCharacter.avatarUrl}
                alt={selectedCharacter.name[lang]}
                className="w-full max-w-[280px] md:max-w-[400px] h-[80%] md:h-[80%] object-contain drop-shadow-[0_8px_32px_rgba(16,185,129,0.2)] transition-transform hover:scale-105 duration-500 filter brightness-105"
              />
              <span className="hidden md:block absolute bottom-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                {selectedCharacter.name[lang]} · Spotlight
              </span>
            </div>
          ) : (
            <div className="text-slate-400 text-xs font-semibold z-10">
              {t("onboarding.character_spotlight")}
            </div>
          )}
        </div>

        {/* 2. RIGHT SIDE: SELECTION LIST & DETAILS (50% Desktop / 65dvh Mobile) */}
        <div className="w-full h-[65dvh] md:h-dvh md:w-[55%] lg:w-[50%] bg-[#F8F7F4] flex flex-col justify-between p-6 md:p-12 overflow-y-auto scrollbar-thin scrollbar-thumb-[#E5E0D5] relative z-10 border-l border-[#E5E0D5] shadow-lg">
          
          {/* Main content flow */}
          <div className="space-y-6 flex-1 flex flex-col justify-center max-w-xl mx-auto w-full">
            
            {/* Header */}
            <div className="space-y-1.5 text-left pt-2">
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-widest uppercase">
                {t("onboarding.choose_character")}
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                {t("onboarding.choose_character_desc")}
              </p>
            </div>

            {/* Selection Grid (2 columns on desktop/tablet, 1-2 columns on small screens) */}
            <div className="grid grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-[#E5E0D5] text-left w-full">
              {CHARACTERS.map((char) => {
                const isSelected = selectedCharId === char.id;
                return (
                  <button
                    key={char.id}
                    onClick={() => setSelectedCharId(char.id)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-left cursor-pointer transition-all hover:scale-[1.01] active:scale-95 duration-200 ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-md ring-1 ring-emerald-500/25"
                        : "border-[#E5E0D5] bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`p-2 rounded-xl border transition-all ${
                      isSelected ? "bg-emerald-100 border-emerald-300 text-emerald-700" : "bg-slate-50 border-slate-100 text-slate-500"
                    }`}>
                      {getCharacterIcon(char.id, isSelected)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold block truncate">{char.name[lang]}</span>
                      <span className="text-[9px] font-semibold text-slate-500 block truncate uppercase tracking-wider mt-0.5">
                        {char.role[lang].replace("Wisatawan", "").replace("Explorer", "")}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected character detail preview */}
            {selectedCharacter && (
              <div className="p-4 md:p-5 rounded-2xl bg-white border border-[#E5E0D5] flex gap-4 text-left shadow-sm items-start w-full transition-all duration-300">
                <div className="min-w-0 flex-1 space-y-2.5">
                  <div>
                    <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <span>{selectedCharacter.name[lang]}</span>
                      <span className="text-slate-400 font-normal text-sm">·</span>
                      <span className="text-emerald-600 font-extrabold text-xs uppercase tracking-wider">
                        {selectedCharacter.role[lang]}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium mt-1">
                      {selectedCharacter.description[lang]}
                    </p>
                  </div>
                  
                  <div className="pt-2.5 border-t border-[#E5E0D5] space-y-1">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">
                      {t("onboarding.special_power")}
                    </span>
                    <div className="text-xs font-extrabold text-emerald-800 flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 w-fit">
                      <span>✨</span>
                      <span>{selectedCharacter.specialPower[lang]}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2 w-full max-w-sm pt-2">
              <div className="flex gap-4 w-full">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 h-11 text-xs font-bold text-slate-700 bg-white border-[#E5E0D5] rounded-full hover:bg-slate-50 cursor-pointer"
                >
                  {t("common.back")}
                </Button>
                <Button
                  onClick={handleCompleteOnboarding}
                  disabled={!selectedCharId}
                  className="flex-1 h-11 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md rounded-full hover:scale-[1.01] active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
                >
                  {t("onboarding.start_adventure")}
                </Button>
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowGuide(true)}
                className="w-full h-9 text-[10px] font-extrabold text-emerald-600 hover:text-emerald-700 tracking-wider uppercase cursor-pointer"
              >
                📖 {t("onboarding.read_guide")}
              </Button>
            </div>

          </div>

          {/* Footer of Sidebar */}
          <div className="space-y-3 pt-4 border-t border-[#E5E0D5] flex-shrink-0 w-full text-center">
            <div className="flex justify-center gap-4">
              <span className="text-[8px] font-bold text-slate-500 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> BILINGUAL AKTIF
              </span>
              <span className="text-[8px] font-bold text-slate-500 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> REAL-TIME GPS
              </span>
            </div>
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">
              Aman &amp; Terenkripsi
            </p>
          </div>

        </div>

        {/* Guide Modal Overlay */}
        {showGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white border border-[#E5E0D5] rounded-3xl max-w-md w-full p-6 text-left space-y-4 shadow-2xl relative">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <span>📖</span>
                <span>{t("onboarding.guide_title")}</span>
              </h3>
              
              <div className="text-xs text-slate-600 space-y-3 font-semibold leading-relaxed">
                <p>{t("onboarding.guide_welcome")}</p>
                <ol className="list-decimal pl-4 space-y-2">
                  <li>
                    <strong className="text-emerald-700">{t("onboarding.guide_step1_title")}:</strong> {t("onboarding.guide_step1_desc")}
                  </li>
                  <li>
                    <strong className="text-emerald-700">{t("onboarding.guide_step2_title")}:</strong> {t("onboarding.guide_step2_desc")}
                  </li>
                  <li>
                    <strong className="text-emerald-700">{t("onboarding.guide_step3_title")}:</strong> {t("onboarding.guide_step3_desc")}
                  </li>
                  <li>
                    <strong className="text-emerald-700">{t("onboarding.guide_step4_title")}:</strong> {t("onboarding.guide_step4_desc")}
                  </li>
                </ol>
                <p className="text-[10px] text-slate-500 italic mt-2">
                  {t("onboarding.guide_footer")}
                </p>
              </div>

              <Button
                onClick={() => setShowGuide(false)}
                className="w-full h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl uppercase tracking-wider cursor-pointer shadow-sm"
              >
                {t("onboarding.guide_close")}
              </Button>
            </div>
          </div>
        )}

      </div>
    );
  }

  return (
    <div className="min-h-dvh w-full flex items-center justify-center p-4 bg-[#F8F7F4] font-sans select-none relative overflow-hidden">
      
      {/* 1. Full Screen Hero Background (Sharp and cover-fit) */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/ui/onboarding_hero.png" 
          alt="Adventure Backdrop" 
          className="w-full h-full object-cover pointer-events-none select-none filter brightness-95"
        />
        <div className="absolute inset-0 bg-slate-950/20 z-0" />
      </div>

      {/* Floating Language Toggle (Top Right of Screen) */}
      <div className="absolute top-4 right-4 z-25">
        <LanguageToggle />
      </div>

      {/* 2. CENTERED FLOATING GLASSMORPHIC CARD */}
      <div className="w-full max-w-sm bg-white/90 backdrop-blur-md rounded-3xl border border-white/50 p-6 md:p-8 shadow-2xl flex flex-col items-center justify-between gap-6 relative z-10 animate-fade-in">
        
        {/* Top Header of Card */}
        <div className="flex flex-col items-center text-center space-y-4 w-full">
          <img 
            src="/images/ui/logo.jpeg" 
            alt="SinopiQuest Logo" 
            className="w-24 h-24 object-contain rounded-full border-2 border-emerald-500/20 bg-white p-1.5 shadow-md transition-transform hover:scale-105 duration-300" 
          />
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-800 tracking-widest leading-none">
              SINOPI QUEST
            </h2>
            <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest">
              {t("app.tagline")}
            </p>
          </div>
        </div>

        {/* Middle Form / Content Area */}
        <div className="w-full flex flex-col gap-5 text-center items-center">
          
          {isAuthenticated && user ? (
            /* Authenticated User Preview Card */
            <div className="w-full bg-white/50 border border-slate-200/50 p-4 rounded-2xl text-left space-y-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-black text-emerald-600">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-800 block truncate">{user.name}</span>
                  <span className="text-[9px] font-bold text-slate-500 block truncate">{user.email}</span>
                </div>
                <BadgeRole role={user.role} />
              </div>
              
              <div className="flex gap-2 pt-1">
                {isAdmin && (
                  <Button
                    onClick={() => navigate("/admin")}
                    className="flex-1 h-9 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center gap-1.5 uppercase tracking-wider shadow-sm"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    <span>Panel Admin</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
                      signOut();
                    }
                  }}
                  className="h-9 text-[10px] font-bold text-slate-700 border-slate-200 bg-white hover:bg-slate-50 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>{t("onboarding.logout")}</span>
                </Button>
              </div>
            </div>
          ) : (
            /* Sign In Buttons Trigger */
            <div className="w-full space-y-4 flex flex-col items-center">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-800">{t("onboarding.please_signin")}</h3>
                <p className="text-[10px] text-slate-500 font-semibold leading-relaxed max-w-[240px] mx-auto">
                  {t("onboarding.signin_desc")}
                </p>
              </div>

              {/* Google GSI button container */}
              <div id="google-signin-btn" className="w-fit" />
            </div>
          )}

          {/* Primary Proceed Action - Only show if authenticated */}
          {isAuthenticated && (
            <div className="space-y-3 w-full border-t border-slate-200/50 pt-4">
              <div className="space-y-1">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {t("onboarding.confirm_name")}
                </h3>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="e.g. Wira Nusa"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={15}
                    disabled={isAuthenticated}
                    className="h-11 text-center text-xs border-slate-200 focus-visible:ring-emerald-500 font-semibold bg-white rounded-xl pr-10 pl-4 text-slate-800 placeholder:text-slate-400 disabled:opacity-85 shadow-inner"
                  />
                  <span className="absolute right-4 top-3.5 text-[9px] font-bold text-slate-400">
                    {name.length}/15
                  </span>
                </div>
              </div>

              <Button
                onClick={handleNextStep}
                disabled={!name.trim()}
                className="w-full h-11 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md rounded-full hover:scale-[1.01] active:scale-95 transition-all tracking-wider flex items-center justify-center gap-2 uppercase cursor-pointer"
              >
                <User className="h-4 w-4" />
                <span>{t("onboarding.choose_character")}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Bottom of Card (Footer) */}
        <div className="w-full border-t border-slate-200/50 pt-4 text-center space-y-2">
          <div className="flex justify-center gap-4">
            <span className="text-[8px] font-bold text-slate-500 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> BILINGUAL AKTIF
            </span>
            <span className="text-[8px] font-bold text-slate-500 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> REAL-TIME GPS
            </span>
          </div>
          <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">
            Aman &amp; Terenkripsi
          </p>
        </div>

      </div>

    </div>
  );
}

// Inline role helper badge component
function BadgeRole({ role }: { role: "super_admin" | "admin" | "user" }) {
  if (role === "super_admin") {
    return <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase">Super Admin</span>;
  }
  if (role === "admin") {
    return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase">Admin</span>;
  }
  return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase">User</span>;
}
