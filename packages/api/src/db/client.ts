import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString =
  process.env.DB_ENV === "prod"
    ? process.env.SUPABASE_DATABASE_URL
    : process.env.DATABASE_URL;

const pool = new Pool({ connectionString: connectionString });

export const db = drizzle(pool, { schema });
