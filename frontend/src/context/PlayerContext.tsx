/**
 * NusaQuest RPG — Player Context
 * Central game state managed with useReducer + localStorage persistence.
 * All game actions (start quest, complete objective, gain XP, etc.) go through here.
 */

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";
import type { PlayerState, AppLanguage, CharacterRole } from "@/types";
import { calculateLevel } from "@/lib/xp";
import { useAuth } from "@/context/AuthContext";

// ─── Default State ───────────────────────────────────────────────
const STORAGE_KEY = "nusaquest_player";

const DEFAULT_STATE: PlayerState = {
  name: "",
  selectedCharacterId: null,
  level: 1,
  currentXp: 0,
  totalPoints: 0,
  gold: 100,
  completedQuestIds: [],
  activeQuestIds: [],
  obtainedBadgeIds: [],
  obtainedRewardIds: ["badge_starter"],
  unlockedStoryIds: [],
  selectedDestination: "jakarta",
  language: "id",
  hasCompletedOnboarding: false,
};

// ─── Actions ─────────────────────────────────────────────────────
type PlayerAction =
  | { type: "COMPLETE_ONBOARDING"; name: string; characterId: CharacterRole }
  | { type: "SET_LANGUAGE"; language: AppLanguage }
  | { type: "START_QUEST"; questId: string }
  | { type: "COMPLETE_OBJECTIVE"; questId: string; objectiveId: string }
  | { type: "COMPLETE_QUEST"; questId: string }
  | { type: "GAIN_XP"; amount: number }
  | { type: "GAIN_POINTS"; amount: number }
  | { type: "SPEND_POINTS"; amount: number }
  | { type: "OBTAIN_BADGE"; badgeId: string }
  | { type: "OBTAIN_REWARD"; rewardId: string }
  | { type: "UNLOCK_STORY"; storyId: string }
  | { type: "RESET_GAME" }
  | { type: "LOAD_STATE"; payload: Partial<PlayerState> };

// ─── Reducer ─────────────────────────────────────────────────────
function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case "COMPLETE_ONBOARDING":
      return {
        ...state,
        name: action.name,
        selectedCharacterId: action.characterId,
        hasCompletedOnboarding: true,
      };

    case "SET_LANGUAGE":
      return { ...state, language: action.language };

    case "START_QUEST":
      if (state.activeQuestIds.includes(action.questId)) return state;
      return {
        ...state,
        activeQuestIds: [...state.activeQuestIds, action.questId],
      };

    case "COMPLETE_OBJECTIVE":
      // Objectives are tracked in quest data, not in player state.
      // This action exists for future integration with backend.
      return state;

    case "COMPLETE_QUEST":
      if (state.completedQuestIds.includes(action.questId)) return state;
      return {
        ...state,
        completedQuestIds: [...state.completedQuestIds, action.questId],
        activeQuestIds: state.activeQuestIds.filter((id) => id !== action.questId),
      };

    case "GAIN_XP": {
      const newXp = state.currentXp + action.amount;
      const newLevel = calculateLevel(newXp);
      return { ...state, currentXp: newXp, level: newLevel };
    }

    case "GAIN_POINTS":
      return { ...state, totalPoints: state.totalPoints + action.amount };

    case "SPEND_POINTS":
      return {
        ...state,
        totalPoints: Math.max(0, state.totalPoints - action.amount),
      };

    case "OBTAIN_BADGE":
      if (state.obtainedBadgeIds.includes(action.badgeId)) return state;
      return {
        ...state,
        obtainedBadgeIds: [...state.obtainedBadgeIds, action.badgeId],
      };

    case "OBTAIN_REWARD":
      if (state.obtainedRewardIds.includes(action.rewardId)) return state;
      return {
        ...state,
        obtainedRewardIds: [...state.obtainedRewardIds, action.rewardId],
      };

    case "UNLOCK_STORY":
      if (state.unlockedStoryIds.includes(action.storyId)) return state;
      return {
        ...state,
        unlockedStoryIds: [...state.unlockedStoryIds, action.storyId],
      };

    case "RESET_GAME":
      return { ...DEFAULT_STATE };

    case "LOAD_STATE":
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────
interface PlayerContextValue {
  player: PlayerState;
  dispatch: React.Dispatch<PlayerAction>;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

// ─── Load from localStorage ──────────────────────────────────────
function loadState(): PlayerState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<PlayerState>;
      return { ...DEFAULT_STATE, ...parsed };
    }
  } catch {
    console.warn("Failed to load player state from localStorage");
  }
  return DEFAULT_STATE;
}

// ─── Provider ────────────────────────────────────────────────────
export function PlayerProvider({ children }: { children: ReactNode }) {
  const [player, dispatch] = useReducer(playerReducer, null, loadState);
  const { isAuthenticated } = useAuth();

  const syncToDb = (stateToSend = player) => {
    const token = localStorage.getItem("nusaquest_token");
    if (!token) return;

    fetch("/api/progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        characterId: stateToSend.selectedCharacterId,
        level: stateToSend.level,
        currentXp: stateToSend.currentXp,
        totalPoints: stateToSend.totalPoints,
        gold: stateToSend.gold,
        language: stateToSend.language,
        completedQuestIds: stateToSend.completedQuestIds,
        activeQuestIds: stateToSend.activeQuestIds,
        obtainedBadgeIds: stateToSend.obtainedBadgeIds,
        obtainedRewardIds: stateToSend.obtainedRewardIds,
        unlockedStoryIds: stateToSend.unlockedStoryIds
      })
    }).catch((err) => console.error("Failed to sync progress to DB", err));
  };

  // Load from DB when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem("nusaquest_token");
    if (!token) return;

    fetch("/api/progress", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (res.ok) return res.json();
        if (res.status === 404) {
          // If profile doesn't exist on server yet, upload local progress immediately
          syncToDb(player);
        }
        return null;
      })
      .then((dbProfile) => {
        if (dbProfile) {
          dispatch({
            type: "LOAD_STATE",
            payload: {
              selectedCharacterId: dbProfile.characterId,
              level: dbProfile.level,
              currentXp: dbProfile.currentXp,
              totalPoints: dbProfile.totalPoints,
              gold: dbProfile.gold,
              language: dbProfile.language,
              completedQuestIds: dbProfile.completedQuestIds || [],
              activeQuestIds: dbProfile.activeQuestIds || [],
              obtainedBadgeIds: dbProfile.obtainedBadgeIds || [],
              obtainedRewardIds: dbProfile.obtainedRewardIds || [],
              unlockedStoryIds: dbProfile.unlockedStoryIds || [],
              hasCompletedOnboarding: true
            }
          });
        }
      })
      .catch((err) => console.error("Failed to fetch progress from server:", err));
  }, [isAuthenticated]);

  // Persist locally and sync changes to DB
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
    } catch {
      console.warn("Failed to save player state to localStorage");
    }

    if (isAuthenticated) {
      syncToDb(player);
    }
  }, [player, isAuthenticated]);

  return (
    <PlayerContext.Provider value={{ player, dispatch }}>
      {children}
    </PlayerContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────
export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}

export type { PlayerAction };
