import { Request } from "express";
import { logger } from "../utils/logger";

/**
 * Method decorator that automatically logs Express controller requests.
 *
 * Logs before execution (debug level):
 * - Controller class name
 * - Method name
 * - Request path
 * - HTTP method
 * - Query parameters
 *
 * Logs after execution (debug level):
 * - Execution duration in milliseconds
 *
 * Logs errors using logger.error and re-throws them to preserve Express error handling.
 *
 * Supports both sync and async controller methods.
 */
export function LogControllerRequest() {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;
    const className = target?.constructor?.name || "UnknownController";

    descriptor.value = async function (...args: unknown[]): Promise<unknown> {
      // Extract req from arguments
      const req = args[0] as Request;

      const startTime = Date.now();

      // Log before execution
      logger.debug("Controller request received", {
        controller: className,
        method: propertyKey,
        path: req.path,
        httpMethod: req.method,
        query: req.query,
      });

      try {
        // Call the original method with preserved context
        const result = await originalMethod.apply(this, args);

        // Calculate duration
        const duration = Date.now() - startTime;

        // Log after successful execution
        logger.debug("Controller request completed", {
          controller: className,
          method: propertyKey,
          path: req.path,
          httpMethod: req.method,
          durationMs: duration,
        });

        return result;
      } catch (error) {
        // Calculate duration even on error
        const duration = Date.now() - startTime;

        // Log error
        logger.error("Controller request failed", {
          controller: className,
          method: propertyKey,
          path: req.path,
          httpMethod: req.method,
          durationMs: duration,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });

        // Re-throw to preserve Express error handling
        throw error;
      }
    };

    return descriptor;
  };
}
