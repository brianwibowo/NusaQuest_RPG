import { Hono } from "hono";
import prisma from "../lib/prisma";

const leaderboardRoutes = new Hono();

leaderboardRoutes.get("/", async (c) => {
  try {
    const profiles = await prisma.profile.findMany({
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { level: "desc" },
        { totalPoints: "desc" },
      ],
      take: 20,
    });

    const entries = profiles.map((p, idx) => ({
      rank: idx + 1,
      name: p.user.name,
      characterId: p.characterId,
      level: p.level,
      totalPoints: p.totalPoints,
      questsCompleted: p.completedQuestIds.length,
    }));

    return c.json(entries);
  } catch (err: any) {
    return c.json({ error: "Failed to fetch leaderboard: " + err.message }, 500);
  }
});

export default leaderboardRoutes;
