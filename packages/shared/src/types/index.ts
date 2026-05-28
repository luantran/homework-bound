import { z } from "zod";
import {
  ExerciseSchema,
  QuestionSchema,
  WorksheetSchema,
  CreateExerciseSchema,
  CreateQuestionSchema,
  CreateWorksheetSchema,
  UserSchema,
} from "../schemas";

export type User = z.infer<typeof UserSchema>;
export type CreateQuestion = z.infer<typeof CreateQuestionSchema>;
export type CreateExercise = z.infer<typeof CreateExerciseSchema>;
export type CreateWorksheet = z.infer<typeof CreateWorksheetSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type Exercise = z.infer<typeof ExerciseSchema>;
export type Worksheet = z.infer<typeof WorksheetSchema>;
