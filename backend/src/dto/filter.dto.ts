/**
 * FilterDTO represents the clean domain-friendly filter data structure.
 * This DTO is used to transfer filter data from the HTTP layer to the application layer.
 */
export interface FilterDTO {
  minAlt?: number; // in feet
  maxAlt?: number; // in feet
  fromTs?: number; // unix timestamp in seconds
  toTs?: number; // unix timestamp in seconds
  geometryType?: string; // Polygon, Point, LineString, etc.
}
