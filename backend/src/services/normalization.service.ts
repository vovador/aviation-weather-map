import {
  GeoJSONFeatureCollection,
  GeoJSONFeature,
  GeoJSONGeometry,
  FeatureProperties,
} from "../types/geojson";
import { SigmetData, AirsigmetData } from "../types/awc";

type Coord = { lon: number; lat: number };

export class NormalizationService {
  /**
   * Public API – normalize different advisory types
   */

  normalizeSigmet(data: unknown): GeoJSONFeatureCollection {
    return this.normalize<SigmetData>(data, "sigmets", (item) =>
      this.sigmetToFeature(item)
    );
  }

  normalizeAirsigmet(data: unknown): GeoJSONFeatureCollection {
    return this.normalize<AirsigmetData>(data, "airsigmets", (item) =>
      this.airsigmetToFeature(item)
    );
  }

  /**
   * Generic normalization pipeline:
   *  1) Extract an array of "items" from whatever shape AWC returns.
   *  2) Map each item to a GeoJSON Feature (if possible).
   *  3) Wrap in a FeatureCollection.
   */
  private normalize<T>(
    raw: unknown,
    collectionKey: string,
    toFeature: (item: T) => GeoJSONFeature | null
  ): GeoJSONFeatureCollection {
    const items = this.extractItems(raw, collectionKey);
    const features: GeoJSONFeature[] = [];

    for (const item of items) {
      const feature = toFeature(item as T);
      if (feature) {
        features.push(feature);
      }
    }

    return { type: "FeatureCollection", features };
  }

  /**
   * Extracts an array of items from different possible API shapes:
   *  - [item, item, ...]
   *  - { [collectionKey]: [item, item, ...] }
   *  - { ...singleItemFields }
   */
  private extractItems(raw: unknown, collectionKey: string): unknown[] {
    if (!raw || typeof raw !== "object") {
      return [];
    }

    if (Array.isArray(raw)) {
      return raw;
    }

    const obj = raw as Record<string, unknown>;
    const maybeArray = obj[collectionKey];

    if (Array.isArray(maybeArray)) {
      return maybeArray;
    }

    // Fallback: treat the object itself as a single advisory
    return [obj];
  }

  /**
   * SIGMET → GeoJSON Feature
   */
  private sigmetToFeature(data: unknown): GeoJSONFeature | null {
    if (!data || typeof data !== "object") {
      return null;
    }

    const sigmet = data as SigmetData;
    const properties = this.mapSigmetProperties(sigmet);
    const geometry = this.geometryFromCoords(sigmet.coords, sigmet.geom);

    return {
      type: "Feature",
      geometry,
      properties,
    };
  }

  /**
   * AIRSIGMET → GeoJSON Feature
   */
  private airsigmetToFeature(data: unknown): GeoJSONFeature | null {
    if (!data || typeof data !== "object") {
      return null;
    }

    const airsigmet = data as AirsigmetData;
    const properties = this.mapAirsigmetProperties(airsigmet);
    // AIRSIGMET has no "geom" field – infer from coords only.
    const geometry = this.geometryFromCoords(airsigmet.coords, undefined);

    return {
      type: "Feature",
      geometry,
      properties,
    };
  }

  /**
   * Property mappers – keep all domain-specific mapping in one place
   */

  private mapSigmetProperties(sigmet: SigmetData): FeatureProperties {
    const properties: FeatureProperties = {
      hazardType: sigmet.hazard || "UNKNOWN",
      bulletinId: sigmet.seriesId || "",
      rawText: sigmet.rawSigmet || "",
      validityStart: this.unixTimestampToISO(sigmet.validTimeFrom),
      validityEnd: this.unixTimestampToISO(sigmet.validTimeTo),
    };

    // Altitude: AWC API returns values in feet (e.g., 24000 = 24,000 ft, not FL240)
    // base and top are already in feet, not flight levels
    if (sigmet.base !== undefined || sigmet.top !== undefined) {
      properties.altitudeRange = {
        min: sigmet.base ?? undefined,
        max: sigmet.top,
        unit: "FT",
      };
    }

    // FIR information: prefer firId, then firName
    if (sigmet.firId) {
      properties.fir = sigmet.firId;
    } else if (sigmet.firName) {
      properties.fir = sigmet.firName;
    }

    // Copy remaining metadata, excluding fields we already mapped
    for (const [key, value] of Object.entries(sigmet)) {
      if (
        ![
          "hazard",
          "seriesId",
          "rawSigmet",
          "validTimeFrom",
          "validTimeTo",
          "base",
          "top",
          "firId",
          "firName",
          "geom",
          "coords",
        ].includes(key)
      ) {
        properties[key] = value;
      }
    }

    return properties;
  }

  private mapAirsigmetProperties(airsigmet: AirsigmetData): FeatureProperties {
    const properties: FeatureProperties = {
      hazardType: airsigmet.hazard || "UNKNOWN",
      bulletinId: airsigmet.seriesId || "",
      rawText: airsigmet.rawAirSigmet || "",
      validityStart: this.unixTimestampToISO(airsigmet.validTimeFrom),
      validityEnd: this.unixTimestampToISO(airsigmet.validTimeTo),
    };

    // Altitude: AWC API returns values in feet (e.g., 24000 = 24,000 ft, not FL240)
    // altitudeLow1/Low2 and altitudeHi1/Hi2 are already in feet, not flight levels
    const minAltitude = airsigmet.altitudeLow1 ?? airsigmet.altitudeLow2;
    const maxAltitude = airsigmet.altitudeHi1 ?? airsigmet.altitudeHi2;
    if (minAltitude !== undefined || maxAltitude !== undefined) {
      properties.altitudeRange = {
        min: minAltitude ?? undefined,
        max: maxAltitude,
        unit: "FT",
      };
    }

    // Copy remaining metadata, excluding fields we already mapped
    for (const [key, value] of Object.entries(airsigmet)) {
      if (
        ![
          "hazard",
          "seriesId",
          "rawAirSigmet",
          "validTimeFrom",
          "validTimeTo",
          "altitudeLow1",
          "altitudeLow2",
          "altitudeHi1",
          "altitudeHi2",
          "coords",
        ].includes(key)
      ) {
        properties[key] = value;
      }
    }

    return properties;
  }

  /**
   * Geometry helpers – one clear entrypoint:
   *   coords + optional geom hint → GeoJSONGeometry
   */

  private geometryFromCoords(
    coords: Coord[] | undefined,
    geomHint: string | undefined
  ): GeoJSONGeometry {
    const geometryType = this.mapGeomToGeoJSONType(geomHint, coords);
    const coordinates = this.convertCoordsToGeoJSONByType(coords, geometryType);

    return {
      type: geometryType,
      coordinates,
    };
  }

  /**
   * Converts coords into the correct GeoJSON "coordinates" shape
   * based on an already-decided geometry type.
   *
   *  - Polygon    → number[][][]
   *  - LineString → number[][]
   *  - Point      → number[]
   */
  private convertCoordsToGeoJSONByType(
    coords: Coord[] | undefined,
    geometryType: string
  ): number[] | number[][] | number[][][] {
    if (!coords || coords.length === 0) {
      // Preserve original behavior: default to a dummy point.
      return [0, 0];
    }

    const coordinatePairs = coords.map<[number, number]>((coord) => [
      coord.lon,
      coord.lat,
    ]);

    if (geometryType === "Polygon") {
      // Ensure polygon ring is closed (first == last)
      const first = coordinatePairs[0];
      const last = coordinatePairs[coordinatePairs.length - 1];

      const isClosed =
        first[0] === last[0] &&
        first[1] === last[1] &&
        coordinatePairs.length > 0;

      const closedRing = isClosed
        ? coordinatePairs
        : [...coordinatePairs, first];

      return [closedRing];
    }

    if (geometryType === "LineString") {
      return coordinatePairs;
    }

    // Default: Point – use the first coordinate
    return coordinatePairs[0] ?? [0, 0];
  }

  /**
   * Maps "geom" string + optional coords to a GeoJSON geometry type.
   * Falls back to heuristics based on coordinates when needed.
   */
  private mapGeomToGeoJSONType(
    geom: string | undefined,
    coords?: Coord[]
  ): string {
    if (geom) {
      const upper = geom.toUpperCase();

      if (upper === "AREA") {
        return "Polygon";
      }

      if (upper === "LINE" || upper === "LINESTRING") {
        return "LineString";
      }

      if (upper === "POINT") {
        return "Point";
      }

      // Unknown geom value – infer from coordinates
      return this.inferGeometryTypeFromCoords(coords);
    }

    // No geom hint – infer from coordinates
    return this.inferGeometryTypeFromCoords(coords);
  }

  /**
   * Fallback geometry inference based solely on coordinate array.
   * Same logic as in your original version, just pulled into its own helper.
   */
  private inferGeometryTypeFromCoords(coords?: Coord[]): string {
    if (!coords || coords.length === 0) {
      return "Point";
    }

    const first = coords[0];
    const last = coords[coords.length - 1];

    const isClosed =
      first.lon === last.lon && first.lat === last.lat && coords.length >= 3;

    if (isClosed) {
      return "Polygon";
    }

    if (coords.length === 2) {
      return "LineString";
    }

    if (coords.length === 1) {
      return "Point";
    }

    // 3+ coordinates that are not closed – default to Polygon
    return "Polygon";
  }

  /**
   * Time helper – preserve original behavior ("" for missing timestamps).
   */
  private unixTimestampToISO(timestamp: number | undefined): string {
    if (timestamp === undefined) {
      return "";
    }
    return new Date(timestamp * 1000).toISOString();
  }
}
