import React, { useRef, useState } from 'react'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { GeoJSONFeatureCollection, GeoJSONFeature } from '@/types'
import { useMapLayers } from './useMapLayers'
import { Popup } from './Popup'
import { useInitMap } from './hooks/useInitMap'
import { useSyncRefs } from './hooks/useSyncRefs'
import { useClickHandler } from './hooks/useClickHandler'
import { useFitBounds } from './hooks/useFitBounds'

interface MapViewProps {
  sigmetData: GeoJSONFeatureCollection | undefined
  airsigmetData: GeoJSONFeatureCollection | undefined
  showSigmet: boolean
  showAirsigmet: boolean
  minAltitude: number
  maxAltitude: number
}

export const MapView: React.FC<MapViewProps> = ({
  sigmetData,
  airsigmetData,
  showSigmet,
  showAirsigmet,
  minAltitude,
  maxAltitude,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useInitMap(mapContainer)
  const [selectedFeature, setSelectedFeature] = useState<GeoJSONFeature | null>(null)
  const { sigmetDataRef, airsigmetDataRef } = useSyncRefs(sigmetData, airsigmetData)

  // Use map layers hook
  useMapLayers({
    map: map.current,
    sigmetData,
    airsigmetData,
    showSigmet,
    showAirsigmet,
    minAltitude,
    maxAltitude,
  })

  // Handle polygon clicks
  useClickHandler({
    map,
    sigmetDataRef,
    airsigmetDataRef,
    onFeatureSelect: setSelectedFeature,
  })

  // Fit map to bounds when data loads
  useFitBounds({
    map,
    sigmetData,
    airsigmetData,
  })

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      {selectedFeature && (
        <div className="absolute top-4 left-4 z-10">
          <Popup
            feature={selectedFeature}
            onClose={() => {
              setSelectedFeature(null)
            }}
          />
        </div>
      )}
    </div>
  )
}

