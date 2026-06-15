DELETE FROM "exercises_questions";--> statement-breakpoint
DELETE FROM "questions";--> statement-breakpoint
ALTER TABLE "exercises_questions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "exercises_questions" CASCADE;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "exercise_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;