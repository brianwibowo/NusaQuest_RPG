import { Hono } from "hono";
import prisma from "../lib/prisma";
import { authMiddleware, requireAdmin, JWTPayload } from "../middleware/auth";

type Env = {
  Variables: {
    user: JWTPayload;
  };
};

const songRoutes = new Hono<Env>();

songRoutes.get("/", async (c) => {
  try {
    const songs = await prisma.song.findMany({
      orderBy: { createdAt: "desc" },
    });
    return c.json(songs);
  } catch (err: any) {
    return c.json({ error: "Failed to fetch songs: " + err.message }, 500);
  }
});

songRoutes.post("/", authMiddleware, requireAdmin, async (c) => {
  try {
    const songCount = await prisma.song.count();
    if (songCount >= 2) {
      return c.json({ error: "Forbidden: Maximum of 2 BGM songs can be registered in the system" }, 400);
    }

    const body = await c.req.json();
    const { name, fileUrl, isActive } = body;

    if (isActive) {
      await prisma.song.updateMany({ data: { isActive: false } });
    }

    const newSong = await prisma.song.create({
      data: {
        name,
        fileUrl,
        isActive: !!isActive,
      },
    });
    return c.json(newSong, 201);
  } catch (err: any) {
    return c.json({ error: "Failed to create song: " + err.message }, 500);
  }
});

songRoutes.put("/:id", authMiddleware, requireAdmin, async (c) => {
  const id = c.req.param("id");
  try {
    const body = await c.req.json();
    const { name, fileUrl, isActive } = body;

    if (isActive) {
      await prisma.song.updateMany({
        where: { id: { not: id } },
        data: { isActive: false }
      });
    }

    const updatedSong = await prisma.song.update({
      where: { id },
      data: {
        name,
        fileUrl,
        isActive: isActive !== undefined ? !!isActive : undefined,
      },
    });
    return c.json(updatedSong);
  } catch (err: any) {
    return c.json({ error: "Failed to update song: " + err.message }, 500);
  }
});

songRoutes.delete("/:id", authMiddleware, requireAdmin, async (c) => {
  const id = c.req.param("id");
  try {
    await prisma.song.delete({
      where: { id },
    });
    return c.json({ message: "Song deleted successfully" });
  } catch (err: any) {
    return c.json({ error: "Failed to delete song: " + err.message }, 500);
  }
});

export default songRoutes;
