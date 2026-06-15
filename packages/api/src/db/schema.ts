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

export const exercises = pgTable("exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  created_by: uuid("created_by").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").notNull(),
  context: text("context"),
  prompt: text("prompt"),
  category: exercisesCategoryEnum("category").notNull(),
  tags: text("tags").array(),
  min_level: integer("min_level"),
  max_level: integer("max_level"),
});

export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  created_by: uuid("created_by").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").notNull(),
  exercise_id: uuid("exercise_id")
    .references(() => exercises.id)
    .notNull(),
  prompt: text("prompt").notNull(),
  hint: text("hint"),
  answer: text("answer").notNull(),
  options: jsonb("options"),
  type: questionTypeEnum("type").notNull(),
  tags: text("tags").array(),
  min_level: integer("min_level"),
  max_level: integer("max_level"),
});

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
  questions: many(questions),
  worksheets_exercises: many(worksheets_exercises),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  exercise: one(exercises, {
    fields: [questions.exercise_id],
    references: [exercises.id],
  }),
}));

export const worksheetsRelations = relations(worksheets, ({ many }) => ({
  worksheets_exercises: many(worksheets_exercises),
}));

export const worksheetsExercisesRelations = relations(
  worksheets_exercises,
  ({ one }) => ({
    worksheet: one(worksheets, {
      fields: [worksheets_exercises.worksheet_id],
      references: [worksheets.id],
    }),
    exercise: one(exercises, {
      fields: [worksheets_exercises.exercise_id],
      references: [exercises.id],
    }),
  }),
);
