import React from 'react'
import type { GeoJSONFeature } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import InfoRow from './InfoRow'
import TimeRange from './TimeRange'
import RawTextBlock from './RawTextBlock'
import { formatDate } from './formatDate'
import { formatAltitudeRange } from './formatAltitudeRange'
import { AdvisoryTypeIndicator } from './AdvisoryTypeIndicator'

interface PopupProps {
  feature: GeoJSONFeature
  onClose: () => void
}

export const Popup: React.FC<PopupProps> = ({ feature, onClose }) => {
  const { properties } = feature

  // Extract and compute values
  const advisoryType = properties.advisoryType
  const hazardType = properties.hazardType || 'Unknown'
  const validityStart = formatDate(properties.validityStart)
  const validityEnd = formatDate(properties.validityEnd)

  // Render hazard label
  const hazardLabel = (
    <Badge variant="outline" className="text-base font-semibold">
      {hazardType}
    </Badge>
  )

  // Determine header title
  const headerTitle = advisoryType ? (
    <AdvisoryTypeIndicator type={advisoryType} />
  ) : (
    <CardTitle className="text-lg">{hazardLabel}</CardTitle>
  )

  return (
    <Card className="w-[400px] h-[500px] flex flex-col shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">{headerTitle}</div>
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
        {advisoryType && (
          <div className="mt-2">
            <div className="text-sm text-muted-foreground">Hazard: {hazardLabel}</div>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
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

            {properties.rawText && <RawTextBlock text={properties.rawText} />}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

