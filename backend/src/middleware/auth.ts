import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { HTTP_STATUS } from "../constants/httpStatus";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { AUTH } from "../constants/auth";

export interface AuthRequest extends Request {
  user?: { iat: number; exp: number };
}

/**
 * Verifies JWT tokens passed via the `Authorization: Bearer <token>` header.
 * Rejects requests with missing/invalid/expired tokens.
 * Attaches decoded JWT payload to req.user on success.
 */
export function verifyJWT(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  // --- 1. Validate presence and format of the Authorization header ---
  if (!authHeader?.startsWith(AUTH.BEARER_PREFIX)) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: ERROR_MESSAGES.MISSING_OR_INVALID_AUTH_HEADER,
    });
    return;
  }

  const token = authHeader.slice(AUTH.BEARER_PREFIX_LENGTH); // drop "Bearer "

  try {
    // --- 2. Verify signature and claims ---
    const decoded = jwt.verify(token, env.jwtSecret, {
      audience: AUTH.JWT_AUDIENCE,
      issuer: AUTH.JWT_ISSUER,
    }) as { iat: number; exp: number };

    // --- 3. Inject user into request and continue ---
    req.user = decoded;
    next();
  } catch (err) {
    handleJwtError(err, token, res);
  }
}

/**
 * Converts JWT library errors into consistent HTTP responses
 * and logs the error details appropriately.
 */
function handleJwtError(error: unknown, token: string, res: Response): void {
  // Expired token
  if (error instanceof jwt.TokenExpiredError) {
    logger.warn("JWT token expired", {
      token: token.slice(0, 10) + "…",
    });
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: ERROR_MESSAGES.TOKEN_EXPIRED,
    });
    return;
  }

  // Invalid token (signature mismatch, malformed, wrong claims, etc.)
  if (error instanceof jwt.JsonWebTokenError) {
    logger.warn("Invalid JWT token", { error: error.message });
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: ERROR_MESSAGES.INVALID_TOKEN,
    });
    return;
  }

  // Unexpected / internal JWT error
  logger.error("JWT verification error", { error });
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
  });
}
