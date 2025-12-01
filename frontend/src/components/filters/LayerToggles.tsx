import React from 'react'
import { Toggle } from '@/components/ui/toggle'
import { cn } from '@/lib/utils'
import { ADVISORY_TYPE_LABEL } from '@/constants'

interface LayerTogglesProps {
  showSigmet: boolean
  showAirsigmet: boolean
  onSigmetToggle: (pressed: boolean) => void
  onAirsigmetToggle: (pressed: boolean) => void
}

export const LayerToggles: React.FC<LayerTogglesProps> = ({
  showSigmet,
  showAirsigmet,
  onSigmetToggle,
  onAirsigmetToggle,
}) => {
  return (
    <div className="flex gap-3">
      <Toggle
        pressed={showSigmet}
        onPressedChange={onSigmetToggle}
        aria-label={`Toggle ${ADVISORY_TYPE_LABEL.SIGMET}`}
        className={cn(
          "px-4 py-2 rounded-md font-medium transition-all cursor-pointer",
          showSigmet
            ? "!bg-red-500 !text-white border-none shadow-sm data-[state=on]:!bg-red-500 data-[state=on]:!text-white"
            : "bg-transparent text-gray-500 border border-gray-300 hover:bg-gray-50 data-[state=off]:bg-transparent"
        )}
      >
        {ADVISORY_TYPE_LABEL.SIGMET}
      </Toggle>
      <Toggle
        pressed={showAirsigmet}
        onPressedChange={onAirsigmetToggle}
        aria-label={`Toggle ${ADVISORY_TYPE_LABEL.AIRSIGMET}`}
        className={cn(
          "px-4 py-2 rounded-md font-medium transition-all cursor-pointer",
          showAirsigmet
            ? "!bg-blue-500 !text-white border-none shadow-sm data-[state=on]:!bg-blue-500 data-[state=on]:!text-white"
            : "bg-transparent text-gray-500 border border-gray-300 hover:bg-gray-50 data-[state=off]:bg-transparent"
        )}
      >
        {ADVISORY_TYPE_LABEL.AIRSIGMET}
      </Toggle>
    </div>
  )
}

