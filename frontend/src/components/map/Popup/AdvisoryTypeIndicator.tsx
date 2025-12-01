import React from 'react'
import { CardTitle } from '@/components/ui/card'
import type { AdvisoryType } from '@/types'

/**
 * Returns the Tailwind color class for the advisory type icon
 */
const getAdvisoryIconColor = (advisoryType: AdvisoryType | undefined): string => {
  if (advisoryType === 'SIGMET') return 'bg-red-500'
  if (advisoryType === 'AIRSIGMET') return 'bg-blue-500'
  return 'bg-gray-400'
}

/**
 * Renders the advisory type indicator with icon and label
 */
export const AdvisoryTypeIndicator: React.FC<{ type: AdvisoryType }> = ({ type }) => {
  const iconColor = getAdvisoryIconColor(type)

  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-4 w-4 rounded-full flex-shrink-0 ${iconColor}`}
        aria-label={type}
      />
      <CardTitle className="text-lg font-bold text-black">{type}</CardTitle>
    </div>
  )
}

