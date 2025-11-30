import { GeoJSONFeatureCollection, GeoJSONFeature } from "../types/geojson";

export interface FilterOptions {
  minAlt?: number;
  maxAlt?: number;
  fromTs?: number;
  toTs?: number;
  geometryType?: string;
}

/**
 * FilterService contains pure filtering logic.
 * Stateless, predictable, and easy to test.
 */
export class FilterService {
  applyFilters(
    collection: GeoJSONFeatureCollection,
    filters: FilterOptions
  ): GeoJSONFeatureCollection {
    if (this.isEmptyFilter(filters)) {
      return collection;
    }

    const features = collection.features.filter((feature) =>
      this.matchesAll(feature, filters)
    );

    return { type: "FeatureCollection", features };
  }

  /**
   * True if there are no filters at all
   */
  private isEmptyFilter(filters: FilterOptions): boolean {
    return Object.values(filters).every((v) => v === undefined);
  }

  /**
   * Check all filters in sequence.
   */
  private matchesAll(feature: GeoJSONFeature, filters: FilterOptions): boolean {
    return (
      this.matchesAltitude(feature, filters) &&
      this.matchesTime(feature, filters) &&
      this.matchesGeometry(feature, filters)
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ALTITUDE FILTER
  // ────────────────────────────────────────────────────────────────────────────

  private matchesAltitude(
    feature: GeoJSONFeature,
    { minAlt, maxAlt }: FilterOptions
  ): boolean {
    if (minAlt === undefined && maxAlt === undefined) return true;

    const range = feature.properties.altitudeRange;
    if (!range) return true; // Or false if your business logic prefers exclusion

    const lowerFt = (range.min ?? 0) * 100;
    const upperFt = (range.max ?? Infinity) * 100;

    if (minAlt !== undefined && upperFt < minAlt) return false;
    if (maxAlt !== undefined && lowerFt > maxAlt) return false;

    return true;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // TIME FILTER
  // ────────────────────────────────────────────────────────────────────────────

  private matchesTime(
    feature: GeoJSONFeature,
    { fromTs, toTs }: FilterOptions
  ): boolean {
    if (fromTs === undefined && toTs === undefined) return true;

    const start = feature.properties.validityStart;
    const end = feature.properties.validityEnd;

    if (!start || !end) return true;

    const validFrom = Math.floor(new Date(start).getTime() / 1000);
    const validTo = Math.floor(new Date(end).getTime() / 1000);

    if (toTs !== undefined && validFrom > toTs) return false;
    if (fromTs !== undefined && validTo < fromTs) return false;

    return true;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // GEOMETRY FILTER
  // ────────────────────────────────────────────────────────────────────────────

  private matchesGeometry(
    feature: GeoJSONFeature,
    { geometryType }: FilterOptions
  ): boolean {
    if (!geometryType) return true;

    const type = feature.geometry?.type;
    if (!type) return false;

    return type.toLowerCase() === geometryType.toLowerCase();
  }
}
