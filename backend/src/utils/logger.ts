import { env } from "../config/env";
import pino from "pino";

const isDev = env.nodeEnv === "development";

const baseLogger = pino({
  level: isDev ? "debug" : "info",
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
  // Redact sensitive fields (credentials, tokens, secrets) from logs
  redact: {
    // Dot notation paths with wildcards (* = one level, ** = multiple levels)
    paths: [
      "req.headers.authorization",
      "*.password",
      "*.token",
      "*.refreshToken",
      "*.secret",
      "**.*secret*",
    ],
    // Replacement string for redacted values
    censor: "***",
    // false = replace with censor, true = remove from output
    remove: false,
  },
});

export const logger = {
  info: (msg: string, metadata?: Record<string, unknown>): void => {
    baseLogger.info(metadata || {}, msg);
  },

  warn: (msg: string, metadata?: Record<string, unknown>): void => {
    baseLogger.warn(metadata || {}, msg);
  },

  error: (msg: string, metadata?: Record<string, unknown>): void => {
    baseLogger.error(metadata || {}, msg);
  },

  debug: (msg: string, metadata?: Record<string, unknown>): void => {
    if (isDev) {
      baseLogger.debug(metadata || {}, msg);
    }
  },
};
