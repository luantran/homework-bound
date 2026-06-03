import { CreateExercise } from "@homework-bound/shared";
import { inArray } from "drizzle-orm";
import { db } from "../db/client";
import { exercises, questions, exercises_questions } from "../db/schema";
import { QuestionNotFoundError } from "../errors";
import * as logger from "../logger";

const defaultID = "00000000-0000-0000-0000-000000000000";

export async function getExercises() {
  try {
    return await db.select().from(exercises);
  } catch (error) {
    logger.error(`Failed to get exercises: ${error}`);
    throw error;
  }
}

export async function createExercise(data: CreateExercise) {
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
