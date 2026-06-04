import { Hono } from "hono";
import * as logger from "../logger";
import { CreateWorksheetSchema } from "@homework-bound/shared";
import z, { ZodError } from "zod";
import { ExerciseNotFoundError, WorksheetNotFoundError } from "../errors";
import {
  getWorksheets,
  getWorksheetByID,
  createWorksheet,
  updateWorksheetByID,
  deleteWorksheetByID,
} from "../services/worksheets";

const router = new Hono();

router.get("/", async (context) => {
  try {
    const result = await getWorksheets();
    return context.json(result);
  } catch (e) {
    logger.error(`GET /worksheets failed: ${e}`);
    return context.json({ error: "Internal server error" }, 500);
  }
});

router.get("/:id", async (context) => {
  try {
    const id = z.uuid().parse(context.req.param("id"));
    const result = await getWorksheetByID(id);
    return context.json(result);
  } catch (e) {
    if (e instanceof ZodError) {
      return context.json({ error: e.issues }, 400);
    } else if (e instanceof WorksheetNotFoundError) {
      return context.json({ error: e.message }, 404);
    }
    logger.error(`GET /worksheets/:id failed: ${e}`);
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
    const data = CreateWorksheetSchema.parse(body);
    const result = await createWorksheet(data);
    return context.json(result, 201);
  } catch (e) {
    if (e instanceof ZodError) {
      return context.json({ error: e.issues }, 400);
    } else if (e instanceof ExerciseNotFoundError) {
      return context.json({ error: e.message }, 400);
    }
    logger.error(`POST /worksheets failed: ${e}`);
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
    const data = CreateWorksheetSchema.parse(body);
    const result = await updateWorksheetByID(id, data);
    return context.json(result, 200);
  } catch (e) {
    if (e instanceof ZodError) {
      return context.json({ error: e.issues }, 400);
    } else if (e instanceof ExerciseNotFoundError) {
      return context.json({ error: e.message }, 400);
    } else if (e instanceof WorksheetNotFoundError) {
      return context.json({ error: e.message }, 404);
    }
    logger.error(`PUT /worksheets/:id failed: ${e}`);
    return context.json({ error: "Internal server error" }, 500);
  }
});

router.delete("/:id", async (context) => {
  try {
    const id = z.uuid().parse(context.req.param("id"));
    await deleteWorksheetByID(id);
    return context.body(null, 204);
  } catch (e) {
    if (e instanceof ZodError) {
      return context.json({ error: e.issues }, 400);
    } else if (e instanceof WorksheetNotFoundError) {
      return context.json({ error: e.message }, 404);
    }
    logger.error(`DELETE /worksheets/:id failed: ${e}`);
    return context.json({ error: "Internal server error" }, 500);
  }
});

export default router;
