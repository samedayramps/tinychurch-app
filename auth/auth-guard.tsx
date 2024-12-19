'use client'

import { useAuth } from '@/auth/useAuth'
import { UserRole } from '@/auth/types'
import { ReactNode } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Alert } from '@/components/ui/alert'
import { canAccessChurch, hasRole } from '@/auth/utils'

interface AuthGuardProps {
  children: ReactNode
  allowedRoles?: UserRole[]
  churchId?: string
  loadingComponent?: ReactNode
  unauthorizedComponent?: ReactNode
}

export function AuthGuard({ 
  children, 
  allowedRoles, 
  churchId,
  loadingComponent = <LoadingSpinner />,
  unauthorizedComponent = <Alert variant="destructive">Unauthorized access</Alert>
}: AuthGuardProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return loadingComponent
  }

  if (!user) {
    return unauthorizedComponent
  }

  if (churchId && !canAccessChurch(user, churchId)) {
    return unauthorizedComponent
  }

  if (allowedRoles && !hasRole(user, allowedRoles)) {
    return unauthorizedComponent
  }

  return <>{children}</>
}