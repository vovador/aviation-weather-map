/**
 * FiltersContext
 * 
 * Provides RTK Query refetch functions (refetchSigmet, refetchAirsigmet, refetchAll)
 * to FiltersPanel without prop drilling. Uses Context instead of Redux because we're
 * passing function callbacks (not state) with localized scope to MapPage's children.
 */
import React, { createContext, useContext, useCallback } from "react";

interface FiltersContextValue {
  refetchSigmet: () => Promise<void>;
  refetchAirsigmet: () => Promise<void>;
  refetchAll: () => Promise<void>;
}

const FiltersContext = createContext<FiltersContextValue | undefined>(undefined);

export const useFiltersContext = () => {
  const context = useContext(FiltersContext);
  if (!context) {
    throw new Error("useFiltersContext must be used within FiltersContextProvider");
  }
  return context;
};

interface FiltersContextProviderProps {
  children: React.ReactNode;
  refetchSigmet: () => any;
  refetchAirsigmet: () => any;
}

export const FiltersContextProvider: React.FC<FiltersContextProviderProps> = ({
  children,
  refetchSigmet,
  refetchAirsigmet,
}) => {
  const wrappedRefetchSigmet = useCallback(async () => {
    await refetchSigmet();
  }, [refetchSigmet]);

  const wrappedRefetchAirsigmet = useCallback(async () => {
    await refetchAirsigmet();
  }, [refetchAirsigmet]);

  const refetchAll = useCallback(async () => {
    await Promise.all([wrappedRefetchSigmet(), wrappedRefetchAirsigmet()]);
  }, [wrappedRefetchSigmet, wrappedRefetchAirsigmet]);

  const value: FiltersContextValue = {
    refetchSigmet: wrappedRefetchSigmet,
    refetchAirsigmet: wrappedRefetchAirsigmet,
    refetchAll,
  };

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
};

