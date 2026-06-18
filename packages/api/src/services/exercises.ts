import { CreateExercise } from "@homework-bound/shared";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { exercises, questions, worksheets_exercises } from "../db/schema";
import { ExerciseNotFoundError } from "../errors";
import * as logger from "../logger";

// placeholder until auth is implemented — will be replaced with the authenticated user's ID
const defaultID = "00000000-0000-0000-0000-000000000000";

export async function getExercises() {
  try {
    return await db.query.exercises.findMany({
      with: {
        questions: true,
        worksheets_exercises: {
          with: {
            worksheet: {
              columns: { id: true, worksheet_number: true, title: true },
            },
          },
        },
      },
    });
  } catch (error) {
    logger.error(`Failed to get exercises: ${error}`);
    throw error;
  }
}

export async function getExerciseByID(id: string) {
  try {
    const exercise = await db.query.exercises.findFirst({
      where: eq(exercises.id, id),
      with: {
        questions: true,
        worksheets_exercises: {
          with: {
            worksheet: {
              columns: { id: true, worksheet_number: true, title: true },
            },
          },
        },
      },
    });
    if (!exercise) throw new ExerciseNotFoundError();
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
      const [exercise] = await tx
        .insert(exercises)
        .values({
          created_by: defaultID,
          category: data.category,
          context: data.context,
          prompt: data.prompt,
          tags: data.tags,
          min_level: data.min_level,
          max_level: data.max_level,
          updated_at: new Date(),
        })
        .returning();

      if (data.questions.length > 0) {
        await tx.insert(questions).values(
          data.questions.map((q) => ({
            ...q,
            exercise_id: exercise.id,
            created_by: defaultID,
            updated_at: new Date(),
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
      const [exercise] = await tx
        .update(exercises)
        .set({
          category: data.category,
          context: data.context,
          prompt: data.prompt,
          tags: data.tags,
          min_level: data.min_level,
          max_level: data.max_level,
          updated_at: new Date(),
        })
        .where(eq(exercises.id, id))
        .returning();

      if (!exercise) throw new ExerciseNotFoundError();

      // delete-and-replace: simpler than diffing, safe since questions are owned by the exercise
      await tx.delete(questions).where(eq(questions.exercise_id, id));

      if (data.questions.length > 0) {
        await tx.insert(questions).values(
          data.questions.map((q) => ({
            ...q,
            exercise_id: exercise.id,
            created_by: defaultID,
            updated_at: new Date(),
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
      const [exercise] = await tx
        .select()
        .from(exercises)
        .where(eq(exercises.id, id));
      if (!exercise) throw new ExerciseNotFoundError();

      await tx.delete(questions).where(eq(questions.exercise_id, id));
      await tx
        .delete(worksheets_exercises)
        .where(eq(worksheets_exercises.exercise_id, id));

      await tx.delete(exercises).where(eq(exercises.id, id));
    });
  } catch (error) {
    if (error instanceof ExerciseNotFoundError) throw error;
    logger.error(`Failed to delete exercise of ID ${id}: ${error}`);
    throw error;
  }
}
