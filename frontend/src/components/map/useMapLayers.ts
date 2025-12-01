import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { GeoJSONFeatureCollection } from "@/types";

interface UseMapLayersProps {
  map: maplibregl.Map | null;
  sigmetData: GeoJSONFeatureCollection | undefined;
  airsigmetData: GeoJSONFeatureCollection | undefined;
  showSigmet: boolean;
  showAirsigmet: boolean;
  // minAltitude and maxAltitude are kept for backward compatibility but not used for filtering
  // (filtering is now done in the backend)
  minAltitude: number;
  maxAltitude: number;
}

export const useMapLayers = ({
  map,
  sigmetData,
  airsigmetData,
  showSigmet,
  showAirsigmet,
  minAltitude: _minAltitude, // Unused - filtering is done in backend
  maxAltitude: _maxAltitude, // Unused - filtering is done in backend
}: UseMapLayersProps) => {
  const sigmetSourceRef = useRef<maplibregl.GeoJSONSource | null>(null);
  const airsigmetSourceRef = useRef<maplibregl.GeoJSONSource | null>(null);
  const isInitializedRef = useRef(false);
  const sigmetDataRef = useRef(sigmetData);
  const airsigmetDataRef = useRef(airsigmetData);
  const showSigmetRef = useRef(showSigmet);
  const showAirsigmetRef = useRef(showAirsigmet);

  // Keep refs in sync with props
  useEffect(() => {
    sigmetDataRef.current = sigmetData;
    airsigmetDataRef.current = airsigmetData;
    showSigmetRef.current = showSigmet;
    showAirsigmetRef.current = showAirsigmet;
  }, [sigmetData, airsigmetData, showSigmet, showAirsigmet]);

  useEffect(() => {
    if (!map) return;

    // Wait for map to load before adding sources and layers
    const initializeLayers = () => {
      if (isInitializedRef.current) return;

      // Check if map style is loaded
      if (!map.isStyleLoaded()) {
        return;
      }

      // Add SIGMET source and layer
      if (!map.getSource("sigmet")) {
        try {
          map.addSource("sigmet", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
          });

          map.addLayer({
            id: "sigmet-fill",
            type: "fill",
            source: "sigmet",
            paint: {
              "fill-color": "#e63946",
              "fill-opacity": 0.3,
            },
          });

          map.addLayer({
            id: "sigmet-outline",
            type: "line",
            source: "sigmet",
            paint: {
              "line-color": "#e63946",
              "line-width": 2,
            },
          });
        } catch (error) {
          console.error("Error adding SIGMET layers:", error);
          return;
        }
      }

      // Add AIRSIGMET source and layer
      if (!map.getSource("airsigmet")) {
        try {
          map.addSource("airsigmet", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
          });

          map.addLayer({
            id: "airsigmet-fill",
            type: "fill",
            source: "airsigmet",
            paint: {
              "fill-color": "#457b9d",
              "fill-opacity": 0.3,
            },
          });

          map.addLayer({
            id: "airsigmet-outline",
            type: "line",
            source: "airsigmet",
            paint: {
              "line-color": "#457b9d",
              "line-width": 2,
            },
          });
        } catch (error) {
          console.error("Error adding AIRSIGMET layers:", error);
          return;
        }
      }

      // Get source references
      const sigmetSource = map.getSource("sigmet") as maplibregl.GeoJSONSource;
      const airsigmetSource = map.getSource(
        "airsigmet"
      ) as maplibregl.GeoJSONSource;

      sigmetSourceRef.current = sigmetSource;
      airsigmetSourceRef.current = airsigmetSource;
      isInitializedRef.current = true;

      // If data is already available, set it immediately
      if (sigmetDataRef.current) {
        sigmetSource.setData(
          showSigmetRef.current
            ? (sigmetDataRef.current as any)
            : { type: "FeatureCollection", features: [] }
        );
      }
      if (airsigmetDataRef.current) {
        airsigmetSource.setData(
          showAirsigmetRef.current
            ? (airsigmetDataRef.current as any)
            : { type: "FeatureCollection", features: [] }
        );
      }

      // Set initial layer visibility
      if (map.getLayer("sigmet-fill")) {
        map.setLayoutProperty(
          "sigmet-fill",
          "visibility",
          showSigmetRef.current ? "visible" : "none"
        );
        map.setLayoutProperty(
          "sigmet-outline",
          "visibility",
          showSigmetRef.current ? "visible" : "none"
        );
      }
      if (map.getLayer("airsigmet-fill")) {
        map.setLayoutProperty(
          "airsigmet-fill",
          "visibility",
          showAirsigmetRef.current ? "visible" : "none"
        );
        map.setLayoutProperty(
          "airsigmet-outline",
          "visibility",
          showAirsigmetRef.current ? "visible" : "none"
        );
      }
    };

    // If map is already loaded, initialize immediately
    if (map.loaded()) {
      initializeLayers();
    } else {
      // Otherwise wait for the load event
      map.once("load", initializeLayers);
    }

    return () => {
      // Cleanup is handled by map unmount
      isInitializedRef.current = false;
    };
  }, [map]);

  // Update SIGMET data
  // Note: Filtering is now done in the backend, so we just use the data as-is
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;

    // Get source directly from map if ref is not set yet
    const sigmetSource =
      sigmetSourceRef.current ||
      (map.getSource("sigmet") as maplibregl.GeoJSONSource | null);
    if (!sigmetSource) return;

    // Update ref if it wasn't set
    if (!sigmetSourceRef.current) {
      sigmetSourceRef.current = sigmetSource;
    }

    sigmetSource.setData(
      showSigmet && sigmetData
        ? (sigmetData as any)
        : { type: "FeatureCollection", features: [] }
    );

    // Toggle layer visibility
    if (map.getLayer("sigmet-fill")) {
      map.setLayoutProperty(
        "sigmet-fill",
        "visibility",
        showSigmet ? "visible" : "none"
      );
    }
    if (map.getLayer("sigmet-outline")) {
      map.setLayoutProperty(
        "sigmet-outline",
        "visibility",
        showSigmet ? "visible" : "none"
      );
    }
  }, [map, sigmetData, showSigmet]);

  // Update AIRSIGMET data
  // Note: Filtering is now done in the backend, so we just use the data as-is
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;

    // Get source directly from map if ref is not set yet
    const airsigmetSource =
      airsigmetSourceRef.current ||
      (map.getSource("airsigmet") as maplibregl.GeoJSONSource | null);
    if (!airsigmetSource) return;

    // Update ref if it wasn't set
    if (!airsigmetSourceRef.current) {
      airsigmetSourceRef.current = airsigmetSource;
    }

    airsigmetSource.setData(
      showAirsigmet && airsigmetData
        ? (airsigmetData as any)
        : { type: "FeatureCollection", features: [] }
    );

    // Toggle layer visibility
    if (map.getLayer("airsigmet-fill")) {
      map.setLayoutProperty(
        "airsigmet-fill",
        "visibility",
        showAirsigmet ? "visible" : "none"
      );
    }
    if (map.getLayer("airsigmet-outline")) {
      map.setLayoutProperty(
        "airsigmet-outline",
        "visibility",
        showAirsigmet ? "visible" : "none"
      );
    }
  }, [map, airsigmetData, showAirsigmet]);
};
