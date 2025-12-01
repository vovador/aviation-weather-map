import { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { AWCServiceError } from "../errors/AWCServiceError";
import { HTTP_STATUS } from "../constants/httpStatus";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { ENVIRONMENT } from "../constants/environment";
import { HTTP_METHODS } from "../constants/httpMethods";

// Global security headers for all API routes (JSON only, no HTML served)
// Only minimal protections are needed for a pure API.
export const apiSecurityHeaders = helmet({
  // Hides the `X-Powered-By` header to avoid exposing Express and reducing fingerprinting for attackers.
  hidePoweredBy: true,
  // Prevents browsers from MIME-sniffing responses, ensuring the declared Content-Type is respected.
  noSniff: true,
  // Controls how much referrer information the browser sends when making requests.
  // This helps prevent leaking full URLs to third-party domains.
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
});

// Swagger UI serves HTML, inline scripts, styles, and sometimes CDN assets.
// It requires a relaxed CSP, so we scope this configuration only to the `/docs` route.
export const swaggerSecurityHeaders = helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      // Swagger UI uses inline <script> tags and sometimes loads from CDN.
      "script-src": ["'self'", "'unsafe-inline'", "https:"],
      // Swagger UI injects inline styles and loads fonts/icons from CDN.
      "style-src": ["'self'", "'unsafe-inline'", "https:"],
      // Allow images from self, HTTPS CDNs, and inline data URLs.
      "img-src": ["'self'", "data:", "https:"],
    },
  },
  // Prevents Swagger UI from being embedded in an iframe → protects against clickjacking.
  frameguard: { action: "deny" },
  // Prevents MIME-type sniffing.
  noSniff: true,
  // Prevents leaking full URL paths when navigating from Swagger UI to external links.
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
});

export const corsMiddleware = cors({
  origin: env.frontendOrigin,
  methods: [HTTP_METHODS.GET, HTTP_METHODS.HEAD],
  credentials: true,
  optionsSuccessStatus: 200,
});

export const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn("Rate limit exceeded", { ip: req.ip });
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      error: ERROR_MESSAGES.TOO_MANY_REQUESTS,
    });
  },
});

/**
 * Global error-handling middleware that centralizes HTTP error translation.
 *
 * This middleware ensures that controllers remain focused solely on transport
 * concerns (reading input, calling services, sending responses). By moving
 * error-to-HTTP mapping here, we:
 *
 * - Prevent controllers from mixing business logic with HTTP formatting
 * - Enable consistent error responses across all endpoints
 * - Make it easier to add new error types without touching controllers
 * - Centralize error logging and monitoring
 *
 * Controllers should never format errors into HTTP responses — they should
 * simply call services and forward any errors via next(error).
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Handle known AWC service errors (e.g., upstream API failures, timeouts)
  if (err instanceof AWCServiceError) {
    logger.warn(`Failed to fetch AWC data`, {
      status: err.statusCode,
      message: err.message,
      path: req.path,
    });

    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Handle all other unknown errors
  logger.error("Unhandled error", {
    message: err.message,
    stack: env.nodeEnv === ENVIRONMENT.DEVELOPMENT ? err.stack : undefined,
    path: req.path,
  });

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    error:
      env.nodeEnv === ENVIRONMENT.PRODUCTION
        ? ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        : err.message,
  });
}
