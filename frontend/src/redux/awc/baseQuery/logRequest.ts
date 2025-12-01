// Consistent logging
export function logRequest(method: string, url: string, params?: unknown) {
  console.log(`[RTK] → ${method} ${url}`, params ? { params } : undefined);
}
