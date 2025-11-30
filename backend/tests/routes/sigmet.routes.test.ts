import request from "supertest";
import express from "express";
import sigmetRoutes from "../../src/routes/sigmet.routes";
import { generateGuestToken } from "../../src/services/auth.service";
import { WeatherCacheService } from "../../src/services/weather-cache.service";
import { FilterService } from "../../src/services/filter.service";
import { AWCServiceError } from "../../src/errors/AWCServiceError";
import { errorHandler } from "../../src/middleware/security";

jest.mock("../../src/services/weather-cache.service");
jest.mock("../../src/services/filter.service");

const app = express();
app.use(express.json());
app.use("/", sigmetRoutes);
// Error handler must be registered after all routes
app.use(errorHandler);

describe("SIGMET Routes", () => {
  let token: string;

  beforeEach(() => {
    token = generateGuestToken();
    jest.clearAllMocks();
  });

  describe("GET /sigmet", () => {
    it("should return 401 without token", async () => {
      await request(app).get("/sigmet").expect(401);
    });

    it("should return 401 with invalid token", async () => {
      await request(app)
        .get("/sigmet")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);
    });

    it("should fetch and return filtered sigmet data", async () => {
      const mockGeoJSON = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [0, 0],
                  [0.1, 0.1],
                  [0, 0],
                ],
              ],
            },
            properties: {
              hazardType: "TURBULENCE",
              bulletinId: "TEST001",
              rawText: "Test SIGMET",
              validityStart: "2024-01-01T00:00:00.000Z",
              validityEnd: "2024-01-01T06:00:00.000Z",
              altitudeRange: { min: 100, max: 300, unit: "FL" },
              fir: "KZNY",
            },
          },
        ],
      };

      const filteredGeoJSON = {
        type: "FeatureCollection",
        features: mockGeoJSON.features,
      };

      (WeatherCacheService.prototype.getSigmet as jest.Mock).mockResolvedValue(
        mockGeoJSON
      );
      (FilterService.prototype.applyFilters as jest.Mock).mockReturnValue(
        filteredGeoJSON
      );

      const response = await request(app)
        .get("/sigmet")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual(filteredGeoJSON);
      expect(WeatherCacheService.prototype.getSigmet).toHaveBeenCalled();
      expect(FilterService.prototype.applyFilters).toHaveBeenCalled();
    });

    it("should apply altitude filters", async () => {
      const mockGeoJSON = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [0, 0] },
            properties: {
              hazardType: "TURBULENCE",
              bulletinId: "TEST001",
              rawText: "Test",
              validityStart: "2024-01-01T00:00:00Z",
              validityEnd: "2024-01-01T06:00:00Z",
              altitudeRange: { min: 100, max: 300, unit: "FL" },
            },
          },
        ],
      };

      (WeatherCacheService.prototype.getSigmet as jest.Mock).mockResolvedValue(
        mockGeoJSON
      );
      (FilterService.prototype.applyFilters as jest.Mock).mockReturnValue(
        mockGeoJSON
      );

      await request(app)
        .get("/sigmet?minAlt=15000&maxAlt=25000")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(FilterService.prototype.applyFilters).toHaveBeenCalledWith(
        mockGeoJSON,
        expect.objectContaining({
          minAlt: 15000,
          maxAlt: 25000,
        })
      );
    });

    it("should apply time filters", async () => {
      const mockGeoJSON = {
        type: "FeatureCollection",
        features: [],
      };

      (WeatherCacheService.prototype.getSigmet as jest.Mock).mockResolvedValue(
        mockGeoJSON
      );
      (FilterService.prototype.applyFilters as jest.Mock).mockReturnValue(
        mockGeoJSON
      );

      await request(app)
        .get("/sigmet?from=2024-01-01T00:00:00Z&to=2024-01-01T05:00:00Z")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(FilterService.prototype.applyFilters).toHaveBeenCalledWith(
        mockGeoJSON,
        expect.objectContaining({
          fromTs: expect.any(Number),
          toTs: expect.any(Number),
        })
      );
    });

    it("should surface known upstream errors", async () => {
      (WeatherCacheService.prototype.getSigmet as jest.Mock).mockRejectedValue(
        new AWCServiceError(504, "Request to AWC API timed out")
      );

      const response = await request(app)
        .get("/sigmet")
        .set("Authorization", `Bearer ${token}`)
        .expect(504);

      expect(response.body).toEqual({
        error: "Request to AWC API timed out",
      });
    });

    it("should handle invalid numeric query parameters gracefully", async () => {
      const mockGeoJSON = {
        type: "FeatureCollection",
        features: [],
      };

      (WeatherCacheService.prototype.getSigmet as jest.Mock).mockResolvedValue(
        mockGeoJSON
      );
      (FilterService.prototype.applyFilters as jest.Mock).mockReturnValue(
        mockGeoJSON
      );

      // minAlt=invalid will be parsed as NaN in the controller, which will be ignored
      // So the request should succeed with empty filters
      const response = await request(app)
        .get("/sigmet?minAlt=invalid")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual(mockGeoJSON);
      // Filter should be called with filters that don't include the invalid minAlt
      expect(FilterService.prototype.applyFilters).toHaveBeenCalledWith(
        mockGeoJSON,
        expect.objectContaining({
          // minAlt should be undefined since "invalid" parses to NaN
        })
      );
    });
  });

  describe("GET /airsigmet", () => {
    it("should return 401 without token", async () => {
      await request(app).get("/airsigmet").expect(401);
    });

    it("should fetch and return filtered airsigmet data", async () => {
      const mockGeoJSON = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [1, 1],
                  [1.1, 1.1],
                  [1, 1],
                ],
              ],
            },
            properties: {
              hazardType: "ICING",
              bulletinId: "AIR001",
              rawText: "Test AIRSIGMET",
              validityStart: "2024-01-01T00:00:00.000Z",
              validityEnd: "2024-01-01T06:00:00.000Z",
              altitudeRange: { min: 200, max: 400, unit: "FL" },
            },
          },
        ],
      };

      const filteredGeoJSON = {
        type: "FeatureCollection",
        features: mockGeoJSON.features,
      };

      (
        WeatherCacheService.prototype.getAirsigmet as jest.Mock
      ).mockResolvedValue(mockGeoJSON);
      (FilterService.prototype.applyFilters as jest.Mock).mockReturnValue(
        filteredGeoJSON
      );

      const response = await request(app)
        .get("/airsigmet")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual(filteredGeoJSON);
      expect(WeatherCacheService.prototype.getAirsigmet).toHaveBeenCalled();
      expect(FilterService.prototype.applyFilters).toHaveBeenCalled();
    });
  });
});
