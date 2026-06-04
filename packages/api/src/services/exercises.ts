import { CreateExercise } from "@homework-bound/shared";
import { inArray, eq } from "drizzle-orm";
import { db } from "../db/client";
import { exercises, questions, exercises_questions } from "../db/schema";
import { ExerciseNotFoundError, QuestionNotFoundError } from "../errors";
import * as logger from "../logger";

// placeholder until auth is implemented — will be replaced with the authenticated user's ID
const defaultID = "00000000-0000-0000-0000-000000000000";

export async function getExercises() {
  try {
    return await db.select().from(exercises);
  } catch (error) {
    logger.error(`Failed to get exercises: ${error}`);
    throw error;
  }
}

export async function getExerciseByID(id: string) {
  try {
    const exercise = await db.query.exercises.findFirst({
      where: eq(exercises.id, id),
      with: { exercises_questions: { with: { question: true } } },
    });

    if (!exercise) {
      throw new ExerciseNotFoundError();
    }
    return exercise;
  } catch (error) {
    if (error instanceof ExerciseNotFoundError) throw error;
    logger.error(`Failed to get exercise of ID ${id}: ${error}`);
    throw error;
  }
}

export async function createExercise(data: CreateExercise) {
  try {
    return await db.transaction(async (tx) => {
      // validate question IDs before inserting — FK violations give a cryptic DB error,
      // this surfaces a clean, user-facing message instead
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
            order: index, // order is derived from the position in the submitted array
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

export async function updateExerciseByID(id: string, data: CreateExercise) {
  try {
    return await db.transaction(async (tx) => {
      // validate question IDs before inserting — FK violations give a cryptic DB error,
      // this surfaces a clean, user-facing message instead
      const found = await tx
        .select()
        .from(questions)
        .where(inArray(questions.id, data.questions));
      if (found.length !== data.questions.length) {
        throw new QuestionNotFoundError();
      }

      const [exercise] = await tx
        .update(exercises)
        .set({
          category: data["category"],
          context: data["context"],
          updated_at: new Date(),
        })
        .where(eq(exercises.id, id))
        .returning();

      if (!exercise) throw new ExerciseNotFoundError();

      await tx
        .delete(exercises_questions)
        .where(eq(exercises_questions.exercise_id, id));

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
    logger.error(`Failed to update exercise with ID ${id}: ${error}`);
    throw error;
  }
}

export async function deleteExerciseByID(id: string) {
  try {
    return await db.transaction(async (tx) => {
      const [exercise] = await db
        .select()
        .from(exercises)
        .where(eq(exercises.id, id));
      if (!exercise) {
        throw new ExerciseNotFoundError();
      }
      await tx
        .delete(exercises_questions)
        .where(eq(exercises_questions.exercise_id, id));
      await tx.delete(exercises).where(eq(exercises.id, id));
    });
  } catch (error) {
    if (error instanceof ExerciseNotFoundError) throw error;
    logger.error(`Failed to delete exercise of ID ${id}: ${error}`);
    throw error;
  }
}
