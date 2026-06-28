import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serveStatic } from "@hono/node-server/serve-static";

// Route imports
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import locationRoutes from "./routes/locations";
import questRoutes from "./routes/quests";
import storyRoutes from "./routes/stories";
import umkmRoutes from "./routes/umkm";
import battleRoutes from "./routes/battles";
import songRoutes from "./routes/songs";
import progressRoutes from "./routes/progress";
import leaderboardRoutes from "./routes/leaderboard";
import uploadRoutes from "./routes/uploads";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", cors({ origin: "*" }));

// Serve uploaded files statically
app.use(
  "/api/uploads/*",
  serveStatic({
    root: "./",
    rewriteRequestPath: (path) => path.replace("/api/uploads", "/uploads"),
  })
);

// Health check
app.get("/api/health", (c) =>
  c.json({ status: "ok", timestamp: new Date().toISOString() })
);

// Mount routes
app.route("/api/auth", authRoutes);
app.route("/api/users", userRoutes);
app.route("/api/locations", locationRoutes);
app.route("/api/quests", questRoutes);
app.route("/api/stories", storyRoutes);
app.route("/api/umkm", umkmRoutes);
app.route("/api/battles", battleRoutes);
app.route("/api/songs", songRoutes);
app.route("/api/progress", progressRoutes);
app.route("/api/leaderboard", leaderboardRoutes);
app.route("/api/uploads", uploadRoutes);

const port = Number(process.env.PORT) || 3001;
serve({ fetch: app.fetch, port }, () => {
  console.log(`🚀 NusaQuest API running on port ${port}`);
});
export default app;
