import { ApiClient } from "../../core/ApiClient";
import { env } from "../../config/env";
import { AWCService } from "../awc.service";
import { NormalizationService } from "../normalization.service";
import {
  WeatherCacheService,
  IWeatherCacheService,
} from "./weather-cache.service";
import { MockWeatherCacheService } from "./mock-weather-cache.service";

/**
 * Builds the appropriate weather cache service based on environment configuration.
 * Returns a mock service if useMockData is true, otherwise returns a real service
 * with API client, AWC service, and normalization service dependencies.
 */
export function buildWeatherCacheService(): IWeatherCacheService {
  if (env.useMockData) {
    return new MockWeatherCacheService();
  }

  const apiClient = new ApiClient(env.awcBaseUrl, { format: "json" });
  const awcService = new AWCService(apiClient);
  const normalizationService = new NormalizationService();
  return new WeatherCacheService(awcService, normalizationService);
}

// Re-export the interface for use by other modules
export type { IWeatherCacheService } from "./weather-cache.service";
