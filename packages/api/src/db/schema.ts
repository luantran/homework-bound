import {
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
  pgEnum,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";
import {
  ExerciseCategoryValues,
  QuestionTypeValues,
} from "@homework-bound/shared";
import { relations } from "drizzle-orm";

export const questionTypeEnum = pgEnum("question_type", QuestionTypeValues);
export const exercisesCategoryEnum = pgEnum(
  "exercise_category",
  ExerciseCategoryValues,
);

export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  created_by: uuid("created_by").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").notNull(),
  prompt: text("prompt").notNull(),
  hint: text("hint"),
  answer: text("answer").notNull(),
  options: jsonb("options"), // flexible shape — MCQ needs an array of choices, fill-in-the-blank needs none
  type: questionTypeEnum("type").notNull(),
});

export const exercises = pgTable("exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  created_by: uuid("created_by").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").notNull(),
  context: text("context"),
  category: exercisesCategoryEnum("category").notNull(),
});

// composite PK prevents the same question from being added to the same exercise twice
export const exercises_questions = pgTable(
  "exercises_questions",
  {
    exercise_id: uuid("exercise_id").references(() => exercises.id),
    question_id: uuid("question_id").references(() => questions.id),
    order: integer("order").notNull(),
  },
  (t) => [primaryKey({ columns: [t.exercise_id, t.question_id] })],
);

export const worksheets = pgTable("worksheets", {
  id: uuid("id").primaryKey().defaultRandom(),
  created_by: uuid("created_by").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").notNull(),
  title: text("title").notNull(),
  description: text("description"),
});

export const worksheets_exercises = pgTable(
  "worksheets_exercises",
  {
    worksheet_id: uuid("worksheet_id").references(() => worksheets.id),
    exercise_id: uuid("exercise_id").references(() => exercises.id),
    order: integer("order").notNull(),
  },
  (t) => [primaryKey({ columns: [t.worksheet_id, t.exercise_id] })],
);

// RELATIONS

export const exercisesRelations = relations(exercises, ({ many }) => ({
  exercises_questions: many(exercises_questions),
}));

export const exercisesQuestionsRelations = relations(
  exercises_questions,
  ({ one }) => ({
    exercise: one(exercises, {
      fields: [exercises_questions.exercise_id],
      references: [exercises.id],
    }),
    question: one(questions, {
      fields: [exercises_questions.question_id],
      references: [questions.id],
    }),
  }),
);
