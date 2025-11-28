import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";
import { logger } from "../utils/logger";

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
        res.status(400).json({
          error: "Invalid query parameters",
          details: error.errors,
        });
        return;
      }
      next(error);
    }
  };
}
