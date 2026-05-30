CREATE TYPE "public"."exercise_category" AS ENUM('grammar', 'conjugaison', 'reading');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('mcq', 'fill_in_gap', 'short_answer');--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"context" text,
	"category" "exercise_category" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercises_questions" (
	"exercise_id" uuid,
	"question_id" uuid,
	"order" integer NOT NULL,
	CONSTRAINT "exercises_questions_exercise_id_question_id_pk" PRIMARY KEY("exercise_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"prompt" text NOT NULL,
	"hint" text,
	"answer" text NOT NULL,
	"options" jsonb,
	"type" "question_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "worksheets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"title" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "worksheets_exercises" (
	"worksheet_id" uuid,
	"exercise_id" uuid,
	"order" integer NOT NULL,
	CONSTRAINT "worksheets_exercises_worksheet_id_exercise_id_pk" PRIMARY KEY("worksheet_id","exercise_id")
);
--> statement-breakpoint
ALTER TABLE "exercises_questions" ADD CONSTRAINT "exercises_questions_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises_questions" ADD CONSTRAINT "exercises_questions_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worksheets_exercises" ADD CONSTRAINT "worksheets_exercises_worksheet_id_worksheets_id_fk" FOREIGN KEY ("worksheet_id") REFERENCES "public"."worksheets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worksheets_exercises" ADD CONSTRAINT "worksheets_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;