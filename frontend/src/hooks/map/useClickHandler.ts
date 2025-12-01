import { useEffect } from "react";
import maplibregl from "maplibre-gl";
import type { GeoJSONFeature, GeoJSONFeatureCollection } from "@/types";
import { MAP_SOURCES, MAP_LAYERS, ADVISORY_TYPE } from "@/constants";

interface UseClickHandlerProps {
  map: React.RefObject<maplibregl.Map | null>;
  sigmetDataRef: React.RefObject<GeoJSONFeatureCollection | undefined>;
  airsigmetDataRef: React.RefObject<GeoJSONFeatureCollection | undefined>;
  onFeatureSelect: (feature: GeoJSONFeature | null) => void;
}

/**
 * Hook to handle polygon clicks on the map and select features.
 * Queries rendered features at the click point and finds the matching
 * feature from the data sources to pass to the selection handler.
 */
export const useClickHandler = ({
  map,
  sigmetDataRef,
  airsigmetDataRef,
  onFeatureSelect,
}: UseClickHandlerProps) => {
  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance) return;

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      if (!map.current) return;

      const features = map.current.queryRenderedFeatures(e.point, {
        layers: [MAP_LAYERS.SIGMET_FILL, MAP_LAYERS.AIRSIGMET_FILL],
      });

      if (features.length > 0) {
        // Find the full feature from our data sources
        const clickedFeature = features[0];
        const sourceId = clickedFeature.source;

        // Try to get the feature from sigmet or airsigmet data
        let fullFeature: GeoJSONFeature | undefined;

        if (sourceId === MAP_SOURCES.SIGMET && sigmetDataRef.current) {
          fullFeature = sigmetDataRef.current.features.find(
            (f) =>
              f.properties.bulletinId === clickedFeature.properties?.bulletinId
          );
        } else if (
          sourceId === MAP_SOURCES.AIRSIGMET &&
          airsigmetDataRef.current
        ) {
          fullFeature = airsigmetDataRef.current.features.find(
            (f) =>
              f.properties.bulletinId === clickedFeature.properties?.bulletinId
          );
        }

        if (fullFeature) {
          // Add advisory type to the feature properties
          const featureWithType: GeoJSONFeature = {
            ...fullFeature,
            properties: {
              ...fullFeature.properties,
              advisoryType:
                sourceId === MAP_SOURCES.SIGMET
                  ? ADVISORY_TYPE.SIGMET
                  : ADVISORY_TYPE.AIRSIGMET,
            },
          };
          onFeatureSelect(featureWithType);
        }
      } else {
        onFeatureSelect(null);
      }
    };

    mapInstance.on("click", handleClick);

    return () => {
      if (mapInstance) {
        mapInstance.off("click", handleClick);
      }
    };
  }, [map, sigmetDataRef, airsigmetDataRef, onFeatureSelect]);
};
