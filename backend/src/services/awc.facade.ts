import { AWCService } from "./awc.service";
import { NormalizationService } from "./normalization.service";
import { TTLCache } from "../utils/cache";
import { GeoJSONFeatureCollection } from "../types/geojson";
import { logger } from "../utils/logger";

type FacadeHandler = {
  cacheKeyPrefix: string;
  resourceLabel: string;
  fetcher: (params: Record<string, string>) => Promise<unknown>;
  normalizer: (data: unknown) => GeoJSONFeatureCollection;
};

/**
 * The Facade pattern hides all the complex work (caching, API calls, logging,
 * normalization) behind one class, so controllers and routers stay simple.
 *
 * Benefits:
 * - Easy testing: controllers only call one method, so mocks are simple and no
 *   API details leak into HTTP tests.
 * - Easy to extend: if we add new advisory types or change how AWC responses
 *   work, we update only this class — not the router or controller.
 * - Clear separation of concerns: transport logic (routes, controllers) stays
 *   focused on HTTP, while data processing logic stays here.
 * - Better maintainability: cache rules, API behavior, and formatting live in
 *   a single place instead of being duplicated across handlers.
 */

export class AWCFacade {
  constructor(
    private readonly awcService: AWCService,
    private readonly normalizationService: NormalizationService,
    private readonly cache: TTLCache<string, GeoJSONFeatureCollection>
  ) {}

  async getSigmet(
    params: Record<string, string>
  ): Promise<GeoJSONFeatureCollection> {
    return this.handleRequest(
      {
        cacheKeyPrefix: "/isigmet",
        resourceLabel: "SIGMET",
        fetcher: (query) => this.awcService.fetchSigmet(query),
        normalizer: (data) => this.normalizationService.normalizeSigmet(data),
      },
      params
    );
  }

  async getAirsigmet(
    params: Record<string, string>
  ): Promise<GeoJSONFeatureCollection> {
    return this.handleRequest(
      {
        cacheKeyPrefix: "/airsigmet",
        resourceLabel: "AIRSIGMET",
        fetcher: (query) => this.awcService.fetchAirsigmet(query),
        normalizer: (data) =>
          this.normalizationService.normalizeAirsigmet(data),
      },
      params
    );
  }

  private async handleRequest(
    handler: FacadeHandler,
    params: Record<string, string>
  ): Promise<GeoJSONFeatureCollection> {
    const cacheKey = this.buildCacheKey(handler.cacheKeyPrefix, params);
    const bypassCache = params.nocache === "1";

    if (!bypassCache) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        logger.info(`Cache hit for ${handler.resourceLabel}`, { cacheKey });
        return cached;
      }
    }

    logger.info(`Fetching ${handler.resourceLabel} from AWC API`, {
      params,
    });

    const awcData = await handler.fetcher(params);
    const geojson = handler.normalizer(awcData);

    if (!bypassCache) {
      this.cache.set(cacheKey, geojson);
    }

    return geojson;
  }

  private buildCacheKey(
    prefix: string,
    params: Record<string, string>
  ): string {
    const serializedParams = new URLSearchParams(params).toString();
    return `${prefix}?${serializedParams}`;
  }
}
