import React from 'react'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'

interface AltitudeRangeProps {
  minAltitude: number
  maxAltitude: number
  onMinAltitudeChange: (value: number) => void
  onMaxAltitudeChange: (value: number) => void
}

export const AltitudeRange: React.FC<AltitudeRangeProps> = ({
  minAltitude,
  maxAltitude,
  onMinAltitudeChange,
  onMaxAltitudeChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="min-altitude">Min Altitude</Label>
          <span className="text-sm text-muted-foreground">
            {minAltitude / 1000}k ft
          </span>
        </div>
        <div className="cursor-pointer">
          <Slider
            id="min-altitude"
            value={[minAltitude]}
            min={0}
            max={48000}
            step={1000}
            onValueChange={(value: number[]) => onMinAltitudeChange(Math.min(value[0], maxAltitude))}
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="max-altitude">Max Altitude</Label>
          <span className="text-sm text-muted-foreground">
            {maxAltitude / 1000}k ft
          </span>
        </div>
        <div className="cursor-pointer">
          <Slider
            id="max-altitude"
            value={[maxAltitude]}
            min={0}
            max={48000}
            step={1000}
            onValueChange={(value: number[]) => onMaxAltitudeChange(Math.max(value[0], minAltitude))}
          />
        </div>
      </div>
    </div>
  )
}

