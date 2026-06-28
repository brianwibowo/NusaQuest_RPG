import { Hono } from "hono";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { authMiddleware, requireAdmin, JWTPayload } from "../middleware/auth";

type Env = {
  Variables: {
    user: JWTPayload;
  };
};

const uploadRoutes = new Hono<Env>();

uploadRoutes.post("/", authMiddleware, requireAdmin, async (c) => {
  const body = await c.req.parseBody();
  const file = body["file"];
  const entity = (body["entity"] as string) || "general";

  if (!file || !(file instanceof File)) {
    return c.json({ error: "No file uploaded or invalid file type" }, 400);
  }

  try {
    const uploadDir = join(process.cwd(), "uploads", entity);
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const filePath = join(uploadDir, filename);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    writeFileSync(filePath, buffer);

    const fileUrl = `/api/uploads/${entity}/${filename}`;
    return c.json({ url: fileUrl });
  } catch (err: any) {
    console.error("❌ File upload failed:", err);
    return c.json({ error: "File upload failed: " + err.message }, 500);
  }
});

export default uploadRoutes;
