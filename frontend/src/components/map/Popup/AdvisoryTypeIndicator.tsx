import React from 'react'
import { CardTitle } from '@/components/ui/card'
import type { AdvisoryType } from '@/types'
import { ADVISORY_TYPE, ADVISORY_TYPE_COLORS } from '@/constants'

/**
 * Returns the Tailwind color class for the advisory type icon
 */
const getAdvisoryIconColor = (advisoryType: AdvisoryType | undefined): string => {
  if (advisoryType === ADVISORY_TYPE.SIGMET) return ADVISORY_TYPE_COLORS.SIGMET
  if (advisoryType === ADVISORY_TYPE.AIRSIGMET) return ADVISORY_TYPE_COLORS.AIRSIGMET
  return ADVISORY_TYPE_COLORS.DEFAULT
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

