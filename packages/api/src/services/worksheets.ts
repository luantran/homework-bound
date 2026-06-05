import { CreateWorksheet } from "@homework-bound/shared";
import { inArray, eq } from "drizzle-orm";
import { db } from "../db/client";
import { worksheets, worksheets_exercises, exercises } from "../db/schema";
import { ExerciseNotFoundError, WorksheetNotFoundError } from "../errors";
import * as logger from "../logger";

// placeholder until auth is implemented
const defaultID = "00000000-0000-0000-0000-000000000000";

export async function getWorksheets() {
  try {
    const worksheets = await db.query.worksheets.findMany({
      with: { worksheets_exercises: { with: { exercise: true } } },
    });
    return worksheets.map((worksheet) => ({
      ...worksheet,
      exercises: worksheet.worksheets_exercises.map((we) => we.exercise),
    }));
  } catch (error) {
    logger.error(`Failed to get worksheets: ${error}`);
    throw error;
  }
}

export async function getWorksheetByID(id: string) {
  try {
    const worksheet = await db.query.worksheets.findFirst({
      where: eq(worksheets.id, id),
      with: {
        worksheets_exercises: {
          with: {
            // nested join through exercises → exercises_questions → questions
            exercise: {
              with: {
                exercises_questions: {
                  with: { question: true },
                },
              },
            },
          },
        },
      },
    });
    if (!worksheet) {
      throw new WorksheetNotFoundError();
    }
    return {
      ...worksheet,
      exercises: worksheet.worksheets_exercises.flatMap((we) => {
        if (!we.exercise) return [];
        return [
          {
            ...we.exercise,
            questions: we.exercise.exercises_questions.map((eq) => eq.question),
          },
        ];
      }),
    };
  } catch (error) {
    if (error instanceof WorksheetNotFoundError) throw error;
    logger.error(`Failed to get worksheet of ID ${id}: ${error}`);
    throw error;
  }
}

export async function createWorksheet(data: CreateWorksheet) {
  try {
    return await db.transaction(async (tx) => {
      // validate exercise IDs before inserting — FK violations give a cryptic DB error,
      // this surfaces a clean, user-facing message instead
      const found = await tx
        .select()
        .from(exercises)
        .where(inArray(exercises.id, data.exercises));
      if (found.length !== data.exercises.length) {
        throw new ExerciseNotFoundError(
          "One or more exercise IDs do not exist",
        );
      }

      const [worksheet] = await tx
        .insert(worksheets)
        .values({
          created_by: defaultID,
          title: data.title,
          description: data.description,
          updated_at: new Date(),
        })
        .returning();

      if (data.exercises.length > 0) {
        await tx.insert(worksheets_exercises).values(
          data.exercises.map((exercise_id, index) => ({
            worksheet_id: worksheet.id,
            exercise_id,
            order: index, // order is derived from the position in the submitted array
          })),
        );
      }

      return worksheet;
    });
  } catch (error) {
    logger.error(`Failed to create worksheet: ${error}`);
    throw error;
  }
}

export async function updateWorksheetByID(id: string, data: CreateWorksheet) {
  try {
    return await db.transaction(async (tx) => {
      // validate exercise IDs before updating
      const found = await tx
        .select()
        .from(exercises)
        .where(inArray(exercises.id, data.exercises));
      if (found.length !== data.exercises.length) {
        throw new ExerciseNotFoundError(
          "One or more exercise IDs do not exist",
        );
      }

      const [worksheet] = await tx
        .update(worksheets)
        .set({
          title: data.title,
          description: data.description,
          updated_at: new Date(),
        })
        .where(eq(worksheets.id, id))
        .returning();

      if (!worksheet) {
        throw new WorksheetNotFoundError();
      }

      await tx
        .delete(worksheets_exercises)
        .where(eq(worksheets_exercises.worksheet_id, id));

      if (data.exercises.length > 0) {
        await tx.insert(worksheets_exercises).values(
          data.exercises.map((exercise_id, index) => ({
            worksheet_id: worksheet.id,
            exercise_id,
            order: index,
          })),
        );
      }

      return worksheet;
    });
  } catch (error) {
    if (error instanceof WorksheetNotFoundError) throw error;
    if (error instanceof ExerciseNotFoundError) throw error;
    logger.error(`Failed to update worksheet with ID ${id}: ${error}`);
    throw error;
  }
}

export async function deleteWorksheetByID(id: string) {
  try {
    return await db.transaction(async (tx) => {
      const [worksheet] = await tx
        .select()
        .from(worksheets)
        .where(eq(worksheets.id, id));
      if (!worksheet) {
        throw new WorksheetNotFoundError();
      }

      await tx
        .delete(worksheets_exercises)
        .where(eq(worksheets_exercises.worksheet_id, id));

      await tx.delete(worksheets).where(eq(worksheets.id, id));
    });
  } catch (error) {
    if (error instanceof WorksheetNotFoundError) throw error;
    logger.error(`Failed to delete worksheet with ID ${id}: ${error}`);
    throw error;
  }
}
