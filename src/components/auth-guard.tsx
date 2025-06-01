'use client'

import { useAuth } from '../context/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, requireAuth = false }: AuthGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && requireAuth && !user) {
      // Save the current path for redirect back after login
      const returnTo = window.location.pathname
      router.push(`/login?returnTo=${encodeURIComponent(returnTo)}`)
    }
  }, [user, isLoading, requireAuth, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-200/10 backdrop-blur-md flex items-center justify-center">
        <div className="font-mono text-gray-600 dark:text-gray-400">LOADING...</div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return null
  }

  return <>{children}</>
}