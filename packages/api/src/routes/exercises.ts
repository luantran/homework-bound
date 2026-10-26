import { Hono } from "hono";
import Anthropic from "@anthropic-ai/sdk";
import * as logger from "../logger";
import { CreateExerciseSchema } from "@homework-bound/shared";
import z, { ZodError } from "zod";
import {
  ExerciseNotFoundError,
  ExtractionFailedError,
  ExtractionRefusedError,
} from "../errors";
import { extractExercise, type ImageMediaType } from "../services/extraction";
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

const ALLOWED_IMAGE_TYPES: string[] = ["image/jpeg", "image/png"];
// The API caps images at 5 MB after base64 encoding, which adds ~33%
const MAX_IMAGE_BYTES = 3.75 * 1024 * 1024;

router.post("/extract", async (context) => {
  let file;
  // Body parsing is in its own try/catch so a non-multipart body returns 400 instead of 500
  try {
    const body = await context.req.parseBody();
    file = body["file"];
  } catch {
    return context.json({ error: "Expected a multipart form body" }, 400);
  }
  if (!(file instanceof File)) {
    return context.json({ error: "Missing image file" }, 400);
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return context.json({ error: "Image must be JPG or PNG" }, 400);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return context.json({ error: "Image must be 3.75 MB or smaller" }, 400);
  }
  try {
    const data = Buffer.from(await file.arrayBuffer()).toString("base64");
    const draft = await extractExercise(data, file.type as ImageMediaType);
    if (draft.questions.length === 0) {
      return context.json(
        { error: "No supported questions found on this page" },
        422,
      );
    }
    return context.json(draft);
  } catch (e) {
    if (e instanceof ExtractionRefusedError) {
      return context.json({ error: e.message }, 422);
    } else if (
      e instanceof ExtractionFailedError ||
      e instanceof Anthropic.APIError
    ) {
      logger.error(`POST /exercises/extract failed: ${e}`);
      return context.json({ error: "Extraction failed" }, 502);
    }
    logger.error(`POST /exercises/extract failed: ${e}`);
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
