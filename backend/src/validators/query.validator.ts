import { z } from "zod";

/**
 * Query parameter schemas for weather endpoints.
 * Only accepts: minAlt, maxAlt, from, to, geometryType
 * All old AWC passthrough params (level, hazard, date, format, etc.) are removed.
 */
export const sigmetQuerySchema = z.object({
  minAlt: z.string().optional(),
  maxAlt: z.string().optional(),
  from: z.string().optional(), // ISO datetime
  to: z.string().optional(), // ISO datetime
  geometryType: z.string().optional(), // Polygon, Point, LineString, etc.
});

export const airsigmetQuerySchema = z.object({
  minAlt: z.string().optional(),
  maxAlt: z.string().optional(),
  from: z.string().optional(), // ISO datetime
  to: z.string().optional(), // ISO datetime
  geometryType: z.string().optional(), // Polygon, Point, LineString, etc.
});

export type SigmetQueryParams = z.infer<typeof sigmetQuerySchema>;
export type AirsigmetQueryParams = z.infer<typeof airsigmetQuerySchema>;
