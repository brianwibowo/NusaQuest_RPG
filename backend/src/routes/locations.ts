import { Hono } from "hono";
import prisma from "../lib/prisma";
import { authMiddleware, requireAdmin, JWTPayload } from "../middleware/auth";
import { LocationCategory } from "@prisma/client";
import { mapLocation } from "../lib/mappers";

type Env = {
  Variables: {
    user: JWTPayload;
  };
};

const locationRoutes = new Hono<Env>();

locationRoutes.get("/", async (c) => {
  const categoryQuery = c.req.query("category");
  try {
    const whereClause = categoryQuery
      ? { category: categoryQuery as LocationCategory }
      : {};
    const locations = await prisma.location.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });
    return c.json(locations.map(mapLocation));
  } catch (err: any) {
    return c.json({ error: "Failed to fetch locations: " + err.message }, 500);
  }
});

locationRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        quests: true,
        umkms: true,
        stories: true,
      },
    });
    if (!location) {
      return c.json({ error: "Location not found" }, 404);
    }
    return c.json(mapLocation(location));
  } catch (err: any) {
    return c.json({ error: "Failed to fetch location: " + err.message }, 500);
  }
});

locationRoutes.post("/", authMiddleware, requireAdmin, async (c) => {
  try {
    const body = await c.req.json();
    const { nameId, nameEn, descId, descEn, category, latitude, longitude, imageUrl, addressId, addressEn } = body;

    const newLocation = await prisma.location.create({
      data: {
        nameId,
        nameEn,
        descId,
        descEn,
        category: category as LocationCategory,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        imageUrl,
        addressId,
        addressEn,
      },
    });
    return c.json(newLocation, 201);
  } catch (err: any) {
    return c.json({ error: "Failed to create location: " + err.message }, 500);
  }
});

locationRoutes.put("/:id", authMiddleware, requireAdmin, async (c) => {
  const id = c.req.param("id");
  try {
    const body = await c.req.json();
    const { nameId, nameEn, descId, descEn, category, latitude, longitude, imageUrl, addressId, addressEn } = body;

    const updatedLocation = await prisma.location.update({
      where: { id },
      data: {
        nameId,
        nameEn,
        descId,
        descEn,
        category: category as LocationCategory,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        imageUrl,
        addressId,
        addressEn,
      },
    });
    return c.json(updatedLocation);
  } catch (err: any) {
    return c.json({ error: "Failed to update location: " + err.message }, 500);
  }
});

locationRoutes.delete("/:id", authMiddleware, requireAdmin, async (c) => {
  const id = c.req.param("id");
  try {
    await prisma.location.delete({
      where: { id },
    });
    return c.json({ message: "Location deleted successfully" });
  } catch (err: any) {
    return c.json({ error: "Failed to delete location: " + err.message }, 500);
  }
});

export default locationRoutes;
