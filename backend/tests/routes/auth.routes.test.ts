import request from "supertest";
import express from "express";
import authRoutes from "../../src/routes/auth.routes";

const app = express();
app.use(express.json());
app.use("/auth", authRoutes);

describe("Auth Routes", () => {
  describe("POST /auth/guest", () => {
    it("should return a JWT token", async () => {
      const response = await request(app).post("/auth/guest").expect(200);

      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("expiresIn", 900);
      expect(typeof response.body.token).toBe("string");
    });

    it("should return a valid JWT structure", async () => {
      const response = await request(app).post("/auth/guest").expect(200);

      const token = response.body.token;
      const parts = token.split(".");
      expect(parts).toHaveLength(3); // JWT has 3 parts
    });
  });
});
