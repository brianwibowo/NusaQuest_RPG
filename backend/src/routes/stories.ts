import { Hono } from "hono";
import prisma from "../lib/prisma";
import { authMiddleware, requireAdmin, JWTPayload } from "../middleware/auth";
import { StoryCategory } from "@prisma/client";
import { mapStory } from "../lib/mappers";

type Env = {
  Variables: {
    user: JWTPayload;
  };
};

const storyRoutes = new Hono<Env>();

storyRoutes.get("/", async (c) => {
  try {
    const stories = await prisma.story.findMany({
      orderBy: { createdAt: "desc" },
    });
    return c.json(stories.map(mapStory));
  } catch (err: any) {
    return c.json({ error: "Failed to fetch stories: " + err.message }, 500);
  }
});

storyRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const story = await prisma.story.findUnique({
      where: { id },
    });
    if (!story) {
      return c.json({ error: "Story not found" }, 404);
    }
    return c.json(mapStory(story));
  } catch (err: any) {
    return c.json({ error: "Failed to fetch story: " + err.message }, 500);
  }
});

storyRoutes.post("/", authMiddleware, requireAdmin, async (c) => {
  try {
    const body = await c.req.json();
    const { id, titleId, titleEn, contentId, contentEn, category, imageUrl, locationId, unlockedByQuestId } = body;

    const newStory = await prisma.story.create({
      data: {
        id: id || undefined,
        titleId,
        titleEn,
        contentId,
        contentEn,
        category: category as StoryCategory,
        imageUrl,
        locationId,
        unlockedByQuestId,
      },
    });
    return c.json(newStory, 201);
  } catch (err: any) {
    return c.json({ error: "Failed to create story: " + err.message }, 500);
  }
});

storyRoutes.put("/:id", authMiddleware, requireAdmin, async (c) => {
  const id = c.req.param("id");
  try {
    const body = await c.req.json();
    const { titleId, titleEn, contentId, contentEn, category, imageUrl, locationId, unlockedByQuestId } = body;

    const updatedStory = await prisma.story.update({
      where: { id },
      data: {
        titleId,
        titleEn,
        contentId,
        contentEn,
        category: category as StoryCategory,
        imageUrl,
        locationId,
        unlockedByQuestId,
      },
    });
    return c.json(updatedStory);
  } catch (err: any) {
    return c.json({ error: "Failed to update story: " + err.message }, 500);
  }
});

storyRoutes.delete("/:id", authMiddleware, requireAdmin, async (c) => {
  const id = c.req.param("id");
  try {
    await prisma.story.delete({
      where: { id },
    });
    return c.json({ message: "Story deleted successfully" });
  } catch (err: any) {
    return c.json({ error: "Failed to delete story: " + err.message }, 500);
  }
});

export default storyRoutes;
