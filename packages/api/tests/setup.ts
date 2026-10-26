import * as dotenv from "dotenv";
import * as path from "path";

export function setup() {
  // load env vars from root .env.local since vitest doesn't use the dev script
  dotenv.config({ path: path.resolve(__dirname, "../../../.env.local") });

  // CI provides its own throwaway DATABASE_URL; locally, tests wipe tables so they must never hit the dev DB
  if (process.env.CI) return;
  if (!process.env.TEST_DATABASE_URL) {
    throw new Error(
      "TEST_DATABASE_URL is not set in .env.local - refusing to run tests against the dev database",
    );
  }
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}
