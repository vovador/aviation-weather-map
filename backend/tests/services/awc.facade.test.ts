import { AWCFacade } from "../../src/services/awc.facade";
import { WeatherCacheService } from "../../src/services/weather-cache.service";
import {
  FilterService,
  FilterOptions,
} from "../../src/services/filter.service";
import { GeoJSONFeatureCollection } from "../../src/types/geojson";

describe("AWCFacade", () => {
  let facade: AWCFacade;
  let mockWeatherCacheService: jest.Mocked<WeatherCacheService>;
  let mockFilterService: jest.Mocked<FilterService>;

  beforeEach(() => {
    mockWeatherCacheService = {
      getSigmet: jest.fn(),
      getAirsigmet: jest.fn(),
    } as unknown as jest.Mocked<WeatherCacheService>;

    mockFilterService = {
      applyFilters: jest.fn(),
    } as unknown as jest.Mocked<FilterService>;

    facade = new AWCFacade(mockWeatherCacheService, mockFilterService);
    jest.clearAllMocks();
  });

  describe("getFilteredSigmet", () => {
    const mockGeoJSON: GeoJSONFeatureCollection = {
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
          },
        },
      ],
    };

    it("should convert raw query parameters to FilterOptions and pass to filter service", async () => {
      const rawQuery = {
        minAlt: "15000",
        maxAlt: "25000",
        from: "2024-01-01T00:00:00Z",
        to: "2024-01-01T05:00:00Z",
        geometryType: "Polygon",
      };

      const filteredGeoJSON: GeoJSONFeatureCollection = {
        type: "FeatureCollection",
        features: mockGeoJSON.features,
      };

      mockWeatherCacheService.getSigmet.mockResolvedValue(mockGeoJSON);
      mockFilterService.applyFilters.mockReturnValue(filteredGeoJSON);

      const result = await facade.getFilteredSigmet(rawQuery);

      expect(result).toEqual(filteredGeoJSON);
      expect(mockWeatherCacheService.getSigmet).toHaveBeenCalled();
      expect(mockFilterService.applyFilters).toHaveBeenCalledWith(
        mockGeoJSON,
        expect.objectContaining({
          minAlt: 15000,
          maxAlt: 25000,
          fromTs: expect.any(Number),
          toTs: expect.any(Number),
          geometryType: "Polygon",
        })
      );
    });

    it("should handle empty query parameters", async () => {
      const rawQuery = {};

      mockWeatherCacheService.getSigmet.mockResolvedValue(mockGeoJSON);
      mockFilterService.applyFilters.mockReturnValue(mockGeoJSON);

      await facade.getFilteredSigmet(rawQuery);

      expect(mockFilterService.applyFilters).toHaveBeenCalledWith(
        mockGeoJSON,
        {}
      );
    });

    it("should handle invalid numeric query parameters gracefully", async () => {
      const rawQuery = {
        minAlt: "invalid",
        maxAlt: "not-a-number",
      };

      mockWeatherCacheService.getSigmet.mockResolvedValue(mockGeoJSON);
      mockFilterService.applyFilters.mockReturnValue(mockGeoJSON);

      await facade.getFilteredSigmet(rawQuery);

      // Invalid values should be filtered out by FilterMapper
      expect(mockFilterService.applyFilters).toHaveBeenCalledWith(
        mockGeoJSON,
        expect.objectContaining({
          // minAlt and maxAlt should be undefined since they're invalid
        })
      );
      const callArgs = mockFilterService.applyFilters.mock.calls[0];
      const filters = callArgs[1] as FilterOptions;
      expect(filters.minAlt).toBeUndefined();
      expect(filters.maxAlt).toBeUndefined();
    });

    it("should convert ISO datetime strings to unix timestamps", async () => {
      const rawQuery = {
        from: "2024-01-01T00:00:00Z",
        to: "2024-01-01T06:00:00Z",
      };

      mockWeatherCacheService.getSigmet.mockResolvedValue(mockGeoJSON);
      mockFilterService.applyFilters.mockReturnValue(mockGeoJSON);

      await facade.getFilteredSigmet(rawQuery);

      const callArgs = mockFilterService.applyFilters.mock.calls[0];
      const filters = callArgs[1] as FilterOptions;
      expect(filters.fromTs).toBe(1704067200); // 2024-01-01T00:00:00Z in unix seconds
      expect(filters.toTs).toBe(1704088800); // 2024-01-01T06:00:00Z in unix seconds
    });

    it("should handle invalid datetime strings gracefully", async () => {
      const rawQuery = {
        from: "invalid-date",
        to: "not-a-date",
      };

      mockWeatherCacheService.getSigmet.mockResolvedValue(mockGeoJSON);
      mockFilterService.applyFilters.mockReturnValue(mockGeoJSON);

      await facade.getFilteredSigmet(rawQuery);

      const callArgs = mockFilterService.applyFilters.mock.calls[0];
      const filters = callArgs[1] as FilterOptions;
      expect(filters.fromTs).toBeUndefined();
      expect(filters.toTs).toBeUndefined();
    });

    it("should pass through geometryType as string", async () => {
      const rawQuery = {
        geometryType: "Point",
      };

      mockWeatherCacheService.getSigmet.mockResolvedValue(mockGeoJSON);
      mockFilterService.applyFilters.mockReturnValue(mockGeoJSON);

      await facade.getFilteredSigmet(rawQuery);

      const callArgs = mockFilterService.applyFilters.mock.calls[0];
      const filters = callArgs[1] as FilterOptions;
      expect(filters.geometryType).toBe("Point");
    });
  });

  describe("getFilteredAirsigmet", () => {
    const mockGeoJSON: GeoJSONFeatureCollection = {
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

    it("should convert raw query parameters to FilterOptions and pass to filter service", async () => {
      const rawQuery = {
        minAlt: "20000",
        maxAlt: "40000",
        from: "2024-01-01T00:00:00Z",
        to: "2024-01-01T05:00:00Z",
        geometryType: "Polygon",
      };

      const filteredGeoJSON: GeoJSONFeatureCollection = {
        type: "FeatureCollection",
        features: mockGeoJSON.features,
      };

      mockWeatherCacheService.getAirsigmet.mockResolvedValue(mockGeoJSON);
      mockFilterService.applyFilters.mockReturnValue(filteredGeoJSON);

      const result = await facade.getFilteredAirsigmet(rawQuery);

      expect(result).toEqual(filteredGeoJSON);
      expect(mockWeatherCacheService.getAirsigmet).toHaveBeenCalled();
      expect(mockFilterService.applyFilters).toHaveBeenCalledWith(
        mockGeoJSON,
        expect.objectContaining({
          minAlt: 20000,
          maxAlt: 40000,
          fromTs: expect.any(Number),
          toTs: expect.any(Number),
          geometryType: "Polygon",
        })
      );
    });

    it("should handle empty query parameters", async () => {
      const rawQuery = {};

      mockWeatherCacheService.getAirsigmet.mockResolvedValue(mockGeoJSON);
      mockFilterService.applyFilters.mockReturnValue(mockGeoJSON);

      await facade.getFilteredAirsigmet(rawQuery);

      expect(mockFilterService.applyFilters).toHaveBeenCalledWith(
        mockGeoJSON,
        {}
      );
    });

    it("should handle invalid numeric query parameters gracefully", async () => {
      const rawQuery = {
        minAlt: "invalid",
        maxAlt: "not-a-number",
      };

      mockWeatherCacheService.getAirsigmet.mockResolvedValue(mockGeoJSON);
      mockFilterService.applyFilters.mockReturnValue(mockGeoJSON);

      await facade.getFilteredAirsigmet(rawQuery);

      const callArgs = mockFilterService.applyFilters.mock.calls[0];
      const filters = callArgs[1] as FilterOptions;
      expect(filters.minAlt).toBeUndefined();
      expect(filters.maxAlt).toBeUndefined();
    });

    it("should convert altitude strings to numbers", async () => {
      const rawQuery = {
        minAlt: "10000",
        maxAlt: "30000",
      };

      mockWeatherCacheService.getAirsigmet.mockResolvedValue(mockGeoJSON);
      mockFilterService.applyFilters.mockReturnValue(mockGeoJSON);

      await facade.getFilteredAirsigmet(rawQuery);

      const callArgs = mockFilterService.applyFilters.mock.calls[0];
      const filters = callArgs[1] as FilterOptions;
      expect(filters.minAlt).toBe(10000);
      expect(filters.maxAlt).toBe(30000);
    });
  });
});
