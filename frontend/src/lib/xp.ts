/**
 * NusaQuest RPG — XP & Level Utility Functions
 * Calculation logic for level progression, XP thresholds, and level-ups.
 */

import { LEVELS, MAX_LEVEL } from "@/data/levels";
import type { LevelDefinition } from "@/types";

// Get level definition for a specific level number
export function getLevelDefinition(level: number): LevelDefinition {
  return LEVELS.find((l) => l.level === level) ?? LEVELS[0];
}

// Calculate the player's level based on cumulative XP
export function calculateLevel(currentXp: number): number {
  let level = 1;
  for (const def of LEVELS) {
    if (currentXp >= def.requiredXp) {
      level = def.level;
    } else {
      break;
    }
  }
  return level;
}

// Get XP needed to reach the NEXT level from current level
export function getXpForNextLevel(currentLevel: number): number {
  if (currentLevel >= MAX_LEVEL) return 0;
  const nextLevel = LEVELS.find((l) => l.level === currentLevel + 1);
  return nextLevel?.requiredXp ?? 0;
}

// Get XP threshold for the current level
export function getXpForCurrentLevel(currentLevel: number): number {
  return getLevelDefinition(currentLevel).requiredXp;
}

// Calculate progress percentage toward next level (0-100)
export function getLevelProgress(currentXp: number, currentLevel: number): number {
  if (currentLevel >= MAX_LEVEL) return 100;

  const currentThreshold = getXpForCurrentLevel(currentLevel);
  const nextThreshold = getXpForNextLevel(currentLevel);
  const xpIntoLevel = currentXp - currentThreshold;
  const xpNeeded = nextThreshold - currentThreshold;

  if (xpNeeded <= 0) return 100;
  return Math.min(100, Math.round((xpIntoLevel / xpNeeded) * 100));
}

// Check if adding XP would trigger a level up
export function checkLevelUp(currentXp: number, xpToAdd: number, currentLevel: number): boolean {
  if (currentLevel >= MAX_LEVEL) return false;
  const newXp = currentXp + xpToAdd;
  return calculateLevel(newXp) > currentLevel;
}
