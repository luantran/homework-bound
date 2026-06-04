import { Hono } from "hono";
import * as logger from "../logger";
import { CreateExerciseSchema } from "@homework-bound/shared";
import { ZodError } from "zod";
import { QuestionNotFoundError } from "../errors";
import { getExercises, createExercise } from "../services/exercises";
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

router.post("/", async (context) => {
  let body;
  // JSON parsing is in its own try/catch so a malformed body returns 400 instead of 500
  try {
    body = await context.req.json();
  } catch {
    return context.json({ error: "Invalid JSON body" }, 400);
  }
  try {
    const data = CreateExerciseSchema.parse(body);
    const result = await createExercise(data);
    return context.json(result, 201);
  } catch (e) {
    if (e instanceof ZodError) {
      return context.json({ error: e.issues }, 400);
    } else if (e instanceof QuestionNotFoundError) {
      return context.json({ error: e.message }, 400);
    }
    logger.error(`POST /exercises failed: ${e}`);
    return context.json({ error: "Internal server error" }, 500);
  }
});

export default router;
