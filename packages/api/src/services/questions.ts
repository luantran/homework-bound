import { CreateQuestion } from "@homework-bound/shared";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { questions, exercises_questions } from "../db/schema";
import { QuestionNotFoundError } from "../errors";
import * as logger from "../logger";

// placeholder until auth is implemented — will be replaced with the authenticated user's ID
const defaultID = "00000000-0000-0000-0000-000000000000";

export async function getQuestions() {
  try {
    return await db.select().from(questions);
  } catch (error) {
    logger.error(`Failed to get questions: ${error}`);
    throw error;
  }
}

export async function getQuestionByID(id: string) {
  try {
    const [question] = await db
      .select()
      .from(questions)
      .where(eq(questions.id, id));
    if (!question) {
      throw new QuestionNotFoundError("Question ID does not exist");
    }
    return question;
  } catch (error) {
    if (error instanceof QuestionNotFoundError) throw error;
    logger.error(`Failed to get question of ID ${id}: ${error}`);
    throw error;
  }
}

export async function createQuestion(data: CreateQuestion) {
  try {
    const [question] = await db
      .insert(questions)
      .values({
        created_by: defaultID,
        prompt: data.prompt,
        hint: data.hint,
        answer: data.answer,
        type: data.type,
        options: data.options,
        updated_at: new Date(),
      })
      .returning();
    return question;
  } catch (error) {
    logger.error(`Failed to create question: ${error}`);
    throw error;
  }
}

export async function updateQuestionByID(id: string, data: CreateQuestion) {
  try {
    const [question] = await db
      .update(questions)
      .set({
        prompt: data.prompt,
        hint: data.hint,
        answer: data.answer,
        type: data.type,
        options: data.options,
        updated_at: new Date(),
      })
      .where(eq(questions.id, id))
      .returning();
    if (!question) {
      throw new QuestionNotFoundError("Question ID does not exist");
    }
    return question;
  } catch (error) {
    if (error instanceof QuestionNotFoundError) throw error;
    logger.error(`Failed to update question with ID ${id}: ${error}`);
    throw error;
  }
}

export async function deleteQuestionByID(id: string) {
  try {
    return await db.transaction(async (tx) => {
      const [question] = await tx
        .select()
        .from(questions)
        .where(eq(questions.id, id));
      if (!question) {
        throw new QuestionNotFoundError("Question ID does not exist");
      }

      // remove junction rows first to avoid FK violation when deleting the question
      await tx
        .delete(exercises_questions)
        .where(eq(exercises_questions.question_id, id));

      await tx.delete(questions).where(eq(questions.id, id));
    });
  } catch (error) {
    if (error instanceof QuestionNotFoundError) throw error;
    logger.error(`Failed to delete question with ID ${id}: ${error}`);
    throw error;
  }
}
