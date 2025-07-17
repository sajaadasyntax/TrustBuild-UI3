"use client"

import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showIcon?: boolean
  showConfirmDialog?: boolean
  className?: string
  children?: React.ReactNode
}

export function LogoutButton({ 
  variant = 'outline', 
  size = 'default',
  showIcon = true,
  showConfirmDialog = true,
  className = '',
  children
}: LogoutButtonProps) {
  const { logout, user } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      console.log("🔴 LogoutButton: Starting logout process...")
      console.log("🔴 LogoutButton: Current user:", user)
      console.log("🔴 LogoutButton: User role:", user?.role)
      
      setIsLoggingOut(true)
      await logout()
      
      console.log("🔴 LogoutButton: Logout successful")
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      })
      
    } catch (error) {
      console.error('🔴 LogoutButton: Logout error:', error)
      toast({
        title: "Logout error",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleButtonClick = () => {
    console.log("🔴 LogoutButton: Button clicked, showConfirmDialog:", showConfirmDialog)
    if (!showConfirmDialog) {
      handleLogout()
    }
  }

  const LogoutButtonContent = () => (
    <Button
      variant={variant}
      size={size}
      disabled={isLoggingOut}
      className={className}
      onClick={showConfirmDialog ? undefined : handleButtonClick}
    >
      {showIcon && <LogOut className="h-4 w-4 mr-2" />}
      {children || (isLoggingOut ? 'Logging out...' : 'Logout')}
    </Button>
  )

  if (!showConfirmDialog) {
    return <LogoutButtonContent />
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div onClick={() => console.log("🔴 LogoutButton: AlertDialog trigger clicked")}>
          <LogoutButtonContent />
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to log out of your {user?.role?.toLowerCase()} account?
            You will need to log in again to access your dashboard.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoggingOut}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleLogout} 
            disabled={isLoggingOut}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isLoggingOut ? 'Logging out...' : 'Yes, Logout'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 