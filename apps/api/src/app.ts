import express from "express";
import swaggerUi from "swagger-ui-express";
import { registerOrganizationModule } from "./class/organization";
import { getMongoConnectionState } from "./config/mongo";
import { openApiDocument } from "./docs/openapi";

export const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({ status: "ok", service: "api" });
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    mongo: getMongoConnectionState(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

registerOrganizationModule(app);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
