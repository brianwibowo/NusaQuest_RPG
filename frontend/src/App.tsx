/**
 * NusaQuest RPG — App Router & Root Layout
 * Defines all routes and wraps the app with providers.
 */

import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { usePlayer } from "@/context/PlayerContext";
import { useAuth } from "@/context/AuthContext";
import AppShell from "@/components/layout/AppShell";
import { audioManager } from "@/lib/audio";

// Pages
import OnboardingPage from "@/pages/OnboardingPage";
import HomePage from "@/pages/HomePage";
import ExploreMapPage from "@/pages/ExploreMapPage";
import QuestsPage from "@/pages/QuestsPage";
import QuestDetailPage from "@/pages/QuestDetailPage";
import CharacterPage from "@/pages/CharacterPage";
import RewardsPage from "@/pages/RewardsPage";
import StoryPage from "@/pages/StoryPage";
import StoryDetailPage from "@/pages/StoryDetailPage";
import UmkmPage from "@/pages/UmkmPage";
import UmkmDetailPage from "@/pages/UmkmDetailPage";
import LeaderboardPage from "@/pages/LeaderboardPage";
import ProfilePage from "@/pages/ProfilePage";

// Admin Pages
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminLocations from "@/pages/admin/AdminLocations";
import AdminQuests from "@/pages/admin/AdminQuests";
import AdminStories from "@/pages/admin/AdminStories";
import AdminUmkm from "@/pages/admin/AdminUmkm";
import AdminSongs from "@/pages/admin/AdminSongs";
import AdminUsers from "@/pages/admin/AdminUsers";

// Guard: redirect to onboarding if not completed
function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const { player } = usePlayer();
  if (!player.hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}

// Guard: redirect to home if not admin
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const { player } = usePlayer();

  useEffect(() => {
    // Only play BGM if user has completed onboarding (so BGM starts in active game)
    if (player.hasCompletedOnboarding) {
      audioManager.playBgm();
    }
    return () => {
      audioManager.stopBgm();
    };
  }, [player.hasCompletedOnboarding]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Onboarding — no shell/nav */}
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Main app — wrapped in AppShell with header + bottom nav */}
        <Route
          element={
            <RequireOnboarding>
              <AppShell />
            </RequireOnboarding>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="explore" element={<ExploreMapPage />} />
          <Route path="quests" element={<QuestsPage />} />
          <Route path="quests/:questId" element={<QuestDetailPage />} />
          <Route path="character" element={<CharacterPage />} />
          <Route path="rewards" element={<RewardsPage />} />
          <Route path="story" element={<StoryPage />} />
          <Route path="story/:storyId" element={<StoryDetailPage />} />
          <Route path="umkm" element={<UmkmPage />} />
          <Route path="umkm/:umkmId" element={<UmkmDetailPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Admin Dashboard — restricted access */}
        <Route
          path="admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="locations" element={<AdminLocations />} />
          <Route path="quests" element={<AdminQuests />} />
          <Route path="stories" element={<AdminStories />} />
          <Route path="umkm" element={<AdminUmkm />} />
          <Route path="songs" element={<AdminSongs />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
