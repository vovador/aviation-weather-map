/**
 * Error Message Constants
 * Centralized error messages to ensure consistency and enable easy updates
 */
export const ERROR_MESSAGES = {
  // Authentication errors
  MISSING_OR_INVALID_AUTH_HEADER: "Missing or invalid Authorization header",
  TOKEN_EXPIRED: "Token expired",
  INVALID_TOKEN: "Invalid token",
  FAILED_TO_GENERATE_TOKEN: "Failed to generate token",

  // API Client errors
  REQUEST_TIMED_OUT: "Request timed out",
  FAILED_TO_CONNECT_TO_REMOTE_API: "Failed to connect to remote API",
  UNEXPECTED_ERROR_OCCURRED: "Unexpected error occurred",
  REMOTE_API_RESPONDED_WITH: (status: number | string) =>
    `Remote API responded with ${status}`,
  INVALID_RESPONSE_STRUCTURE:
    "Remote API returned an invalid response structure",
  UNKNOWN_AXIOS_ERROR: "Unknown axios error",

  // AWC Service errors
  AWC_API_TIMED_OUT: "Request to AWC API timed out",
  AWC_API_CONNECTION_FAILED: "Failed to connect to AWC API",
  AWC_API_RETURNED_STATUS: (status: number | string) =>
    `AWC API returned status ${status}`,
  AWC_API_INVALID_RESPONSE: "Invalid response structure from AWC API",
  AWC_API_ERROR: (message: string) => `AWC API error: ${message}`,
  AWC_API_UNKNOWN_ERROR: "AWC API error: Unknown error",

  // Validation errors
  INVALID_QUERY_PARAMETERS: "Invalid query parameters",

  // Rate limiting
  TOO_MANY_REQUESTS: "Too many requests, please try again later",

  // Generic errors
  INTERNAL_SERVER_ERROR: "Internal server error",
} as const;
