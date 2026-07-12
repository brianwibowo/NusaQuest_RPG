import { Hono } from "hono";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { authMiddleware, requireAdmin } from "../middleware/auth";

const settingsRoutes = new Hono();
const settingsFilePath = join(process.cwd(), "settings.json");

// Helper to read settings file safely
function getSettings() {
  try {
    const data = readFileSync(settingsFilePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return {
      dailySignIn: [
        { day: 1, gold: 10, points: 0 },
        { day: 2, gold: 20, points: 0 },
        { day: 3, gold: 30, points: 0 },
        { day: 4, gold: 0, points: 15 },
        { day: 5, gold: 50, points: 0 },
        { day: 6, gold: 0, points: 25 },
        { day: 7, gold: 100, points: 50 }
      ],
      dailyQuests: {
        quiz: { xp: 10, gold: 20, points: 10 },
        explore: { xp: 10, gold: 10, points: 5 },
        leaderboard: { xp: 15, gold: 15, points: 10 }
      }
    };
  }
}

// GET /api/settings
settingsRoutes.get("/", (c) => {
  return c.json(getSettings());
});

// POST /api/settings
settingsRoutes.post("/", authMiddleware, requireAdmin, async (c) => {
  try {
    const body = await c.req.json();
    writeFileSync(settingsFilePath, JSON.stringify(body, null, 2), "utf-8");
    return c.json({ success: true, message: "Settings saved successfully", settings: body });
  } catch (err: any) {
    return c.json({ error: "Failed to save settings: " + err.message }, 500);
  }
});

export default settingsRoutes;
