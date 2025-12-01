/**
 * Authentication Constants
 * JWT and authentication-related string constants
 */
export const AUTH = {
  BEARER_PREFIX: "Bearer ",
  BEARER_PREFIX_LENGTH: 7,
  JWT_ISSUER: "awc-proxy-backend",
  JWT_AUDIENCE: "awc-proxy-frontend",
  GUEST_ROUTE: "guest",
} as const;
