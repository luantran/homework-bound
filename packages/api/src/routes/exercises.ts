import { Hono } from "hono";
import { exercises } from "../db/schema";
import { db } from "../db/client";
import * as logger from "../logger";

async function getExercises() {
  try {
    return await db.select().from(exercises);
  } catch (error) {
    logger.error(`Failed to get exercises: ${error}`);
    throw error;
  }
}

const router = new Hono();

router.get("/", async (context) => {
  try {
    const result = await getExercises();
    return context.json(result);
  } catch (e) {
    logger.error(`GET /exercises failed: ${e}`);
    return context.json({ error: "Internal server error" }, 500);
  }
});

export default router;
