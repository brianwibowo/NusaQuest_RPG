/**
 * NusaQuest RPG — Bottom Navigation Bar
 * Mobile-first bottom tab navigation (5 tabs).
 */

import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, Map, Swords, Gift, User } from "lucide-react";
import { audioManager } from "@/lib/audio";
import { hapticsManager } from "@/lib/haptics";

const NAV_ITEMS = [
  { path: "/", icon: Home, labelKey: "nav.home" },
  { path: "/explore", icon: Map, labelKey: "nav.explore" },
  { path: "/quests", icon: Swords, labelKey: "nav.quests" },
  { path: "/rewards", icon: Gift, labelKey: "nav.rewards" },
  { path: "/profile", icon: User, labelKey: "nav.profile" },
] as const;

export default function BottomNav() {
  const { t } = useTranslation();

  const handleNavClick = () => {
    audioManager.playClick();
    hapticsManager.triggerClick();
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1">
        {NAV_ITEMS.map(({ path, icon: Icon, labelKey }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-2 text-xs transition-colors ${
                isActive
                  ? "text-emerald-600 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span>{t(labelKey)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
