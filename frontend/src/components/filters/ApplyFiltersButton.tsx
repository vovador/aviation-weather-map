import React from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface ApplyFiltersButtonProps {
  onClick: () => void
  disabled: boolean
  isApplying: boolean
}

export const ApplyFiltersButton: React.FC<ApplyFiltersButtonProps> = ({
  onClick,
  disabled,
  isApplying,
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className="w-full"
      size="lg"
    >
      {isApplying ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Applying Filters...
        </>
      ) : (
        'Apply Filters'
      )}
    </Button>
  )
}

