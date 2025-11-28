import request from "supertest";
import express from "express";
import { rateLimiter } from "../../src/middleware/security";

describe("Security Middleware", () => {
  describe("Rate Limiter", () => {
    it("should allow requests within limit", async () => {
      const app = express();
      app.use(rateLimiter);
      app.get("/test", (_req, res) => res.json({ ok: true }));

      const response = await request(app).get("/test");
      expect(response.status).toBe(200);
    });

    it("should return 429 when rate limit exceeded", async () => {
      const app = express();
      // Create a more aggressive rate limiter for testing
      const testRateLimiter = require("express-rate-limit")({
        windowMs: 1000,
        max: 2,
        standardHeaders: true,
        legacyHeaders: false,
      });
      app.use(testRateLimiter);
      app.get("/test", (_req, res) => res.json({ ok: true }));

      // Make requests up to the limit
      await request(app).get("/test");
      await request(app).get("/test");

      // This should be rate limited
      const response = await request(app).get("/test");
      expect(response.status).toBe(429);
    });
  });
});
