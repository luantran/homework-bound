import { z } from "zod";
import {
  ExerciseCategory,
  QuestionType,
  SchoolLevel,
  UserRole,
} from "../enums";

const DbFieldsSchema = z.object({
  id: z.uuid(),
  created_by: z.uuid(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const UserSchema = z.object({
  name: z.string(),
  email: z.email(),
  role: z.enum(UserRole),
  school_name: z.string().optional(),
  school_level: z.enum(SchoolLevel).optional(),
});

export const CreateQuestionSchema = z.object({
  prompt: z.string(),
  hint: z.string().optional(),
  answer: z.string(),
  type: z.enum(QuestionType),
  options: z.record(z.string(), z.string()).optional(),
});

export const QuestionSchema = CreateQuestionSchema.extend({
  ...DbFieldsSchema.shape,
});

export const CreateExerciseSchema = z.object({
  context: z.string().optional(),
  category: z.enum(ExerciseCategory),
  questions: z.array(z.uuid()),
});

export const ExerciseSchema = CreateExerciseSchema.extend({
  ...DbFieldsSchema.shape,
  questions: z.array(QuestionSchema),
});

export const CreateWorksheetSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  exercises: z.array(z.uuid()),
});

export const WorksheetSchema = CreateWorksheetSchema.extend({
  ...DbFieldsSchema.shape,
  exercises: z.array(ExerciseSchema),
});
