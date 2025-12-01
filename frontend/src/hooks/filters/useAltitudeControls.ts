import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { setMinAltitude, setMaxAltitude } from "@/redux/slices/filtersSlice";
import type { AppDispatch } from "@/redux/store";

export const useAltitudeControls = (
  reduxMinAltitude: number,
  reduxMaxAltitude: number,
  dispatch: AppDispatch
) => {
  const [localMinAltitude, setLocalMinAltitude] = useState(reduxMinAltitude);
  const [localMaxAltitude, setLocalMaxAltitude] = useState(reduxMaxAltitude);

  const debouncedMinAltitude = useDebounce(localMinAltitude, 1000);
  const debouncedMaxAltitude = useDebounce(localMaxAltitude, 1000);

  // Sync local state with Redux state when it changes externally
  useEffect(() => {
    setLocalMinAltitude(reduxMinAltitude);
  }, [reduxMinAltitude]);

  useEffect(() => {
    setLocalMaxAltitude(reduxMaxAltitude);
  }, [reduxMaxAltitude]);

  // Dispatch Redux actions when debounced values change
  useEffect(() => {
    if (debouncedMinAltitude !== reduxMinAltitude) {
      dispatch(setMinAltitude(debouncedMinAltitude));
    }
  }, [debouncedMinAltitude, reduxMinAltitude, dispatch]);

  useEffect(() => {
    if (debouncedMaxAltitude !== reduxMaxAltitude) {
      dispatch(setMaxAltitude(debouncedMaxAltitude));
    }
  }, [debouncedMaxAltitude, reduxMaxAltitude, dispatch]);

  return {
    localMinAltitude,
    localMaxAltitude,
    setLocalMinAltitude,
    setLocalMaxAltitude,
  };
};
