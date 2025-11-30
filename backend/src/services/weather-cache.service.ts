import { GeoJSONFeatureCollection } from "../types/geojson";
import { AWCService } from "./awc.service";
import { NormalizationService } from "./normalization.service";
import { logger } from "../utils/logger";

/**
 * WeatherCacheService handles in-memory caching with TTL expiration.
 *
 * It keeps SIGMET and AIRSIGMET cache entries independent but uses a
 * shared mechanism for deciding when data must be refreshed.
 */
export class WeatherCacheService {
  private sigmetCache: GeoJSONFeatureCollection | null = null;
  private airsigmetCache: GeoJSONFeatureCollection | null = null;

  private lastSigmetFetch = 0;
  private lastAirsigmetFetch = 0;

  private readonly ttlMs = 3600_000; // 1 hour

  constructor(
    private readonly awcService: AWCService,
    private readonly normalizationService: NormalizationService
  ) {}

  // ────────────────────────────────────────────────────────────────────────────
  // Public API
  // ────────────────────────────────────────────────────────────────────────────

  getSigmet(): Promise<GeoJSONFeatureCollection> {
    return this.getOrRefresh({
      cache: () => this.sigmetCache,
      setCache: (c) => (this.sigmetCache = c),
      lastFetch: () => this.lastSigmetFetch,
      setLastFetch: (t) => (this.lastSigmetFetch = t),
      label: "SIGMET",
      fetchUpstream: async () =>
        this.normalizationService.normalizeSigmet(
          await this.awcService.fetchSigmet({})
        ),
    });
  }

  getAirsigmet(): Promise<GeoJSONFeatureCollection> {
    return this.getOrRefresh({
      cache: () => this.airsigmetCache,
      setCache: (c) => (this.airsigmetCache = c),
      lastFetch: () => this.lastAirsigmetFetch,
      setLastFetch: (t) => (this.lastAirsigmetFetch = t),
      label: "AIRSIGMET",
      fetchUpstream: async () =>
        this.normalizationService.normalizeAirsigmet(
          await this.awcService.fetchAirsigmet({})
        ),
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Shared cache mechanism
  // ────────────────────────────────────────────────────────────────────────────

  private async getOrRefresh(spec: {
    cache: () => GeoJSONFeatureCollection | null;
    setCache: (c: GeoJSONFeatureCollection) => void;
    lastFetch: () => number;
    setLastFetch: (t: number) => void;
    label: string;
    fetchUpstream: () => Promise<GeoJSONFeatureCollection>;
  }): Promise<GeoJSONFeatureCollection> {
    const now = Date.now();
    const age = now - spec.lastFetch();
    const cached = spec.cache();

    const expired = !cached || age >= this.ttlMs;

    if (expired) {
      logger.info(`${spec.label} cache expired or empty → refreshing`);
      const fresh = await spec.fetchUpstream();
      spec.setCache(fresh);
      spec.setLastFetch(now);
      logger.info(`${spec.label} cache refreshed`, {
        featureCount: fresh.features.length,
      });
      return fresh;
    }

    logger.debug(`${spec.label} cache hit`, {
      ageMs: age,
      featureCount: cached.features.length,
    });

    return cached;
  }
}
