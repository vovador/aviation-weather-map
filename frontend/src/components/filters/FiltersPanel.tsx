import React, { useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState } from '@/redux/store'
import type { AppDispatch } from '@/redux/store'
import { useAuth } from '@/hooks/useAuth'
import {
  setShowSigmet,
  setShowAirsigmet,
  setMinAltitude,
  setMaxAltitude,
  setTimeOffsetHours,
} from '@/redux/slices/filtersSlice'
import { getDateRange } from '@/utils/dateUtils'
import toast from 'react-hot-toast'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Filter } from 'lucide-react'
import { LayerToggles } from './LayerToggles'
import { AltitudeRange } from './AltitudeRange'
import { TimeOffset } from './TimeOffset'
import { LogoutButton } from './LogoutButton'

export const FiltersPanel: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { logout } = useAuth()
  const [open, setOpen] = useState(true)

  const {
    showSigmet,
    showAirsigmet,
    minAltitude,
    maxAltitude,
    timeOffsetHours,
  } = useSelector((state: RootState) => state.filters)

  // Calculate time range for display
  const timeRange = useMemo(() => {
    return getDateRange(timeOffsetHours)
  }, [timeOffsetHours])

  // Handlers that dispatch Redux actions immediately
  const handleSigmetToggle = (pressed: boolean) => {
    dispatch(setShowSigmet(pressed))
  }

  const handleAirsigmetToggle = (pressed: boolean) => {
    dispatch(setShowAirsigmet(pressed))
  }

  const handleMinAltitudeChange = (value: number) => {
    dispatch(setMinAltitude(Math.min(value, maxAltitude)))
  }

  const handleMaxAltitudeChange = (value: number) => {
    dispatch(setMaxAltitude(Math.max(value, minAltitude)))
  }

  const handleTimeOffsetChange = (value: number) => {
    dispatch(setTimeOffsetHours(value))
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 right-4 z-50 shadow-lg"
          aria-label="Toggle filters"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 sm:w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Layers</CardTitle>
            </CardHeader>
            <CardContent>
              <LayerToggles
                showSigmet={showSigmet}
                showAirsigmet={showAirsigmet}
                onSigmetToggle={handleSigmetToggle}
                onAirsigmetToggle={handleAirsigmetToggle}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Altitude Range</CardTitle>
            </CardHeader>
            <CardContent>
              <AltitudeRange
                minAltitude={minAltitude}
                maxAltitude={maxAltitude}
                onMinAltitudeChange={handleMinAltitudeChange}
                onMaxAltitudeChange={handleMaxAltitudeChange}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Time Offset</CardTitle>
            </CardHeader>
            <CardContent>
              <TimeOffset
                timeOffsetHours={timeOffsetHours}
                onTimeOffsetChange={handleTimeOffsetChange}
                timeRange={timeRange}
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <LogoutButton onLogout={handleLogout} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

