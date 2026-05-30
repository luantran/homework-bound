import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./packages/api/src/db/schema.ts",
  out: "./packages/api/src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DB_ENV === "local"
        ? process.env.DATABASE_URL!
        : process.env.SUPABASE_DATABASE_URL!,
  },
});
