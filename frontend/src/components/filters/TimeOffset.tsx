import React from 'react'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatTimeOffset } from '@/utils/dateUtils'

interface TimeOffsetProps {
  timeOffsetHours: number
  onTimeOffsetChange: (value: number) => void
  timeRange: {
    from: string
    to: string
  }
}

export const TimeOffset: React.FC<TimeOffsetProps> = ({
  timeOffsetHours,
  onTimeOffsetChange,
  timeRange,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Label htmlFor="time-offset" className="cursor-pointer">
                Time
              </Label>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                Time Offset shifts your filter window relative to the current moment.
                For example: +2 hours means you want advisories valid 2 hours from now.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span className="text-sm text-muted-foreground">
          {formatTimeOffset(timeOffsetHours)}
        </span>
      </div>
      <div className="cursor-pointer">
        <Slider
          id="time-offset"
          value={[timeOffsetHours]}
          min={-24}
          max={6}
          step={1}
          onValueChange={(value: number[]) => onTimeOffsetChange(value[0])}
        />
      </div>
      <div className="text-xs text-muted-foreground space-y-1 pt-1">
        <div>From: {timeRange.from}</div>
        <div>To: {timeRange.to}</div>
      </div>
    </div>
  )
}

