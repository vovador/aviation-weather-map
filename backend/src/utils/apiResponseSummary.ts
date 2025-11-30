/**
 * Creates a summary of API response data for logging purposes.
 * This is a pure, standalone utility that does not depend on any domain-specific logic.
 *
 * @param data - The response data to summarize
 * @returns A summary object with type information and relevant metadata
 */
export function createApiResponseSummary(
  data: unknown
): Record<string, unknown> {
  if (!data || typeof data !== "object") {
    return { type: typeof data };
  }

  if (Array.isArray(data)) {
    return {
      type: "array",
      length: data.length,
    };
  }

  const obj = data as Record<string, unknown>;
  const keys = Object.keys(obj);
  const summary: Record<string, unknown> = {
    type: "object",
    keys: keys,
    keyCount: keys.length,
  };

  // Add array length if there's a common collection key
  for (const key of ["sigmets", "airsigmets", "features", "items"]) {
    if (key in obj && Array.isArray(obj[key])) {
      summary[`${key}Count`] = (obj[key] as unknown[]).length;
    }
  }

  return summary;
}
