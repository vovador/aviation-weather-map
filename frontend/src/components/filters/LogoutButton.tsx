import React from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface LogoutButtonProps {
  onLogout: () => void
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => {
  return (
    <div className="mt-6 pt-6">
      <Separator className="mb-6" />
      <Button
        onClick={onLogout}
        variant="destructive"
        className="w-full cursor-pointer"
        size="lg"
      >
        Logout
      </Button>
    </div>
  )
}

