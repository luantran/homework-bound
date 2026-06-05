import { Hono } from "hono";
import * as logger from "./logger";
import exercisesRouter from "./routes/exercises";
import questionsRouter from "./routes/questions";
import worksheetsRouter from "./routes/worksheets";
import { cors } from "hono/cors";

logger.info(`Environment: ${process.env.DB_ENV}`);

const app = new Hono();
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));
app.get("/", (c) => c.json({ message: "good" }));

app.route("/exercises", exercisesRouter);
app.route("/questions", questionsRouter);
app.route("/worksheets", worksheetsRouter);

export default app;
