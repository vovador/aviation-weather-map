import { FilterDTO } from "../dto/filter.dto";

/**
 * FilterMapper converts raw HTTP query parameters into a clean domain-friendly DTO.
 * All parsing logic is centralized here for testability and maintainability.
 */
export class FilterMapper {
  /**
   * Convert raw Express query parameters to FilterDTO.
   * Handles conversion of altitude strings to numbers and ISO timestamps to unix seconds.
   * Returns undefined values when conversion fails (never throws).
   *
   * @param params - Raw Express req.query object (any type for flexibility)
   * @returns FilterDTO with parsed and converted values
   */
  static fromQuery(params: any): FilterDTO {
    const filters: FilterDTO = {};

    // Altitude: convert string to number (assume input is already in feet)
    if (params.minAlt !== undefined && params.minAlt !== null) {
      const minAlt = this.parseAltitude(params.minAlt);
      if (minAlt !== undefined) {
        filters.minAlt = minAlt;
      }
    }

    if (params.maxAlt !== undefined && params.maxAlt !== null) {
      const maxAlt = this.parseAltitude(params.maxAlt);
      if (maxAlt !== undefined) {
        filters.maxAlt = maxAlt;
      }
    }

    // Time: convert ISO datetime to unix seconds
    if (params.from !== undefined && params.from !== null) {
      const fromTs = this.toUnix(params.from);
      if (fromTs !== undefined) {
        filters.fromTs = fromTs;
      }
    }

    if (params.to !== undefined && params.to !== null) {
      const toTs = this.toUnix(params.to);
      if (toTs !== undefined) {
        filters.toTs = toTs;
      }
    }

    // Geometry type: pass through as string
    if (params.geometryType !== undefined && params.geometryType !== null) {
      filters.geometryType = String(params.geometryType);
    }

    return filters;
  }

  /**
   * Convert ISO datetime string to unix timestamp (seconds).
   * Returns undefined if conversion fails (never throws).
   *
   * @param iso - ISO datetime string
   * @returns Unix timestamp in seconds, or undefined if invalid
   */
  static toUnix(iso: string): number | undefined {
    try {
      const date = new Date(iso);
      if (isNaN(date.getTime())) {
        return undefined;
      }
      return Math.floor(date.getTime() / 1000);
    } catch {
      return undefined;
    }
  }

  /**
   * Parse altitude string to number.
   * Returns undefined if conversion fails (never throws).
   *
   * @param alt - Altitude value (string or number)
   * @returns Parsed number, or undefined if invalid
   */
  private static parseAltitude(alt: string | number): number | undefined {
    if (typeof alt === "number") {
      return isNaN(alt) ? undefined : alt;
    }
    const parsed = parseFloat(String(alt));
    return isNaN(parsed) ? undefined : parsed;
  }
}
