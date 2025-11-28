import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface JWTPayload {
  iss: string;
  aud: string;
  iat: number;
  exp: number;
}

export function generateGuestToken(): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: JWTPayload = {
    iss: "awc-proxy-backend",
    aud: "awc-proxy-frontend",
    iat: now,
    exp: now + 15 * 60, // 15 minutes
  };

  return jwt.sign(payload, env.jwtSecret);
}
