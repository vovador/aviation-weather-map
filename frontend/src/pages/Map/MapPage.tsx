import React, { useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { useGetSigmetQuery, useGetAirsigmetQuery } from "@/redux/awc"
import { useAuth } from "@/hooks/useAuth"
import { MapView } from "@/components/map/MapView"
import { FiltersPanel } from "@/components/filters/FiltersPanel"
import { useErrorToast } from "@/hooks/weather/useErrorToast"
import { GEOJSON_TYPES, ADVISORY_TYPE_LABEL } from "@/constants"


export const MapPage: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const filters = useSelector((state: RootState) => state.filters)
  const { showSigmet, showAirsigmet, minAltitude, maxAltitude, timeOffsetHours } = filters

  //
  // Redirect unauthorized users
  //
  useEffect(() => {
    if (!isAuthenticated) navigate("/login")
  }, [isAuthenticated, navigate])

  //
  // Query params - only geometryType sent to backend
  // All filtering (altitude, time) happens client-side via MapLibre filters
  //
  const queryParams = useMemo(
    () => ({
      geometryType: GEOJSON_TYPES.POLYGON,
    }),
    [] // Static - never changes
  )

  //
  // API calls
  //
  const sigmet = useGetSigmetQuery(queryParams, {
    // Skip query execution when user is not authenticated to prevent unnecessary
    // API calls and potential auth errors. Even though we redirect unauthenticated
    // users, the query might execute before the redirect completes.
    skip: !isAuthenticated,
    // Force refetch on mount and when query arguments change, even if cached data
    // exists within the keepUnusedDataFor window (300s). Defaults to false; setting
    // to true ensures we always get fresh data when filters change or component
    // remounts, rather than serving potentially stale cached results.
    refetchOnMountOrArgChange: true,
  })

  const airsigmet = useGetAirsigmetQuery(queryParams, {
    // Skip query execution when user is not authenticated to prevent unnecessary
    // API calls and potential auth errors. Even though we redirect unauthenticated
    // users, the query might execute before the redirect completes.
    skip: !isAuthenticated,
    // Force refetch on mount and when query arguments change, even if cached data
    // exists within the keepUnusedDataFor window (300s). Defaults to false; setting
    // to true ensures we always get fresh data when filters change or component
    // remounts, rather than serving potentially stale cached results.
    refetchOnMountOrArgChange: true,
  })



  //
  // Show error toasts
  //
  useErrorToast(sigmet.error, ADVISORY_TYPE_LABEL.SIGMET)
  useErrorToast(airsigmet.error, ADVISORY_TYPE_LABEL.AIRSIGMET)

  //
  // Unified loading state
  //
  const isLoading =
    (sigmet.isLoading || airsigmet.isLoading) &&
    !sigmet.isError &&
    !airsigmet.isError

  if (!isAuthenticated) return null

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <div className="absolute inset-0">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-700">Loading weather data...</p>
            </div>
          </div>
        )}

        <MapView
          sigmetData={sigmet.data}
          airsigmetData={airsigmet.data}
          showSigmet={showSigmet}
          showAirsigmet={showAirsigmet}
          minAltitude={minAltitude}
          maxAltitude={maxAltitude}
          timeOffsetHours={timeOffsetHours}
        />
      </div>

      <FiltersPanel />
    </div>
  )
}


