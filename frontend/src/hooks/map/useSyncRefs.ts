import { useEffect, useRef } from "react";
import type { GeoJSONFeatureCollection } from "@/types";

/**
 * Hook to keep refs in sync with props for sigmet and airsigmet data.
 * This allows accessing the latest data values in event handlers without
 * recreating the handlers on every data change.
 */
export const useSyncRefs = (
  sigmetData: GeoJSONFeatureCollection | undefined,
  airsigmetData: GeoJSONFeatureCollection | undefined
) => {
  const sigmetDataRef = useRef(sigmetData);
  const airsigmetDataRef = useRef(airsigmetData);

  useEffect(() => {
    sigmetDataRef.current = sigmetData;
    airsigmetDataRef.current = airsigmetData;
  }, [sigmetData, airsigmetData]);

  return { sigmetDataRef, airsigmetDataRef };
};
