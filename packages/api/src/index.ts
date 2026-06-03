import { Hono } from "hono";
import { serve } from "@hono/node-server";
import * as logger from "./logger";
import exercisesRouter from "./routes/exercises";

logger.info(`Environment: ${process.env.DB_ENV}`);

const app = new Hono();
app.get("/", (c) => c.json({ message: "good" }));

app.route("/exercises", exercisesRouter);

serve({ fetch: app.fetch, port: 3000 }, (info) => {
  logger.info(`Server running on http://localhost:${info.port}`);
});
