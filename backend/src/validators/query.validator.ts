import { z } from "zod";

export const sigmetQuerySchema = z
  .object({
    nocache: z.enum(["0", "1"]).optional(),
    start: z.string().optional(),
    end: z.string().optional(),
    minAlt: z.string().optional(),
    maxAlt: z.string().optional(),
    hazard: z.string().optional(),
    fir: z.string().optional(),
  })
  .passthrough();

export const airsigmetQuerySchema = z
  .object({
    nocache: z.enum(["0", "1"]).optional(),
    start: z.string().optional(),
    end: z.string().optional(),
    minAlt: z.string().optional(),
    maxAlt: z.string().optional(),
    hazard: z.string().optional(),
    fir: z.string().optional(),
  })
  .passthrough();

export type SigmetQueryParams = z.infer<typeof sigmetQuerySchema>;
export type AirsigmetQueryParams = z.infer<typeof airsigmetQuerySchema>;
