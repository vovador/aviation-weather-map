import { logger } from "@/utils/logger";

// Consistent logging
export function logRequest(method: string, url: string, params?: unknown) {
  logger.debug(`[RTK] → ${method} ${url}`, params ? { params } : undefined);
}
