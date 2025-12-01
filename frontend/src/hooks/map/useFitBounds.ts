import { useEffect } from "react";
import maplibregl from "maplibre-gl";
import type { GeoJSONFeatureCollection } from "@/types";

interface UseFitBoundsProps {
  map: React.RefObject<maplibregl.Map | null>;
  sigmetData: GeoJSONFeatureCollection | undefined;
  airsigmetData: GeoJSONFeatureCollection | undefined;
}

/**
 * Hook to automatically fit the map bounds to all loaded features when data changes.
 * Extracts coordinates from all polygon features and fits the map view to encompass them.
 */
export const useFitBounds = ({
  map,
  sigmetData,
  airsigmetData,
}: UseFitBoundsProps) => {
  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance || (!sigmetData && !airsigmetData)) return;

    const allFeatures = [
      ...(sigmetData?.features || []),
      ...(airsigmetData?.features || []),
    ];

    if (allFeatures.length === 0) return;

    const coordinates: number[][] = [];
    allFeatures.forEach((feature) => {
      if (feature.geometry.type === "Polygon") {
        const coords = feature.geometry.coordinates[0] as number[][];
        coordinates.push(...coords);
      }
    });

    if (coordinates.length === 0) return;

    const bounds = coordinates.reduce((bounds, coord) => {
      return bounds.extend(coord as [number, number]);
    }, new maplibregl.LngLatBounds(coordinates[0] as [number, number], coordinates[0] as [number, number]));

    mapInstance.fitBounds(bounds, {
      padding: 50,
      maxZoom: 10,
    });
  }, [map, sigmetData, airsigmetData]);
};
