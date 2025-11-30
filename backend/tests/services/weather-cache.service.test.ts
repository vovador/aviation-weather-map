import { WeatherCacheService } from "../../src/services/weather-cache.service";
import { AWCService } from "../../src/services/awc.service";
import { NormalizationService } from "../../src/services/normalization.service";
import { GeoJSONFeatureCollection } from "../../src/types/geojson";

describe("WeatherCacheService", () => {
  let service: WeatherCacheService;
  let mockAWCService: jest.Mocked<AWCService>;
  let mockNormalizationService: jest.Mocked<NormalizationService>;

  beforeEach(() => {
    mockAWCService = {
      fetchSigmet: jest.fn(),
      fetchAirsigmet: jest.fn(),
    } as any;

    mockNormalizationService = {
      normalizeSigmet: jest.fn(),
      normalizeAirsigmet: jest.fn(),
    } as any;

    service = new WeatherCacheService(mockAWCService, mockNormalizationService);
    jest.clearAllMocks();
  });

  describe("getSigmet", () => {
    it("should fetch and cache SIGMET data on first call", async () => {
      const mockAWCData = { sigmets: [] };
      const mockGeoJSON: GeoJSONFeatureCollection = {
        type: "FeatureCollection",
        features: [],
      };

      mockAWCService.fetchSigmet.mockResolvedValue(mockAWCData as any);
      mockNormalizationService.normalizeSigmet.mockReturnValue(mockGeoJSON);

      const result = await service.getSigmet();

      expect(result).toEqual(mockGeoJSON);
      expect(mockAWCService.fetchSigmet).toHaveBeenCalledTimes(1);
      expect(mockNormalizationService.normalizeSigmet).toHaveBeenCalledWith(
        mockAWCData
      );
    });

    it("should return cached data on subsequent calls within TTL", async () => {
      const mockGeoJSON: GeoJSONFeatureCollection = {
        type: "FeatureCollection",
        features: [],
      };

      mockAWCService.fetchSigmet.mockResolvedValue({ sigmets: [] } as any);
      mockNormalizationService.normalizeSigmet.mockReturnValue(mockGeoJSON);

      // First call
      await service.getSigmet();
      jest.clearAllMocks();

      // Second call - should use cache
      const result = await service.getSigmet();

      expect(result).toEqual(mockGeoJSON);
      expect(mockAWCService.fetchSigmet).not.toHaveBeenCalled();
    });

    it("should refresh cache after TTL expires", async () => {
      const mockGeoJSON: GeoJSONFeatureCollection = {
        type: "FeatureCollection",
        features: [],
      };

      mockAWCService.fetchSigmet.mockResolvedValue({ sigmets: [] } as any);
      mockNormalizationService.normalizeSigmet.mockReturnValue(mockGeoJSON);

      // First call
      await service.getSigmet();
      jest.clearAllMocks();

      // Fast-forward time past TTL (1 hour)
      jest.spyOn(Date, "now").mockReturnValue(Date.now() + 3600_001);

      // Second call - should refresh
      await service.getSigmet();

      expect(mockAWCService.fetchSigmet).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAirsigmet", () => {
    it("should fetch and cache AIRSIGMET data on first call", async () => {
      const mockAWCData = { airsigmets: [] };
      const mockGeoJSON: GeoJSONFeatureCollection = {
        type: "FeatureCollection",
        features: [],
      };

      mockAWCService.fetchAirsigmet.mockResolvedValue(mockAWCData as any);
      mockNormalizationService.normalizeAirsigmet.mockReturnValue(mockGeoJSON);

      const result = await service.getAirsigmet();

      expect(result).toEqual(mockGeoJSON);
      expect(mockAWCService.fetchAirsigmet).toHaveBeenCalledTimes(1);
      expect(mockNormalizationService.normalizeAirsigmet).toHaveBeenCalledWith(
        mockAWCData
      );
    });

    it("should return cached data on subsequent calls within TTL", async () => {
      const mockGeoJSON: GeoJSONFeatureCollection = {
        type: "FeatureCollection",
        features: [],
      };

      mockAWCService.fetchAirsigmet.mockResolvedValue({
        airsigmets: [],
      } as any);
      mockNormalizationService.normalizeAirsigmet.mockReturnValue(mockGeoJSON);

      // First call
      await service.getAirsigmet();
      jest.clearAllMocks();

      // Second call - should use cache
      const result = await service.getAirsigmet();

      expect(result).toEqual(mockGeoJSON);
      expect(mockAWCService.fetchAirsigmet).not.toHaveBeenCalled();
    });
  });
});
