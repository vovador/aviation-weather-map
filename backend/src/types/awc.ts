/**
 * Minimal type placeholder for raw AWC API SIGMET responses.
 * The response structure is considered variable and handled dynamically by NormalizationService,
 * so type safety is enforced at the normalized level (SigmetData) instead.
 */
export interface AWCSigmetResponse {
  [key: string]: unknown;
}

/**
 * Minimal type placeholder for raw AWC API AIRSIGMET responses.
 * The response structure is considered variable and handled dynamically by NormalizationService,
 * so type safety is enforced at the normalized level (AirsigmetData) instead.
 */
export interface AWCAirsigmetResponse {
  [key: string]: unknown;
}

export interface SigmetData {
  icaoId?: string;
  firId?: string;
  firName?: string;
  receiptTime?: string;
  validTimeFrom?: number;
  validTimeTo?: number;
  seriesId?: string;
  hazard?: string;
  qualifier?: string;
  base?: number | null;
  top?: number;
  geom?: string;
  coords?: Array<{ lon: number; lat: number }>;
  dir?: string;
  spd?: string;
  chng?: string;
  rawSigmet?: string;
  [key: string]: unknown;
}

export interface AirsigmetData {
  icaoId?: string;
  alphaChar?: string;
  seriesId?: string;
  receiptTime?: string;
  creationTime?: string;
  validTimeFrom?: number;
  validTimeTo?: number;
  airSigmetType?: string;
  hazard?: string;
  altitudeLow1?: number | null;
  altitudeLow2?: number | null;
  altitudeHi1?: number;
  altitudeHi2?: number;
  movementDir?: number;
  movementSpd?: number;
  rawAirSigmet?: string;
  postProcessFlag?: number;
  severity?: number;
  coords?: Array<{ lon: number; lat: number }>;
  [key: string]: unknown;
}
