import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState, AppDispatch } from '@/redux/store'
import { useAuth } from '@/hooks/useAuth'
import { useAltitudeControls } from '@/hooks/filters/useAltitudeControls'
import { useTimeOffsetControls } from '@/hooks/filters/useTimeOffsetControls'
import { useToggleControls } from '@/hooks/filters/useToggleControls'
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
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [open, setOpen] = useState(true)

  const {
    showSigmet,
    showAirsigmet,
    minAltitude: reduxMinAltitude,
    maxAltitude: reduxMaxAltitude,
    timeOffsetHours: reduxTimeOffsetHours,
  } = useSelector((state: RootState) => state.filters)

  const {
    localMinAltitude,
    localMaxAltitude,
    setLocalMinAltitude,
    setLocalMaxAltitude,
  } = useAltitudeControls(reduxMinAltitude, reduxMaxAltitude, dispatch)

  const {
    localTimeOffsetHours,
    setLocalTimeOffsetHours,
    timeRange,
  } = useTimeOffsetControls(reduxTimeOffsetHours, dispatch)

  const {
    handleSigmetToggle,
    handleAirsigmetToggle,
  } = useToggleControls(showSigmet, showAirsigmet, dispatch)

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
                minAltitude={localMinAltitude}
                maxAltitude={localMaxAltitude}
                onMinAltitudeChange={setLocalMinAltitude}
                onMaxAltitudeChange={setLocalMaxAltitude}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Time Offset</CardTitle>
            </CardHeader>
            <CardContent>
              <TimeOffset
                timeOffsetHours={localTimeOffsetHours}
                onTimeOffsetChange={setLocalTimeOffsetHours}
                timeRange={timeRange}
              />
            </CardContent>
          </Card>
        </div>

        <LogoutButton onLogout={handleLogout} />
      </SheetContent>
    </Sheet>
  )
}

