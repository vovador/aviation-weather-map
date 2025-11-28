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
  [key: string]: unknown;
}
