import React from 'react'
import type { GeoJSONFeature } from '@/types'
import { countCoordinates } from '@/utils/filterUtils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import InfoRow from './Popup/InfoRow'
import TimeRange from './Popup/TimeRange'
import RawTextBlock from './Popup/RawTextBlock'
import { formatDate } from './Popup/formatDate'
import { formatAltitudeRange } from './Popup/formatAltitudeRange'

interface PopupProps {
  feature: GeoJSONFeature
  onClose: () => void
}

export const Popup: React.FC<PopupProps> = ({ feature, onClose }) => {
  const { properties, geometry } = feature

  const hazardLabel = properties.hazardType ? (
    <Badge variant="outline" className="text-base font-semibold">
      {properties.hazardType}
    </Badge>
  ) : (
    'Unknown'
  )

  const validityStart = formatDate(properties.validityStart)
  const validityEnd = formatDate(properties.validityEnd)

  return (
    <Card className="max-w-sm shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{hazardLabel}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-3 text-sm">

            <InfoRow label="Bulletin ID:" value={properties.bulletinId} />

            {properties.fir && <InfoRow label="FIR:" value={properties.fir} />}

            {properties.altitudeRange && (
              <InfoRow
                label="Altitude:"
                value={formatAltitudeRange(properties.altitudeRange)}
              />
            )}

            <TimeRange start={validityStart} end={validityEnd} />

            <InfoRow
              label="Coordinates:"
              value={`${countCoordinates(geometry.coordinates)} points`}
            />

            {properties.rawText && <RawTextBlock text={properties.rawText} />}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

