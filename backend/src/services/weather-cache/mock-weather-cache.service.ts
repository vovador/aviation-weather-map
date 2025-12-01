import { GeoJSONFeatureCollection } from "../../types/geojson";
import { IWeatherCacheService } from "./weather-cache.service";

/**
 * MockWeatherCacheService provides hardcoded test data for development and testing.
 * Returns predefined SIGMET and AIRSIGMET data without making API calls.
 */
export class MockWeatherCacheService implements IWeatherCacheService {
  /**
   * Get mock SIGMET data
   * Returns 3 SIGMET features with various altitude ranges
   */
  async getSigmet(): Promise<GeoJSONFeatureCollection> {
    const now = new Date();
    const validFrom = new Date(now.getTime() - 3600000); // 1 hour ago
    const validTo = new Date(now.getTime() + 10800000); // 3 hours from now

    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [-76.0, 39.0],
                [-72.0, 39.0],
                [-72.0, 42.0],
                [-76.0, 42.0],
                [-76.0, 39.0],
              ],
            ],
          },
          properties: {
            hazardType: "TURBULENCE",
            bulletinId: "MOCK-SIGMET-001",
            rawText: "MOCK SIGMET: Moderate turbulence expected",
            validityStart: validFrom.toISOString(),
            validityEnd: validTo.toISOString(),
            altitudeRange: {
              min: 10000,
              max: 25000,
              unit: "FT",
            },
            fir: "KZNY",
          },
        },
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [-125.0, 36.0],
                [-120.0, 36.0],
                [-120.0, 39.0],
                [-125.0, 39.0],
                [-125.0, 36.0],
              ],
            ],
          },
          properties: {
            hazardType: "ICING",
            bulletinId: "MOCK-SIGMET-002",
            rawText: "MOCK SIGMET: Severe icing conditions",
            validityStart: validFrom.toISOString(),
            validityEnd: validTo.toISOString(),
            altitudeRange: {
              min: 5000,
              max: 15000,
              unit: "FT",
            },
            fir: "KZOA",
          },
        },
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [-90.0, 40.0],
                [-85.0, 40.0],
                [-85.0, 43.0],
                [-90.0, 43.0],
                [-90.0, 40.0],
              ],
            ],
          },
          properties: {
            hazardType: "CONVECTIVE",
            bulletinId: "MOCK-SIGMET-003",
            rawText: "MOCK SIGMET: Embedded thunderstorms",
            validityStart: validFrom.toISOString(),
            validityEnd: validTo.toISOString(),
            altitudeRange: {
              min: 20000,
              max: 45000,
              unit: "FT",
            },
            fir: "KZAU",
          },
        },
      ],
    };
  }

  /**
   * Get mock AIRSIGMET data
   * Returns 1 AIRSIGMET feature with altitude range 0-35000 ft
   */
  async getAirsigmet(): Promise<GeoJSONFeatureCollection> {
    const now = new Date();
    const validFrom = new Date(now.getTime() - 3600000); // 1 hour ago
    const validTo = new Date(now.getTime() + 10800000); // 3 hours from now

    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [-105.0, 32.0],
                [-95.0, 32.0],
                [-95.0, 38.0],
                [-105.0, 38.0],
                [-105.0, 32.0],
              ],
            ],
          },
          properties: {
            hazardType: "TURBULENCE",
            bulletinId: "MOCK-AIRSIGMET-001",
            rawText:
              "MOCK AIRSIGMET: Moderate to severe turbulence from surface to FL350",
            validityStart: validFrom.toISOString(),
            validityEnd: validTo.toISOString(),
            altitudeRange: {
              min: 0,
              max: 35000,
              unit: "FT",
            },
            fir: "KZKC",
          },
        },
      ],
    };
  }
}
