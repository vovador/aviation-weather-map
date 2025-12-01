export function logResponse(
  method: string,
  url: string,
  duration: number,
  result: any
) {
  if (result.error) {
    console.error(
      `[RTK] ✗ ${method} ${url} FAILED (${duration}ms)`,
      result.error
    );
    return;
  }

  const data = result.data;
  const featureCount =
    data?.features && Array.isArray(data.features)
      ? data.features.length
      : undefined;

  console.log(`[RTK] ✓ ${method} ${url} (${duration}ms)`, {
    keys: data ? Object.keys(data) : [],
    features: featureCount,
  });
}
