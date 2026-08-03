import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { env } from "./config/env.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";

const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());
if (env.nodeEnv !== "test") {
  app.use(morgan("dev"));
}

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
