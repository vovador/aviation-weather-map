import React from 'react'
import { Navigate } from 'react-router-dom'
import { useLoginGuestMutation } from '@/redux/awc'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export const LoginPage: React.FC = () => {
  const { isAuthenticated, login } = useAuth()
  const [loginGuest, { isLoading }] = useLoginGuestMutation()

  // If already authenticated, redirect immediately
  if (isAuthenticated) {
    return <Navigate to="/map" replace />
  }

  const handleLogin = async () => {
    try {
      const { token } = await loginGuest().unwrap()
      login(token)
      toast.success('Logged in successfully')
    } catch (err: any) {
      toast.error(err?.data?.error || 'Failed to login')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold mb-2">
            Aviation Weather Map
          </CardTitle>
          <CardDescription className="text-base">
            Interactive SIGMET/AIRMET Visualization
          </CardDescription>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? 'Logging in...' : 'Login as Guest'}
          </Button>
        </CardContent>

        {/* Optional: you can show a footer for UX polish */}
        <CardFooter className="justify-center text-xs text-muted-foreground">
          Guest mode uses limited demo access
        </CardFooter>
      </Card>
    </div>
  )
}



