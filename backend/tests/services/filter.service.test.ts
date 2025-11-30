import { FilterService } from "../../src/services/filter.service";
import {
  GeoJSONFeatureCollection,
  GeoJSONFeature,
} from "../../src/types/geojson";

describe("FilterService", () => {
  let service: FilterService;

  beforeEach(() => {
    service = new FilterService();
  });

  describe("applyFilters", () => {
    const createFeature = (
      minAlt?: number,
      maxAlt?: number,
      validFrom?: string,
      validTo?: string
    ): GeoJSONFeature => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [0, 0],
      },
      properties: {
        hazardType: "TURBULENCE",
        bulletinId: "TEST001",
        rawText: "Test",
        validityStart: validFrom || "2024-01-01T00:00:00Z",
        validityEnd: validTo || "2024-01-01T06:00:00Z",
        ...(minAlt !== undefined || maxAlt !== undefined
          ? {
              altitudeRange: {
                min: minAlt,
                max: maxAlt,
                unit: "FL",
              },
            }
          : {}),
      },
    });

    it("should return all features when no filters are applied", () => {
      const collection: GeoJSONFeatureCollection = {
        type: "FeatureCollection",
        features: [createFeature(100, 300), createFeature(200, 400)],
      };

      const result = service.applyFilters(collection, {});

      expect(result.features).toHaveLength(2);
    });

    it("should filter by altitude range - overlap case", () => {
      const collection: GeoJSONFeatureCollection = {
        type: "FeatureCollection",
        features: [
          createFeature(100, 300), // 10000-30000 feet
          createFeature(200, 400), // 20000-40000 feet
          createFeature(500, 600), // 50000-60000 feet (out of range)
        ],
      };

      // Filter: 15000-25000 feet (overlaps with first two)
      const result = service.applyFilters(collection, {
        minAlt: 15000,
        maxAlt: 25000,
      });

      expect(result.features).toHaveLength(2);
    });

    it("should filter by altitude range - no overlap", () => {
      const collection: GeoJSONFeatureCollection = {
        type: "FeatureCollection",
        features: [
          createFeature(100, 200), // 10000-20000 feet
          createFeature(300, 400), // 30000-40000 feet
        ],
      };

      // Filter: 25000-28000 feet (no overlap)
      const result = service.applyFilters(collection, {
        minAlt: 25000,
        maxAlt: 28000,
      });

      expect(result.features).toHaveLength(0);
    });

    it("should filter by time range - overlap case", () => {
      const collection: GeoJSONFeatureCollection = {
        type: "FeatureCollection",
        features: [
          createFeature(
            undefined,
            undefined,
            "2024-01-01T00:00:00Z",
            "2024-01-01T06:00:00Z"
          ),
          createFeature(
            undefined,
            undefined,
            "2024-01-01T10:00:00Z",
            "2024-01-01T12:00:00Z"
          ),
        ],
      };

      // Filter: 2024-01-01T02:00:00Z to 2024-01-01T08:00:00Z
      const result = service.applyFilters(collection, {
        fromTs: Math.floor(new Date("2024-01-01T02:00:00Z").getTime() / 1000),
        toTs: Math.floor(new Date("2024-01-01T08:00:00Z").getTime() / 1000),
      });

      expect(result.features).toHaveLength(1);
    });

    it("should filter by both altitude and time", () => {
      const collection: GeoJSONFeatureCollection = {
        type: "FeatureCollection",
        features: [
          createFeature(
            100,
            300,
            "2024-01-01T00:00:00Z",
            "2024-01-01T06:00:00Z"
          ),
          createFeature(
            200,
            400,
            "2024-01-01T00:00:00Z",
            "2024-01-01T06:00:00Z"
          ),
          createFeature(
            100,
            300,
            "2024-01-01T10:00:00Z",
            "2024-01-01T12:00:00Z"
          ), // Wrong time
          createFeature(
            500,
            600,
            "2024-01-01T00:00:00Z",
            "2024-01-01T06:00:00Z"
          ), // Wrong altitude
        ],
      };

      const result = service.applyFilters(collection, {
        minAlt: 15000,
        maxAlt: 25000,
        fromTs: Math.floor(new Date("2024-01-01T02:00:00Z").getTime() / 1000),
        toTs: Math.floor(new Date("2024-01-01T04:00:00Z").getTime() / 1000),
      });

      expect(result.features).toHaveLength(2);
    });

    it("should include features without altitude info when filtering by altitude", () => {
      const collection: GeoJSONFeatureCollection = {
        type: "FeatureCollection",
        features: [
          createFeature(100, 300),
          createFeature(), // No altitude range
        ],
      };

      const result = service.applyFilters(collection, {
        minAlt: 15000,
        maxAlt: 25000,
      });

      expect(result.features).toHaveLength(2); // Both included
    });

    it("should include features without time info when filtering by time", () => {
      const featureWithoutTime: GeoJSONFeature = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0],
        },
        properties: {
          hazardType: "TURBULENCE",
          bulletinId: "TEST001",
          rawText: "Test",
          validityStart: "",
          validityEnd: "",
        },
      };

      const collection: GeoJSONFeatureCollection = {
        type: "FeatureCollection",
        features: [
          createFeature(
            undefined,
            undefined,
            "2024-01-01T00:00:00Z",
            "2024-01-01T06:00:00Z"
          ),
          featureWithoutTime,
        ],
      };

      const result = service.applyFilters(collection, {
        fromTs: Math.floor(new Date("2024-01-01T02:00:00Z").getTime() / 1000),
        toTs: Math.floor(new Date("2024-01-01T04:00:00Z").getTime() / 1000),
      });

      expect(result.features).toHaveLength(2); // Both included
    });
  });
});
