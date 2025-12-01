import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";
import { logger } from "../utils/logger";
import { HTTP_STATUS } from "../constants/httpStatus";
import { ERROR_MESSAGES } from "../constants/errorMessages";

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated as Record<string, string>;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn("Validation error", {
          errors: error.errors,
          query: req.query,
        });
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: ERROR_MESSAGES.INVALID_QUERY_PARAMETERS,
          details: error.errors,
        });
        return;
      }
      next(error);
    }
  };
}
