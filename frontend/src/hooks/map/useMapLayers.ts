import { useEffect, useMemo, useState } from "react";
import maplibregl from "maplibre-gl";
import type { GeoJSON } from "geojson";
import type { GeoJSONFeatureCollection } from "@/types";
import { MAP_SOURCES, MAP_LAYERS, GEOJSON_TYPES } from "@/constants";
import { getDateRange } from "@/utils/dateUtils";

interface UseMapLayersProps {
  map: maplibregl.Map | null;
  sigmetData?: GeoJSONFeatureCollection;
  airsigmetData?: GeoJSONFeatureCollection;
  showSigmet: boolean;
  showAirsigmet: boolean;
  minAltitude: number;
  maxAltitude: number;
  timeOffsetHours: number;
}

export const useMapLayers = ({
  map,
  sigmetData,
  airsigmetData,
  showSigmet,
  showAirsigmet,
  minAltitude,
  maxAltitude,
  timeOffsetHours,
}: UseMapLayersProps) => {
  const [mapReady, setMapReady] = useState(false);

  // ---- Derived filter values ----
  const safeMinAlt = minAltitude ?? 0;
  const safeMaxAlt = maxAltitude ?? 60000;

  const { from, to } = useMemo(
    () => getDateRange(timeOffsetHours ?? 0),
    [timeOffsetHours]
  );

  const minTs = Math.floor(new Date(from).getTime() / 1000);
  const maxTs = Math.floor(new Date(to).getTime() / 1000);

  // ---- Preprocessing of data ----
  const preprocess = (
    data?: GeoJSONFeatureCollection
  ): GeoJSONFeatureCollection => ({
    type: GEOJSON_TYPES.FEATURE_COLLECTION,
    features:
      data?.features.map((f) => {
        const alt = f.properties.altitudeRange ?? {};
        return {
          ...f,
          properties: {
            ...f.properties,
            min_alt_ft: alt.min ?? 0,
            max_alt_ft: alt.max ?? 999999,
            valid_from_ts: Math.floor(
              new Date(f.properties.validityStart).getTime() / 1000
            ),
            valid_to_ts: Math.floor(
              new Date(f.properties.validityEnd).getTime() / 1000
            ),
          },
        };
      }) ?? [],
  });

  // ---- Build filter expression ----
  const makeFilter = (
    visible: boolean,
    minA: number,
    maxA: number,
    minTime: number,
    maxTime: number
  ): maplibregl.FilterSpecification => {
    if (!visible) return ["==", ["get", "__never__"], true]; // hide layer

    return [
      "all",
      ["<=", ["get", "min_alt_ft"], maxA],
      [">=", ["get", "max_alt_ft"], minA],
      ["<=", ["get", "valid_from_ts"], maxTime],
      [">=", ["get", "valid_to_ts"], minTime],
    ];
  };

  const sigmetFilter = useMemo(
    () => makeFilter(showSigmet, safeMinAlt, safeMaxAlt, minTs, maxTs),
    [showSigmet, safeMinAlt, safeMaxAlt, minTs, maxTs]
  );

  const airsigmetFilter = useMemo(
    () => makeFilter(showAirsigmet, safeMinAlt, safeMaxAlt, minTs, maxTs),
    [showAirsigmet, safeMinAlt, safeMaxAlt, minTs, maxTs]
  );

  // ---- Generic helpers ----

  const applyData = (sourceId: string, data?: GeoJSONFeatureCollection) => {
    const src = map?.getSource(sourceId) as maplibregl.GeoJSONSource;
    if (src) src.setData(preprocess(data) as GeoJSON);
  };

  const applyFilter = (
    layerId: string,
    filter: maplibregl.FilterSpecification
  ) => {
    if (map?.getLayer(layerId)) {
      map.setFilter(layerId, filter);
    }
  };

  // ---- Setup sources + layers ONCE ----
  useEffect(() => {
    if (!map) return;

    const onLoad = () => {
      if (!map.isStyleLoaded()) return;

      // Ensures a GeoJSON source exists, creating it with empty data if missing
      const ensureSource = (id: string) => {
        if (!map.getSource(id)) {
          map.addSource(id, {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
          });
        }
      };

      // Ensures a map layer exists, creating it with the given config if missing
      const ensureLayer = (
        id: string,
        type: "fill" | "line",
        source: string,
        paint: any
      ) => {
        if (!map.getLayer(id)) {
          const layer: maplibregl.LayerSpecification = {
            id,
            type,
            source,
            paint,
          } as maplibregl.LayerSpecification;
          map.addLayer(layer);
        }
      };

      ensureSource(MAP_SOURCES.SIGMET);
      ensureLayer(MAP_LAYERS.SIGMET_FILL, "fill", MAP_SOURCES.SIGMET, {
        "fill-color": "#e63946",
        "fill-opacity": 0.3,
      });
      ensureLayer(MAP_LAYERS.SIGMET_OUTLINE, "line", MAP_SOURCES.SIGMET, {
        "line-color": "#e63946",
        "line-width": 2,
      });

      ensureSource(MAP_SOURCES.AIRSIGMET);
      ensureLayer(MAP_LAYERS.AIRSIGMET_FILL, "fill", MAP_SOURCES.AIRSIGMET, {
        "fill-color": "#457b9d",
        "fill-opacity": 0.3,
      });
      ensureLayer(MAP_LAYERS.AIRSIGMET_OUTLINE, "line", MAP_SOURCES.AIRSIGMET, {
        "line-color": "#457b9d",
        "line-width": 2,
      });

      setMapReady(true);
    };

    map.on("load", onLoad);
    if (map.isStyleLoaded()) onLoad();

    return () => {
      map.off("load", onLoad);
    };
  }, [map]);

  // ---- Update data when backend returns new data ----
  useEffect(() => {
    if (!mapReady) return;
    applyData(MAP_SOURCES.SIGMET, sigmetData);
  }, [mapReady, sigmetData]);

  useEffect(() => {
    if (!mapReady) return;
    applyData(MAP_SOURCES.AIRSIGMET, airsigmetData);
  }, [mapReady, airsigmetData]);

  // ---- Update filters on parameter change ----
  useEffect(() => {
    if (!mapReady) return;

    applyFilter(MAP_LAYERS.SIGMET_FILL, sigmetFilter);
    applyFilter(MAP_LAYERS.SIGMET_OUTLINE, sigmetFilter);
  }, [mapReady, sigmetFilter]);

  useEffect(() => {
    if (!mapReady) return;

    applyFilter(MAP_LAYERS.AIRSIGMET_FILL, airsigmetFilter);
    applyFilter(MAP_LAYERS.AIRSIGMET_OUTLINE, airsigmetFilter);
  }, [mapReady, airsigmetFilter]);
};
