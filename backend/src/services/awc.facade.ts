import { IWeatherCacheService } from "./weather-cache";
import { FilterService, FilterOptions } from "./filter.service";
import { GeoJSONFeatureCollection } from "../types/geojson";
import { FilterMapper } from "../mappers/filter.mapper";
import { logger } from "../utils/logger";

/**
 * AWCFacade is a stateless orchestrator that coordinates between
 * WeatherCacheService (data fetching/caching) and FilterService (filtering).
 *
 * It provides a clean interface for controllers to get filtered weather data.
 * The facade handles all mapping and normalization of HTTP query parameters
 * into domain-ready FilterOptions.
 */
export class AWCFacade {
  constructor(
    private readonly weatherCacheService: IWeatherCacheService,
    private readonly filterService: FilterService
  ) {}

  /**
   * Get filtered SIGMET data
   * @param rawQuery - Raw HTTP query parameters from Express req.query
   */
  async getFilteredSigmet(
    rawQuery: Record<string, unknown>
  ): Promise<GeoJSONFeatureCollection> {
    const filters = FilterMapper.fromQuery(rawQuery) as FilterOptions;
    const allSigmet = await this.weatherCacheService.getSigmet();
    const filteredSigmet = this.filterService.applyFilters(allSigmet, filters);
    return filteredSigmet;
  }

  /**
   * Get filtered AIRSIGMET data
   * @param rawQuery - Raw HTTP query parameters from Express req.query
   */
  async getFilteredAirsigmet(
    rawQuery: Record<string, unknown>
  ): Promise<GeoJSONFeatureCollection> {
    const filters = FilterMapper.fromQuery(rawQuery) as FilterOptions;
    logger.debug("Filters", { filters });
    const allAirsigmet = await this.weatherCacheService.getAirsigmet();
    return this.filterService.applyFilters(allAirsigmet, filters);
  }
}
