/**
 * HTTP methods
 */
export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
} as const;

/**
 * HTTP header names
 */
export const HTTP_HEADERS = {
  CONTENT_TYPE: "Content-Type",
  AUTHORIZATION: "Authorization",
} as const;

/**
 * HTTP header values
 */
export const HTTP_HEADER_VALUES = {
  APPLICATION_JSON: "application/json",
  BEARER_PREFIX: "Bearer ",
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
} as const;
