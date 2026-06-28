import { Hono } from "hono";
import prisma from "../lib/prisma";
import { authMiddleware, JWTPayload } from "../middleware/auth";

type Env = {
  Variables: {
    user: JWTPayload;
  };
};

const progressRoutes = new Hono<Env>();

progressRoutes.get("/", authMiddleware, async (c) => {
  const user = c.get("user");
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.userId },
    });
    if (!profile) {
      return c.json({ error: "Profile not found" }, 404);
    }
    return c.json(profile);
  } catch (err: any) {
    return c.json({ error: "Failed to fetch progress: " + err.message }, 500);
  }
});

progressRoutes.post("/", authMiddleware, async (c) => {
  const user = c.get("user");
  try {
    const body = await c.req.json();
    const { characterId, level, currentXp, totalPoints, gold, language, completedQuestIds, activeQuestIds, obtainedBadgeIds, obtainedRewardIds, unlockedStoryIds } = body;

    const profile = await prisma.profile.upsert({
      where: { userId: user.userId },
      create: {
        userId: user.userId,
        characterId: characterId || "explorer",
        level: level ? parseInt(level) : 1,
        currentXp: currentXp ? parseInt(currentXp) : 0,
        totalPoints: totalPoints ? parseInt(totalPoints) : 0,
        gold: gold ? parseInt(gold) : 100,
        language: language || "id",
        completedQuestIds: completedQuestIds || [],
        activeQuestIds: activeQuestIds || [],
        obtainedBadgeIds: obtainedBadgeIds || [],
        obtainedRewardIds: obtainedRewardIds || [],
        unlockedStoryIds: unlockedStoryIds || [],
      },
      update: {
        characterId,
        level: level !== undefined ? parseInt(level) : undefined,
        currentXp: currentXp !== undefined ? parseInt(currentXp) : undefined,
        totalPoints: totalPoints !== undefined ? parseInt(totalPoints) : undefined,
        gold: gold !== undefined ? parseInt(gold) : undefined,
        language,
        completedQuestIds,
        activeQuestIds,
        obtainedBadgeIds,
        obtainedRewardIds,
        unlockedStoryIds,
      },
    });

    return c.json(profile);
  } catch (err: any) {
    return c.json({ error: "Failed to save progress: " + err.message }, 500);
  }
});

export default progressRoutes;
