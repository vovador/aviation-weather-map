import { useState, useEffect, useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { setTimeOffsetHours } from "@/redux/slices/filtersSlice";
import { getDateRange } from "@/utils/dateUtils";
import type { AppDispatch } from "@/redux/store";

export const useTimeOffsetControls = (
  reduxTimeOffsetHours: number,
  dispatch: AppDispatch
) => {
  const [localTimeOffsetHours, setLocalTimeOffsetHours] =
    useState(reduxTimeOffsetHours);

  const debouncedTimeOffsetHours = useDebounce(localTimeOffsetHours, 1000);

  // Sync local state with Redux state when it changes externally
  useEffect(() => {
    setLocalTimeOffsetHours(reduxTimeOffsetHours);
  }, [reduxTimeOffsetHours]);

  // Dispatch Redux actions when debounced values change
  useEffect(() => {
    if (debouncedTimeOffsetHours !== reduxTimeOffsetHours) {
      dispatch(setTimeOffsetHours(debouncedTimeOffsetHours));
    }
  }, [debouncedTimeOffsetHours, reduxTimeOffsetHours, dispatch]);

  // Calculate time range for display
  const timeRange = useMemo(() => {
    return getDateRange(localTimeOffsetHours);
  }, [localTimeOffsetHours]);

  return {
    localTimeOffsetHours,
    setLocalTimeOffsetHours,
    timeRange,
  };
};
