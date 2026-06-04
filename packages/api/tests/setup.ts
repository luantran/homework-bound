import * as dotenv from "dotenv";
import * as path from "path";

export function setup() {
  // load env vars from root .env.local since vitest doesn't use the dev script
  dotenv.config({ path: path.resolve(__dirname, "../../../.env.local") });
}
