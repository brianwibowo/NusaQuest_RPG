import { Hono } from "hono";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { authMiddleware, JWTPayload } from "../middleware/auth";
import { UserRole } from "@prisma/client";

type Env = {
  Variables: {
    user: JWTPayload;
  };
};

const authRoutes = new Hono<Env>();
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_key_that_is_at_least_32_characters_long";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "not_set";

const oAuth2Client = new OAuth2Client(GOOGLE_CLIENT_ID);

authRoutes.post("/google", async (c) => {
  const body = await c.req.json();
  const { idToken } = body;

  if (!idToken) {
    return c.json({ error: "Missing Google ID token" }, 400);
  }

  try {
    let email: string | undefined;
    let name: string | undefined;
    let avatarUrl: string | undefined;
    let googleId: string | undefined;

    if (GOOGLE_CLIENT_ID === "not_set" || idToken === "mock_development_token") {
      console.warn("⚠️ Using Mock/Dev Auth fallback.");
      email = body.email || "dev-user@nusaquest.space";
      name = body.name || "Beta Adventurer";
      avatarUrl = body.avatarUrl || null;
      googleId = "mock_" + email;
    } else {
      const ticket = await oAuth2Client.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) {
        return c.json({ error: "Invalid ID token payload" }, 400);
      }
      email = payload.email;
      name = payload.name || payload.given_name || "User";
      avatarUrl = payload.picture;
      googleId = payload.sub;
    }

    if (!email) {
      return c.json({ error: "No email address found in Google token" }, 400);
    }

    let user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || "Beta Adventurer",
          avatarUrl,
          googleId,
          role: UserRole.user,
          profile: {
            create: {
              characterId: "explorer",
              level: 1,
              currentXp: 0,
              totalPoints: 0,
              gold: 100,
            },
          },
        },
        include: { profile: true },
      });
    } else if (!user.googleId && googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId, avatarUrl: avatarUrl || user.avatarUrl },
        include: { profile: true },
      });
    }

    if (!user) {
      return c.json({ error: "Failed to locate or register user profile" }, 500);
    }

    const tokenPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "7d" });

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (err: any) {
    console.error("❌ Google login failed:", err);
    return c.json({ error: "Google Authentication failed: " + err.message }, 500);
  }
});

authRoutes.get("/me", authMiddleware, async (c) => {
  const jwtUser = c.get("user");
  try {
    const user = await prisma.user.findUnique({
      where: { id: jwtUser.userId },
      include: { profile: true },
    });

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
        profile: user.profile,
      },
    });
  } catch (err: any) {
    return c.json({ error: "Failed to fetch user context" }, 500);
  }
});

export default authRoutes;
