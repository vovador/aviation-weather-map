import { generateGuestToken } from "../../src/services/auth.service";
import jwt from "jsonwebtoken";
import { env } from "../../src/config/env";

describe("Auth Service", () => {
  describe("generateGuestToken", () => {
    it("should generate a valid JWT token", () => {
      const token = generateGuestToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });

    it("should have correct issuer claim", () => {
      const token = generateGuestToken();
      const decoded = jwt.decode(token) as jwt.JwtPayload;
      expect(decoded.iss).toBe("awc-proxy-backend");
    });

    it("should have correct audience claim", () => {
      const token = generateGuestToken();
      const decoded = jwt.decode(token) as jwt.JwtPayload;
      expect(decoded.aud).toBe("awc-proxy-frontend");
    });

    it("should have expiration time of 15 minutes", () => {
      const token = generateGuestToken();
      const decoded = jwt.decode(token) as jwt.JwtPayload;
      const now = Math.floor(Date.now() / 1000);
      const expectedExp = now + 15 * 60;

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();

      // Allow 1 second tolerance
      expect(Math.abs((decoded.exp as number) - expectedExp)).toBeLessThan(2);
      expect((decoded.exp as number) - (decoded.iat as number)).toBe(15 * 60);
    });

    it("should be verifiable with correct secret", () => {
      const token = generateGuestToken();
      expect(() => {
        jwt.verify(token, env.jwtSecret, {
          audience: "awc-proxy-frontend",
          issuer: "awc-proxy-backend",
        });
      }).not.toThrow();
    });

    it("should fail verification with wrong secret", () => {
      const token = generateGuestToken();
      expect(() => {
        jwt.verify(token, "wrong-secret");
      }).toThrow();
    });
  });
});
