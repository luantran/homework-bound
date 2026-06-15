import { Hono } from "hono";
import * as logger from "../logger";
import { CreateExerciseSchema } from "@homework-bound/shared";
import z, { ZodError } from "zod";
import { ExerciseNotFoundError } from "../errors";
import {
  getExercises,
  createExercise,
  getExerciseByID,
  updateExerciseByID,
  deleteExerciseByID,
} from "../services/exercises";
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

router.get("/:id", async (context) => {
  try {
    const id = z.uuid().parse(context.req.param("id"));
    const result = await getExerciseByID(id);
    return context.json(result);
  } catch (e) {
    if (e instanceof ZodError) {
      return context.json({ error: e.issues }, 400);
    } else if (e instanceof ExerciseNotFoundError) {
      return context.json({ error: e.message }, 404);
    }
    logger.error(`GET /exercises/:id failed: ${e}`);
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
    }
    logger.error(`POST /exercises failed: ${e}`);
    return context.json({ error: "Internal server error" }, 500);
  }
});

router.put("/:id", async (context) => {
  let body;
  // JSON parsing is in its own try/catch so a malformed body returns 400 instead of 500
  try {
    body = await context.req.json();
  } catch {
    return context.json({ error: "Invalid JSON body" }, 400);
  }
  try {
    const id = z.uuid().parse(context.req.param("id"));
    const data = CreateExerciseSchema.parse(body);
    const result = await updateExerciseByID(id, data);
    return context.json(result, 200);
  } catch (e) {
    if (e instanceof ZodError) {
      return context.json({ error: e.issues }, 400);
    } else if (e instanceof ExerciseNotFoundError) {
      return context.json({ error: e.message }, 404);
    }
    logger.error(`PUT /exercise/:id failed: ${e}`);
    return context.json({ error: "Internal server error" }, 500);
  }
});

router.delete("/:id", async (context) => {
  try {
    const id = z.uuid().parse(context.req.param("id"));
    await deleteExerciseByID(id);
    return context.body(null, 204);
  } catch (e) {
    if (e instanceof ZodError) {
      return context.json({ error: e.issues }, 400);
    } else if (e instanceof ExerciseNotFoundError) {
      return context.json({ error: e.message }, 404);
    }
    logger.error(`DELETE /exercises/:id failed: ${e}`);
    return context.json({ error: "Internal server error" }, 500);
  }
});

export default router;
