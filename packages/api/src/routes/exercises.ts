import { Hono } from "hono";
import { exercises, exercises_questions, questions } from "../db/schema";
import { db } from "../db/client";
import * as logger from "../logger";
import { CreateExercise, CreateExerciseSchema } from "@homework-bound/shared";
import { ZodError } from "zod";
import { inArray } from "drizzle-orm";
import { QuestionNotFoundError } from "../errors";

const defaultID = "00000000-0000-0000-0000-000000000000";

async function getExercises() {
  try {
    return await db.select().from(exercises);
  } catch (error) {
    logger.error(`Failed to get exercises: ${error}`);
    throw error;
  }
}

async function createExercise(data: CreateExercise) {
  try {
    return await db.transaction(async (tx) => {
      const found = await tx
        .select()
        .from(questions)
        .where(inArray(questions.id, data.questions));
      if (found.length !== data.questions.length) {
        throw new QuestionNotFoundError();
      }

      const [exercise] = await tx
        .insert(exercises)
        .values({
          created_by: defaultID,
          category: data["category"],
          context: data["context"],
          updated_at: new Date(),
        })
        .returning();

      if (data.questions.length > 0) {
        await tx.insert(exercises_questions).values(
          data.questions.map((question_id, index) => ({
            exercise_id: exercise.id,
            question_id,
            order: index,
          })),
        );
      }

      return exercise;
    });
  } catch (error) {
    logger.error(`Failed to create exercise: ${error}`);
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

router.post("/", async (context) => {
  let body;
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
