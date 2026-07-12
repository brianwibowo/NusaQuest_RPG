import { Hono } from "hono";
import prisma from "../lib/prisma";
import { authMiddleware, requireAdmin, JWTPayload } from "../middleware/auth";
import { QuestType, QuestDifficulty, ObjectiveType } from "@prisma/client";
import { mapQuest } from "../lib/mappers";
import { translateToEnglish } from "../lib/translate";

type Env = {
  Variables: {
    user: JWTPayload;
  };
};

const questRoutes = new Hono<Env>();

questRoutes.get("/", async (c) => {
  const levelQuery = c.req.query("level");
  try {
    const whereClause: any = {};
    if (levelQuery) {
      const level = parseInt(levelQuery);
      whereClause.availableLevels = { has: level };
    }

    const quests = await prisma.quest.findMany({
      where: whereClause,
      include: {
        objectives: { orderBy: { sortOrder: "asc" } },
        reward: true,
        location: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return c.json(quests.map(mapQuest));
  } catch (err: any) {
    return c.json({ error: "Failed to fetch quests: " + err.message }, 500);
  }
});

questRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const quest = await prisma.quest.findUnique({
      where: { id },
      include: {
        objectives: { orderBy: { sortOrder: "asc" } },
        reward: true,
        location: true,
        battle: {
          include: { questions: { orderBy: { sortOrder: "asc" } } }
        },
      },
    });
    if (!quest) {
      return c.json({ error: "Quest not found" }, 404);
    }
    return c.json(mapQuest(quest));
  } catch (err: any) {
    return c.json({ error: "Failed to fetch quest: " + err.message }, 500);
  }
});

questRoutes.post("/", authMiddleware, requireAdmin, async (c) => {
  try {
    const body = await c.req.json();
    const {
      id,
      titleId,
      titleEn,
      descId,
      descEn,
      type,
      difficulty,
      requiredLevel,
      availableLevels,
      estimatedTimeId,
      estimatedTimeEn,
      imageUrl,
      locationId,
      relatedUmkmId,
      objectives,
      reward,
      battleId,
    } = body;

    // Validasi field wajib
    if (!titleId || !descId || !type || !difficulty || !locationId) {
      return c.json({ error: "Field wajib belum lengkap: titleId, descId, type, difficulty, locationId" }, 400);
    }

    if (id) {
      const existing = await prisma.quest.findUnique({ where: { id } });
      if (existing) return c.json({ error: "Misi dengan ID tersebut sudah ada" }, 409);
    }

    const resolvedTitleEn = titleEn || await translateToEnglish(titleId);
    const resolvedDescEn = descEn || await translateToEnglish(descId);
    const resolvedEstimatedTimeEn = estimatedTimeEn || (estimatedTimeId ? await translateToEnglish(estimatedTimeId) : null);

    const resolvedObjectives = objectives
      ? await Promise.all(
          objectives.map(async (obj: any, idx: number) => ({
            descId: obj.descId,
            descEn: obj.descEn || await translateToEnglish(obj.descId),
            type: obj.type as ObjectiveType,
            sortOrder: obj.sortOrder !== undefined ? parseInt(obj.sortOrder) : idx,
          }))
        )
      : undefined;

    const newQuest = await prisma.quest.create({
      data: {
        id: id || undefined,
        titleId,
        titleEn: resolvedTitleEn,
        descId,
        descEn: resolvedDescEn,
        type: type as QuestType,
        difficulty: difficulty as QuestDifficulty,
        requiredLevel: requiredLevel ? parseInt(requiredLevel) : 1,
        availableLevels: availableLevels ? availableLevels.map((l: any) => parseInt(l)) : [1],
        estimatedTimeId,
        estimatedTimeEn: resolvedEstimatedTimeEn,
        imageUrl,
        locationId,
        relatedUmkmId,
        reward: reward ? {
          create: {
            xp: reward.xp ? parseInt(reward.xp) : 0,
            points: reward.points ? parseInt(reward.points) : 0,
            badgeId: reward.badgeId || null,
            voucherId: reward.voucherId || null,
            collectibleId: reward.collectibleId || null,
            storyUnlockId: reward.storyUnlockId || null,
          }
        } : undefined,
        objectives: resolvedObjectives ? {
          create: resolvedObjectives
        } : undefined
      },
      include: {
        objectives: true,
        reward: true,
      }
    });

    if (battleId) {
      await prisma.battle.update({
        where: { id: battleId },
        data: { questId: newQuest.id }
      });
    }

    return c.json(newQuest, 201);
  } catch (err: any) {
    if (err.code === "P2002") return c.json({ error: "Misi dengan ID tersebut sudah ada" }, 409);
    return c.json({ error: "Failed to create quest: " + err.message }, 500);
  }
});

questRoutes.put("/:id", authMiddleware, requireAdmin, async (c) => {
  const id = c.req.param("id");
  try {
    const body = await c.req.json();
    const {
      titleId,
      titleEn,
      descId,
      descEn,
      type,
      difficulty,
      requiredLevel,
      availableLevels,
      estimatedTimeId,
      estimatedTimeEn,
      imageUrl,
      locationId,
      relatedUmkmId,
      objectives,
      reward,
      battleId,
    } = body;

    // Validasi field wajib
    if (!titleId || !descId || !type || !difficulty || !locationId) {
      return c.json({ error: "Field wajib belum lengkap: titleId, descId, type, difficulty, locationId" }, 400);
    }

    if (objectives) {
      await prisma.questObjective.deleteMany({ where: { questId: id } });
    }

    const resolvedTitleEn = titleEn || await translateToEnglish(titleId);
    const resolvedDescEn = descEn || await translateToEnglish(descId);
    const resolvedEstimatedTimeEn = estimatedTimeEn || (estimatedTimeId ? await translateToEnglish(estimatedTimeId) : null);

    const resolvedObjectives = objectives
      ? await Promise.all(
          objectives.map(async (obj: any, idx: number) => ({
            descId: obj.descId,
            descEn: obj.descEn || await translateToEnglish(obj.descId),
            type: obj.type as ObjectiveType,
            sortOrder: obj.sortOrder !== undefined ? parseInt(obj.sortOrder) : idx,
          }))
        )
      : undefined;

    const updatedQuest = await prisma.quest.update({
      where: { id },
      data: {
        titleId,
        titleEn: resolvedTitleEn,
        descId,
        descEn: resolvedDescEn,
        type: type as QuestType,
        difficulty: difficulty as QuestDifficulty,
        requiredLevel: requiredLevel ? parseInt(requiredLevel) : 1,
        availableLevels: availableLevels ? availableLevels.map((l: any) => parseInt(l)) : [1],
        estimatedTimeId,
        estimatedTimeEn: resolvedEstimatedTimeEn,
        imageUrl,
        locationId,
        relatedUmkmId,
        reward: reward ? {
          upsert: {
            create: {
              xp: reward.xp ? parseInt(reward.xp) : 0,
              points: reward.points ? parseInt(reward.points) : 0,
              badgeId: reward.badgeId || null,
              voucherId: reward.voucherId || null,
              collectibleId: reward.collectibleId || null,
              storyUnlockId: reward.storyUnlockId || null,
            },
            update: {
              xp: reward.xp ? parseInt(reward.xp) : 0,
              points: reward.points ? parseInt(reward.points) : 0,
              badgeId: reward.badgeId || null,
              voucherId: reward.voucherId || null,
              collectibleId: reward.collectibleId || null,
              storyUnlockId: reward.storyUnlockId || null,
            }
          }
        } : undefined,
        objectives: resolvedObjectives ? {
          create: resolvedObjectives
        } : undefined
      },
      include: {
        objectives: true,
        reward: true,
      }
    });

    if (battleId) {
      await prisma.battle.update({
        where: { id: battleId },
        data: { questId: id }
      });
    }

    return c.json(updatedQuest);
  } catch (err: any) {
    if (err.code === "P2025") return c.json({ error: "Misi tidak ditemukan" }, 404);
    return c.json({ error: "Failed to update quest: " + err.message }, 500);
  }
});

questRoutes.delete("/:id", authMiddleware, requireAdmin, async (c) => {
  const id = c.req.param("id");
  try {
    await prisma.quest.delete({
      where: { id },
    });
    return c.json({ message: "Quest deleted successfully" });
  } catch (err: any) {
    return c.json({ error: "Failed to delete quest: " + err.message }, 500);
  }
});

export default questRoutes;
