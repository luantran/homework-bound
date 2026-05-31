import { Hono } from "hono";
import { serve } from "@hono/node-server";
import * as logger from "./src/logger";

const app = new Hono();
app.get("/", (c) => c.json({ message: "good" }));
serve({ fetch: app.fetch, port: 3000 }, (info) => {
  logger.info(`Server running on http://localhost:${info.port}`);
});
