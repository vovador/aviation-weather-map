import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
  setMinAltitude,
  setMaxAltitude,
  setTimeOffsetHours,
  setShowSigmet,
  setShowAirsigmet,
} from "@/redux/slices/filtersSlice";
import type { AppDispatch } from "@/redux/store";

interface UseApplyFiltersProps {
  localMinAltitude: number;
  localMaxAltitude: number;
  localTimeOffsetHours: number;
  localShowSigmet: boolean;
  localShowAirsigmet: boolean;
  reduxMinAltitude: number;
  reduxMaxAltitude: number;
  reduxTimeOffsetHours: number;
  reduxShowSigmet: boolean;
  reduxShowAirsigmet: boolean;
  onRefetch: () => Promise<void>;
}

export const useApplyFilters = ({
  localMinAltitude,
  localMaxAltitude,
  localTimeOffsetHours,
  localShowSigmet,
  localShowAirsigmet,
  reduxMinAltitude,
  reduxMaxAltitude,
  reduxTimeOffsetHours,
  reduxShowSigmet,
  reduxShowAirsigmet,
  onRefetch,
}: UseApplyFiltersProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isApplying, setIsApplying] = useState(false);

  const hasUnsavedChanges = useMemo(() => {
    return (
      localMinAltitude !== reduxMinAltitude ||
      localMaxAltitude !== reduxMaxAltitude ||
      localTimeOffsetHours !== reduxTimeOffsetHours ||
      localShowSigmet !== reduxShowSigmet ||
      localShowAirsigmet !== reduxShowAirsigmet
    );
  }, [
    localMinAltitude,
    localMaxAltitude,
    localTimeOffsetHours,
    localShowSigmet,
    localShowAirsigmet,
    reduxMinAltitude,
    reduxMaxAltitude,
    reduxTimeOffsetHours,
    reduxShowSigmet,
    reduxShowAirsigmet,
  ]);

  const handleApplyFilters = async () => {
    setIsApplying(true);
    try {
      // Dispatch local values to Redux
      dispatch(setMinAltitude(localMinAltitude));
      dispatch(setMaxAltitude(localMaxAltitude));
      dispatch(setTimeOffsetHours(localTimeOffsetHours));
      dispatch(setShowSigmet(localShowSigmet));
      dispatch(setShowAirsigmet(localShowAirsigmet));

      // Trigger refetch of queries
      await onRefetch();
    } finally {
      setIsApplying(false);
    }
  };

  return {
    hasUnsavedChanges,
    isApplying,
    handleApplyFilters,
  };
};
