import { Hono } from "hono";
import prisma from "../lib/prisma";
import { authMiddleware, requireAdmin, requireSuperAdmin, JWTPayload } from "../middleware/auth";
import { UserRole } from "@prisma/client";

type Env = {
  Variables: {
    user: JWTPayload;
  };
};

const userRoutes = new Hono<Env>();

userRoutes.get("/", authMiddleware, requireAdmin, async (c) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            level: true,
            totalPoints: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return c.json(users);
  } catch (err: any) {
    return c.json({ error: "Failed to fetch users: " + err.message }, 500);
  }
});

userRoutes.patch("/:id/role", authMiddleware, requireSuperAdmin, async (c) => {
  const userId = c.req.param("id");
  const body = await c.req.json();
  const { role } = body;

  if (role !== "user" && role !== "admin" && role !== "super_admin") {
    return c.json({ error: "Invalid role value" }, 400);
  }

  try {
    const targetRole = role as UserRole;

    if (targetRole === UserRole.super_admin) {
      const superAdminCount = await prisma.user.count({ where: { role: UserRole.super_admin } });
      if (superAdminCount >= 1) {
        return c.json({ error: "Forbidden: Only one Super Admin account is allowed on the platform" }, 400);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: targetRole },
      select: { id: true, email: true, name: true, role: true },
    });

    return c.json({ message: "User role updated successfully", user: updatedUser });
  } catch (err: any) {
    return c.json({ error: "Failed to update user role: " + err.message }, 500);
  }
});

export default userRoutes;
