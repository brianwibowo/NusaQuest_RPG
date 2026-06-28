import { Hono } from "hono";
import prisma from "../lib/prisma";
import { authMiddleware, requireAdmin, JWTPayload } from "../middleware/auth";
import { BattleType } from "@prisma/client";
import { mapBattle } from "../lib/mappers";

type Env = {
  Variables: {
    user: JWTPayload;
  };
};

const battleRoutes = new Hono<Env>();

battleRoutes.get("/", async (c) => {
  try {
    const battles = await prisma.battle.findMany({
      include: { questions: { orderBy: { sortOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
    return c.json(battles.map(mapBattle));
  } catch (err: any) {
    return c.json({ error: "Failed to fetch battles: " + err.message }, 500);
  }
});

battleRoutes.get("/quest/:questId", async (c) => {
  const questId = c.req.param("questId");
  try {
    const battle = await prisma.battle.findUnique({
      where: { questId },
      include: { questions: { orderBy: { sortOrder: "asc" } } },
    });
    if (!battle) {
      return c.json({ error: "No battle challenge found for this quest" }, 404);
    }
    return c.json(mapBattle(battle));
  } catch (err: any) {
    return c.json({ error: "Failed to fetch battle: " + err.message }, 500);
  }
});

battleRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const battle = await prisma.battle.findUnique({
      where: { id },
      include: { questions: { orderBy: { sortOrder: "asc" } } },
    });
    if (!battle) {
      return c.json({ error: "Battle not found" }, 404);
    }
    return c.json(mapBattle(battle));
  } catch (err: any) {
    return c.json({ error: "Failed to fetch battle: " + err.message }, 500);
  }
});

battleRoutes.post("/", authMiddleware, requireAdmin, async (c) => {
  try {
    const body = await c.req.json();
    const { id, titleId, titleEn, type, descId, descEn, timeLimit, rewardXp, rewardPoints, passingScore, questId, questions } = body;

    const newBattle = await prisma.battle.create({
      data: {
        id: id || undefined,
        titleId,
        titleEn,
        type: type as BattleType,
        descId,
        descEn,
        timeLimit: timeLimit ? parseInt(timeLimit) : 60,
        rewardXp: rewardXp ? parseInt(rewardXp) : 0,
        rewardPoints: rewardPoints ? parseInt(rewardPoints) : 0,
        passingScore: passingScore ? parseInt(passingScore) : 60,
        questId: questId || null,
        questions: questions ? {
          create: questions.map((q: any, idx: number) => ({
            questionId: q.questionId,
            questionEn: q.questionEn,
            options: q.options,
            correctIndex: parseInt(q.correctIndex),
            explanationId: q.explanationId,
            explanationEn: q.explanationEn,
            sortOrder: q.sortOrder !== undefined ? parseInt(q.sortOrder) : idx,
          }))
        } : undefined,
      },
      include: { questions: true },
    });
    return c.json(newBattle, 201);
  } catch (err: any) {
    return c.json({ error: "Failed to create battle: " + err.message }, 500);
  }
});

battleRoutes.put("/:id", authMiddleware, requireAdmin, async (c) => {
  const id = c.req.param("id");
  try {
    const body = await c.req.json();
    const { titleId, titleEn, type, descId, descEn, timeLimit, rewardXp, rewardPoints, passingScore, questId, questions } = body;

    if (questions) {
      await prisma.battleQuestion.deleteMany({ where: { battleId: id } });
    }

    const updatedBattle = await prisma.battle.update({
      where: { id },
      data: {
        titleId,
        titleEn,
        type: type as BattleType,
        descId,
        descEn,
        timeLimit: timeLimit ? parseInt(timeLimit) : 60,
        rewardXp: rewardXp ? parseInt(rewardXp) : 0,
        rewardPoints: rewardPoints ? parseInt(rewardPoints) : 0,
        passingScore: passingScore ? parseInt(passingScore) : 60,
        questId: questId || null,
        questions: questions ? {
          create: questions.map((q: any, idx: number) => ({
            questionId: q.questionId,
            questionEn: q.questionEn,
            options: q.options,
            correctIndex: parseInt(q.correctIndex),
            explanationId: q.explanationId,
            explanationEn: q.explanationEn,
            sortOrder: q.sortOrder !== undefined ? parseInt(q.sortOrder) : idx,
          }))
        } : undefined,
      },
      include: { questions: true },
    });
    return c.json(updatedBattle);
  } catch (err: any) {
    return c.json({ error: "Failed to update battle: " + err.message }, 500);
  }
});

battleRoutes.delete("/:id", authMiddleware, requireAdmin, async (c) => {
  const id = c.req.param("id");
  try {
    await prisma.battle.delete({
      where: { id },
    });
    return c.json({ message: "Battle deleted successfully" });
  } catch (err: any) {
    return c.json({ error: "Failed to delete battle: " + err.message }, 500);
  }
});

export default battleRoutes;
