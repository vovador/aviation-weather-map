import { useState, useEffect, useMemo } from "react";
import { getDateRange } from "@/utils/dateUtils";

export const useTimeOffsetControls = (reduxTimeOffsetHours: number) => {
  const [localTimeOffsetHours, setLocalTimeOffsetHours] =
    useState(reduxTimeOffsetHours);

  // Sync local state with Redux state when it changes externally
  useEffect(() => {
    setLocalTimeOffsetHours(reduxTimeOffsetHours);
  }, [reduxTimeOffsetHours]);

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
