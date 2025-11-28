import request from "supertest";
import express from "express";
import sigmetRoutes from "../../src/routes/sigmet.routes";
import { generateGuestToken } from "../../src/services/auth.service";
import { AWCService } from "../../src/services/awc.service";
import { NormalizationService } from "../../src/services/normalization.service";
import { AWCServiceError } from "../../src/errors/AWCServiceError";
import { errorHandler } from "../../src/middleware/security";

jest.mock("../../src/services/awc.service");
jest.mock("../../src/services/normalization.service");

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

  describe("GET /isigmet", () => {
    it("should return 401 without token", async () => {
      await request(app).get("/isigmet").expect(401);
    });

    it("should return 401 with invalid token", async () => {
      await request(app)
        .get("/isigmet")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);
    });

    it("should fetch and normalize sigmet data", async () => {
      const mockAWCData = {
        sigmets: [
          {
            icaoId: "KJFK",
            firId: "KZNY",
            seriesId: "TEST001",
            rawSigmet: "Test SIGMET",
            hazard: "TURBULENCE",
            validTimeFrom: 1704067200,
            validTimeTo: 1704088800,
            base: 100,
            top: 300,
            geom: "AREA",
            coords: [
              { lon: 0, lat: 0 },
              { lon: 0.1, lat: 0.1 },
              { lon: 0, lat: 0 },
            ],
          },
        ],
      };

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

      (AWCService.prototype.fetchSigmet as jest.Mock).mockResolvedValue(
        mockAWCData
      );
      (
        NormalizationService.prototype.normalizeSigmet as jest.Mock
      ).mockReturnValue(mockGeoJSON);

      const response = await request(app)
        .get("/isigmet")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual(mockGeoJSON);
      expect(AWCService.prototype.fetchSigmet).toHaveBeenCalled();
      expect(
        NormalizationService.prototype.normalizeSigmet
      ).toHaveBeenCalledWith(mockAWCData);
    });

    it("should bypass cache when nocache=1", async () => {
      const mockGeoJSON = {
        type: "FeatureCollection",
        features: [],
      };

      (AWCService.prototype.fetchSigmet as jest.Mock).mockResolvedValue({});
      (
        NormalizationService.prototype.normalizeSigmet as jest.Mock
      ).mockReturnValue(mockGeoJSON);

      await request(app)
        .get("/isigmet?nocache=1")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(AWCService.prototype.fetchSigmet).toHaveBeenCalled();
    });

    it("should surface known upstream errors", async () => {
      (AWCService.prototype.fetchSigmet as jest.Mock).mockRejectedValue(
        new AWCServiceError(504, "Request to AWC API timed out")
      );

      const response = await request(app)
        .get("/isigmet?nocache=1")
        .set("Authorization", `Bearer ${token}`)
        .expect(504);

      expect(response.body).toEqual({
        error: "Request to AWC API timed out",
      });
      expect(AWCService.prototype.fetchSigmet).toHaveBeenCalled();
    });

    it("should return 400 for invalid query parameters", async () => {
      await request(app)
        .get("/isigmet?nocache=invalid")
        .set("Authorization", `Bearer ${token}`)
        .expect(400);
    });
  });

  describe("GET /airsigmet", () => {
    it("should return 401 without token", async () => {
      await request(app).get("/airsigmet").expect(401);
    });

    it("should fetch and normalize airsigmet data", async () => {
      const mockAWCData = {
        airsigmets: [
          {
            icaoId: "KJFK",
            alphaChar: "E",
            seriesId: "AIR001",
            receiptTime: "2024-01-01T00:00:00.000Z",
            creationTime: "2024-01-01T00:05:00.000Z",
            validTimeFrom: 1704067200,
            validTimeTo: 1704088800,
            airSigmetType: "SIGMET",
            hazard: "ICING",
            altitudeLow1: 200,
            altitudeHi1: 400,
            movementDir: 230,
            movementSpd: 25,
            rawAirSigmet: "Test AIRSIGMET",
            postProcessFlag: 0,
            severity: 5,
            coords: [
              { lon: 1, lat: 1 },
              { lon: 1.1, lat: 1.1 },
              { lon: 1, lat: 1 },
            ],
          },
        ],
      };

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
              icaoId: "KJFK",
              alphaChar: "E",
              receiptTime: "2024-01-01T00:00:00.000Z",
              creationTime: "2024-01-01T00:05:00.000Z",
              airSigmetType: "SIGMET",
              movementDir: 230,
              movementSpd: 25,
              postProcessFlag: 0,
              severity: 5,
            },
          },
        ],
      };

      (AWCService.prototype.fetchAirsigmet as jest.Mock).mockResolvedValue(
        mockAWCData
      );
      (
        NormalizationService.prototype.normalizeAirsigmet as jest.Mock
      ).mockReturnValue(mockGeoJSON);

      const response = await request(app)
        .get("/airsigmet")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual(mockGeoJSON);
      expect(AWCService.prototype.fetchAirsigmet).toHaveBeenCalled();
      expect(
        NormalizationService.prototype.normalizeAirsigmet
      ).toHaveBeenCalledWith(mockAWCData);
    });
  });
});
