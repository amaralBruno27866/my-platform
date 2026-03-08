import express from "express";
import swaggerUi from "swagger-ui-express";
import { registerAuthModule } from "./auth";
import { registerOrganizationModule } from "./class/organization";
import { getMongoConnectionState } from "./config/mongo";
import { openApiDocument } from "./docs/openapi";
import { getRedisConnectionState } from "./infra/redis";
import { requestIdMiddleware } from "./request-handling";
import { globalErrorHandler } from "./error-handling";

export const app = express();

// 1️⃣ Request ID middleware (FIRST - before all others)
app.use(requestIdMiddleware);

// 2️⃣ Body parser
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({ status: "ok", service: "api" });
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    mongo: getMongoConnectionState(),
    redis: getRedisConnectionState(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 3️⃣ Domain routes
registerOrganizationModule(app);
registerAuthModule(app);

// 4️⃣ API docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

// 5️⃣ Global error handler (LAST middleware!)
// MUST be after all other middleware and routes
app.use(globalErrorHandler);
