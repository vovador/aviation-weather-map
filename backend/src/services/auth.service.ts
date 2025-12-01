import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AUTH } from "../constants/auth";

export interface JWTPayload {
  iss: string;
  aud: string;
  iat: number;
  exp: number;
}

export function generateGuestToken(): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: JWTPayload = {
    iss: AUTH.JWT_ISSUER,
    aud: AUTH.JWT_AUDIENCE,
    iat: now,
    exp: now + 15 * 60, // 15 minutes
  };

  return jwt.sign(payload, env.jwtSecret);
}
