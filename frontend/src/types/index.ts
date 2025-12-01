// GeoJSON types matching backend
export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

export interface GeoJSONFeature {
  type: "Feature";
  geometry: GeoJSONGeometry;
  properties: FeatureProperties;
}

export interface GeoJSONGeometry {
  type: string;
  coordinates: number[] | number[][] | number[][][];
}

export type AdvisoryType = "SIGMET" | "AIRSIGMET";

export interface FeatureProperties {
  hazardType: string;
  bulletinId: string;
  rawText: string;
  validityStart: string;
  validityEnd: string;
  altitudeRange?: {
    min?: number;
    max?: number;
    unit?: string;
  };
  fir?: string;
  advisoryType?: AdvisoryType;
  [key: string]: unknown;
}

// API types
export interface AuthResponse {
  token: string;
  expiresIn: number;
}

export interface SigmetQueryParams {
  minAlt?: string;
  maxAlt?: string;
  from?: string; // ISO datetime
  to?: string; // ISO datetime
  geometryType?: string; // Polygon, Point, LineString, etc.
}

export interface AirsigmetQueryParams {
  minAlt?: string;
  maxAlt?: string;
  from?: string; // ISO datetime
  to?: string; // ISO datetime
  geometryType?: string; // Polygon, Point, LineString, etc.
}
