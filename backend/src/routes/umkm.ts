import { Hono } from "hono";
import prisma from "../lib/prisma";
import { authMiddleware, requireAdmin, JWTPayload } from "../middleware/auth";
import { UmkmCategory } from "@prisma/client";
import { mapUmkm } from "../lib/mappers";

type Env = {
  Variables: {
    user: JWTPayload;
  };
};

const umkmRoutes = new Hono<Env>();

umkmRoutes.get("/", async (c) => {
  try {
    const umkmList = await prisma.umkm.findMany({
      orderBy: { createdAt: "desc" },
    });
    return c.json(umkmList.map(mapUmkm));
  } catch (err: any) {
    return c.json({ error: "Failed to fetch UMKM: " + err.message }, 500);
  }
});

umkmRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const umkm = await prisma.umkm.findUnique({
      where: { id },
      include: { location: true },
    });
    if (!umkm) {
      return c.json({ error: "UMKM not found" }, 404);
    }
    return c.json(mapUmkm(umkm));
  } catch (err: any) {
    return c.json({ error: "Failed to fetch UMKM: " + err.message }, 500);
  }
});

umkmRoutes.post("/", authMiddleware, requireAdmin, async (c) => {
  try {
    const body = await c.req.json();
    const { id, name, descId, descEn, category, products, imageUrl, rating, voucherAvailable, locationId } = body;

    const newUmkm = await prisma.umkm.create({
      data: {
        id: id || undefined,
        name,
        descId,
        descEn,
        category: category as UmkmCategory,
        products: products || [],
        imageUrl,
        rating: rating ? parseFloat(rating) : 0,
        voucherAvailable: !!voucherAvailable,
        locationId,
      },
    });
    return c.json(newUmkm, 201);
  } catch (err: any) {
    return c.json({ error: "Failed to create UMKM: " + err.message }, 500);
  }
});

umkmRoutes.put("/:id", authMiddleware, requireAdmin, async (c) => {
  const id = c.req.param("id");
  try {
    const body = await c.req.json();
    const { name, descId, descEn, category, products, imageUrl, rating, voucherAvailable, locationId } = body;

    const updatedUmkm = await prisma.umkm.update({
      where: { id },
      data: {
        name,
        descId,
        descEn,
        category: category as UmkmCategory,
        products: products || [],
        imageUrl,
        rating: rating ? parseFloat(rating) : 0,
        voucherAvailable: !!voucherAvailable,
        locationId,
      },
    });
    return c.json(updatedUmkm);
  } catch (err: any) {
    return c.json({ error: "Failed to update UMKM: " + err.message }, 500);
  }
});

umkmRoutes.delete("/:id", authMiddleware, requireAdmin, async (c) => {
  const id = c.req.param("id");
  try {
    await prisma.umkm.delete({
      where: { id },
    });
    return c.json({ message: "UMKM deleted successfully" });
  } catch (err: any) {
    return c.json({ error: "Failed to delete UMKM: " + err.message }, 500);
  }
});

export default umkmRoutes;
