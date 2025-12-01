/**
 * API Error Code Constants
 * Error codes used by ApiClient for categorizing different error types
 */
export const API_ERROR_CODES = {
  TIMEOUT: "TIMEOUT",
  NETWORK: "NETWORK",
  NON_200: "NON_200",
  INVALID: "INVALID",
  UNKNOWN: "UNKNOWN",
} as const;

export type ApiClientErrorCode =
  (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];
