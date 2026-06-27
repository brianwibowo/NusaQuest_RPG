/**
 * NusaQuest RPG — App Router & Root Layout
 * Defines all routes and wraps the app with providers.
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { usePlayer } from "@/context/PlayerContext";
import AppShell from "@/components/layout/AppShell";

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

// Guard: redirect to onboarding if not completed
function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const { player } = usePlayer();
  if (!player.hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}

export default function App() {
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
