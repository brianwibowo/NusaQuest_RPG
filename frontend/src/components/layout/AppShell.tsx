/**
 * NusaQuest RPG — App Shell Layout
 * Wraps all pages with Header + scrollable content area + BottomNav.
 */

import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";

export default function AppShell() {
  const location = useLocation();
  const path = location.pathname;

  // Determine dynamic gradient accent background depending on active menu route
  let themeGradient = "bg-background"; // Default fallback
  
  if (path === "/" || path === "/home") {
    // Nature green tint for lobby/home
    themeGradient = "bg-gradient-to-b from-emerald-100/30 via-emerald-50/5 to-background dark:from-emerald-950/15 dark:via-emerald-950/2 dark:to-background";
  } else if (path.startsWith("/explore")) {
    // Water/adventure blue tint for tactical map
    themeGradient = "bg-gradient-to-b from-sky-100/30 via-sky-50/5 to-background dark:from-sky-950/15 dark:via-sky-950/2 dark:to-background";
  } else if (path.startsWith("/quests")) {
    // Bronze/combat amber tint for quest board
    themeGradient = "bg-gradient-to-b from-amber-100/35 via-amber-50/5 to-background dark:from-amber-950/15 dark:via-amber-950/2 dark:to-background";
  } else if (path.startsWith("/character") || path.startsWith("/profile")) {
    // Stats/magic purple tint for player sheet
    themeGradient = "bg-gradient-to-b from-purple-100/30 via-purple-50/5 to-background dark:from-purple-950/15 dark:via-purple-950/2 dark:to-background";
  } else if (path.startsWith("/rewards")) {
    // Golden tint for rewards shop
    themeGradient = "bg-gradient-to-b from-yellow-100/30 via-yellow-50/5 to-background dark:from-yellow-950/15 dark:via-yellow-950/2 dark:to-background";
  } else if (path.startsWith("/story")) {
    // Parchment orange tint for story chronicles
    themeGradient = "bg-gradient-to-b from-orange-100/30 via-orange-50/5 to-background dark:from-orange-950/15 dark:via-orange-950/2 dark:to-background";
  } else if (path.startsWith("/umkm")) {
    // Local business rose clay tint for merchants
    themeGradient = "bg-gradient-to-b from-rose-100/30 via-rose-50/5 to-background dark:from-rose-950/15 dark:via-rose-950/2 dark:to-background";
  } else if (path.startsWith("/leaderboard")) {
    // Victory slate/silver tint for rankings
    themeGradient = "bg-gradient-to-b from-slate-200/30 via-slate-100/5 to-background dark:from-slate-800/15 dark:via-slate-800/2 dark:to-background";
  }

  return (
    <div className={`flex min-h-dvh flex-col ${themeGradient} transition-colors duration-500`}>
      <Header />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-20 pt-4 relative z-10">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
