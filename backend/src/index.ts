import express from "express";
import { env } from "./config/env";
import {
  apiSecurityHeaders,
  swaggerSecurityHeaders,
  corsMiddleware,
  errorHandler,
} from "./middleware/security";
import authRoutes from "./routes/auth.routes";
import sigmetRoutes from "./routes/sigmet.routes";
import swaggerRoutes from "./routes/swagger.routes";
import { logger } from "./utils/logger";
import { API_ROUTES } from "./constants/apiRoutes";

const app = express();

// Global security headers for all API routes (JSON only, no HTML served)
// Only minimal protections are needed for a pure API.
app.use(apiSecurityHeaders);
app.use(corsMiddleware);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI serves HTML, inline scripts, styles, and sometimes CDN assets.
// It requires a relaxed CSP, so we scope this configuration only to the `/docs` route.
app.use(API_ROUTES.DOCS, swaggerSecurityHeaders);
// Swagger documentation
app.use(API_ROUTES.DOCS, swaggerRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use(API_ROUTES.AUTH, authRoutes);
app.use("/", sigmetRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(env.port, () => {
  logger.info("Server started", {
    port: env.port,
    environment: env.nodeEnv,
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});

export default app;
