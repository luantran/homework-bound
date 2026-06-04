import { serve } from "@hono/node-server";
import * as logger from "./logger";

import app from "./app";

serve({ fetch: app.fetch, port: 3000 }, (info) => {
  logger.info(`Server running on http://localhost:${info.port}`);
});
