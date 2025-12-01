import React from 'react'
import { Label } from '@/components/ui/label'

interface TimeRangeProps {
  start: string
  end: string
}

const TimeRange: React.FC<TimeRangeProps> = ({ start, end }) => (
  <div>
    <Label className="text-muted-foreground">Time Range:</Label>
    <div className="font-medium mt-1 space-y-1">
      <div className="break-words">Start: {start}</div>
      <div className="break-words">End: {end}</div>
    </div>
  </div>
)

export default TimeRange

