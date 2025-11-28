import { beforeEach, describe, expect, it } from "@jest/globals";
import { NormalizationService } from "../../src/services/normalization.service";

describe("Normalization Service", () => {
  let service: NormalizationService;

  beforeEach(() => {
    service = new NormalizationService();
  });

  describe("normalizeSigmet", () => {
    it("should return empty FeatureCollection for null input", () => {
      const result = service.normalizeSigmet(null);
      expect(result).toEqual({
        type: "FeatureCollection",
        features: [],
      });
    });

    it("should normalize a single sigmet object", () => {
      // Unix timestamps: 2024-01-01T00:00:00Z = 1704067200, 2024-01-01T06:00:00Z = 1704088800
      const sigmetData = {
        icaoId: "KJFK",
        firId: "KZNY",
        firName: "KZNY NEW YORK",
        receiptTime: "2024-01-01T00:00:00.000Z",
        validTimeFrom: 1704067200,
        validTimeTo: 1704088800,
        seriesId: "TEST001",
        hazard: "TURBULENCE",
        qualifier: "SEV",
        base: 100,
        top: 300,
        geom: "AREA",
        coords: [
          { lon: 0, lat: 0 },
          { lon: 1, lat: 0 },
          { lon: 1, lat: 1 },
          { lon: 0, lat: 1 },
          { lon: 0, lat: 0 },
        ],
        dir: "NE",
        spd: "15",
        chng: "INTSF",
        rawSigmet: "Test SIGMET text",
      };

      const result = service.normalizeSigmet(sigmetData);
      expect(result.type).toBe("FeatureCollection");
      expect(result.features).toHaveLength(1);
      expect(result.features[0].type).toBe("Feature");
      expect(result.features[0].properties.bulletinId).toBe("TEST001");
      expect(result.features[0].properties.rawText).toBe("Test SIGMET text");
      expect(result.features[0].properties.hazardType).toBe("TURBULENCE");
      expect(result.features[0].properties.fir).toBe("KZNY");
      expect(result.features[0].properties.validityStart).toBe(
        "2024-01-01T00:00:00.000Z"
      );
      expect(result.features[0].properties.validityEnd).toBe(
        "2024-01-01T06:00:00.000Z"
      );
      expect(result.features[0].properties.altitudeRange).toEqual({
        min: 100,
        max: 300,
        unit: "FL",
      });
      expect(result.features[0].geometry.type).toBe("Polygon");
      expect(result.features[0].geometry.coordinates).toEqual([
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
          [0, 0],
        ],
      ]);
    });

    it("should normalize an array of sigmets", () => {
      const sigmetArray = [
        {
          seriesId: "TEST001",
          rawSigmet: "Test SIGMET 1",
          hazard: "TURBULENCE",
          geom: "AREA",
          coords: [
            { lon: 0, lat: 0 },
            { lon: 0.1, lat: 0.1 },
            { lon: 0, lat: 0 },
          ],
        },
        {
          seriesId: "TEST002",
          rawSigmet: "Test SIGMET 2",
          hazard: "ICING",
          geom: "AREA",
          coords: [
            { lon: 1, lat: 1 },
            { lon: 1.1, lat: 1.1 },
            { lon: 1, lat: 1 },
          ],
        },
      ];

      const result = service.normalizeSigmet(sigmetArray);
      expect(result.features).toHaveLength(2);
      expect(result.features[0].properties.bulletinId).toBe("TEST001");
      expect(result.features[1].properties.bulletinId).toBe("TEST002");
    });

    it("should handle missing optional fields", () => {
      const sigmetData = {
        geom: "AREA",
        coords: [
          { lon: 0, lat: 0 },
          { lon: 0.1, lat: 0.1 },
          { lon: 0, lat: 0 },
        ],
      };

      const result = service.normalizeSigmet(sigmetData);
      expect(result.features[0].properties.hazardType).toBe("UNKNOWN");
      expect(result.features[0].properties.bulletinId).toBe("");
      expect(result.features[0].properties.rawText).toBe("");
      expect(result.features[0].properties.validityStart).toBe("");
      expect(result.features[0].properties.validityEnd).toBe("");
    });

    it("should handle object with sigmets array", () => {
      const sigmetObject = {
        sigmets: [
          {
            seriesId: "TEST001",
            rawSigmet: "Test SIGMET",
            hazard: "TURBULENCE",
            geom: "AREA",
            coords: [
              { lon: 0, lat: 0 },
              { lon: 0.1, lat: 0.1 },
              { lon: 0, lat: 0 },
            ],
          },
        ],
      };

      const result = service.normalizeSigmet(sigmetObject);
      expect(result.features).toHaveLength(1);
      expect(result.features[0].properties.bulletinId).toBe("TEST001");
    });
  });

  describe("normalizeAirsigmet", () => {
    it("should return empty FeatureCollection for null input", () => {
      const result = service.normalizeAirsigmet(null);
      expect(result).toEqual({
        type: "FeatureCollection",
        features: [],
      });
    });

    it("should normalize a single airsigmet object", () => {
      // Unix timestamps: 2024-01-01T00:00:00Z = 1704067200, 2024-01-01T06:00:00Z = 1704088800
      const airsigmetData = {
        icaoId: "KJFK",
        alphaChar: "E",
        receiptTime: "2024-01-01T00:00:00.000Z",
        creationTime: "2024-01-01T00:05:00.000Z",
        validTimeFrom: 1704067200,
        validTimeTo: 1704088800,
        seriesId: "AIR001",
        airSigmetType: "SIGMET",
        hazard: "TURBULENCE",
        altitudeLow1: 200,
        altitudeHi1: 400,
        movementDir: 230,
        movementSpd: 25,
        rawAirSigmet: "Test AIRSIGMET text",
        postProcessFlag: 0,
        severity: 5,
        coords: [
          { lon: 0, lat: 0 },
          { lon: 1, lat: 0 },
          { lon: 1, lat: 1 },
          { lon: 0, lat: 1 },
          { lon: 0, lat: 0 },
        ],
      };

      const result = service.normalizeAirsigmet(airsigmetData);
      expect(result.type).toBe("FeatureCollection");
      expect(result.features).toHaveLength(1);
      expect(result.features[0].properties.bulletinId).toBe("AIR001");
      expect(result.features[0].properties.rawText).toBe("Test AIRSIGMET text");
      expect(result.features[0].properties.hazardType).toBe("TURBULENCE");
      expect(result.features[0].properties.validityStart).toBe(
        "2024-01-01T00:00:00.000Z"
      );
      expect(result.features[0].properties.validityEnd).toBe(
        "2024-01-01T06:00:00.000Z"
      );
      expect(result.features[0].properties.altitudeRange).toEqual({
        min: 200,
        max: 400,
        unit: "FL",
      });
      expect(result.features[0].geometry.type).toBe("Polygon");
    });

    it("should normalize an array of airsigmets", () => {
      const airsigmetArray = [
        {
          seriesId: "AIR001",
          rawAirSigmet: "Test AIRSIGMET 1",
          hazard: "TURBULENCE",
          coords: [
            { lon: 0, lat: 0 },
            { lon: 0.1, lat: 0.1 },
            { lon: 0, lat: 0 },
          ],
        },
        {
          seriesId: "AIR002",
          rawAirSigmet: "Test AIRSIGMET 2",
          hazard: "ICING",
          coords: [
            { lon: 1, lat: 1 },
            { lon: 1.1, lat: 1.1 },
            { lon: 1, lat: 1 },
          ],
        },
      ];

      const result = service.normalizeAirsigmet(airsigmetArray);
      expect(result.features).toHaveLength(2);
      expect(result.features[0].properties.bulletinId).toBe("AIR001");
      expect(result.features[1].properties.bulletinId).toBe("AIR002");
    });
  });
});
