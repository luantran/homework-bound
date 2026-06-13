ALTER TABLE "exercises" ADD COLUMN "tags" text[];--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "tags" text[];--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "min_level" integer;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "max_level" integer;