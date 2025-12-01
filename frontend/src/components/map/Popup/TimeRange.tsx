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
      <div>Start: {start}</div>
      <div>End: {end}</div>
    </div>
  </div>
)

export default TimeRange

