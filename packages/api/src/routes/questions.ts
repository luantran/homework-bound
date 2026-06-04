import { Hono } from "hono";
import * as logger from "../logger";
import { CreateQuestionSchema } from "@homework-bound/shared";
import z, { ZodError } from "zod";
import { QuestionNotFoundError } from "../errors";
import {
  getQuestions,
  getQuestionByID,
  createQuestion,
  updateQuestionByID,
  deleteQuestionByID,
} from "../services/questions";

const router = new Hono();

router.get("/", async (context) => {
  try {
    const result = await getQuestions();
    return context.json(result);
  } catch (e) {
    logger.error(`GET /questions failed: ${e}`);
    return context.json({ error: "Internal server error" }, 500);
  }
});

router.get("/:id", async (context) => {
  try {
    const id = z.uuid().parse(context.req.param("id"));
    const result = await getQuestionByID(id);
    return context.json(result);
  } catch (e) {
    if (e instanceof ZodError) {
      return context.json({ error: e.issues }, 400);
    } else if (e instanceof QuestionNotFoundError) {
      return context.json({ error: e.message }, 404);
    }
    logger.error(`GET /questions/:id failed: ${e}`);
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
    const data = CreateQuestionSchema.parse(body);
    const result = await createQuestion(data);
    return context.json(result, 201);
  } catch (e) {
    if (e instanceof ZodError) {
      return context.json({ error: e.issues }, 400);
    }
    logger.error(`POST /questions failed: ${e}`);
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
    const data = CreateQuestionSchema.parse(body);
    const result = await updateQuestionByID(id, data);
    return context.json(result, 200);
  } catch (e) {
    if (e instanceof ZodError) {
      return context.json({ error: e.issues }, 400);
    } else if (e instanceof QuestionNotFoundError) {
      return context.json({ error: e.message }, 404);
    }
    logger.error(`PUT /questions/:id failed: ${e}`);
    return context.json({ error: "Internal server error" }, 500);
  }
});

router.delete("/:id", async (context) => {
  try {
    const id = z.uuid().parse(context.req.param("id"));
    await deleteQuestionByID(id);
    return context.body(null, 204);
  } catch (e) {
    if (e instanceof ZodError) {
      return context.json({ error: e.issues }, 400);
    } else if (e instanceof QuestionNotFoundError) {
      return context.json({ error: e.message }, 404);
    }
    logger.error(`DELETE /questions/:id failed: ${e}`);
    return context.json({ error: "Internal server error" }, 500);
  }
});

export default router;
