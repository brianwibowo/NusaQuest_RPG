import { Next } from "hono";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_that_is_at_least_32_characters_long";

export interface JWTPayload {
  userId: string;
  email: string;
  role: "super_admin" | "admin" | "user";
}

export async function authMiddleware(c: any, next: Next) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized: Missing token" }, 401);
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    c.set("user", decoded);
    await next();
  } catch (err) {
    return c.json({ error: "Unauthorized: Invalid or expired token" }, 401);
  }
}

export async function requireAdmin(c: any, next: Next) {
  const user = c.get("user") as JWTPayload | undefined;
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return c.json({ error: "Forbidden: Admin access required" }, 403);
  }
  await next();
}

export async function requireSuperAdmin(c: any, next: Next) {
  const user = c.get("user") as JWTPayload | undefined;
  if (!user || user.role !== "super_admin") {
    return c.json({ error: "Forbidden: Super Admin access required" }, 403);
  }
  await next();
}
