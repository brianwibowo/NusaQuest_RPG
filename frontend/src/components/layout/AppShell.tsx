/**
 * NusaQuest RPG — App Shell Layout
 * Wraps all pages with Header + scrollable content area + BottomNav.
 */

import { Outlet } from "react-router-dom";
import Header from "./Header";
import BottomNav from "./BottomNav";

export default function AppShell() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-20 pt-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
