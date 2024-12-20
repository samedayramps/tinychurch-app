'use client'

import { ReactNode } from 'react'
import { QueryProvider } from './query-provider'
import { UIProvider } from '@/contexts/ui-context'

interface RootProviderProps {
  children: ReactNode
}

export function RootProvider({ children }: RootProviderProps) {
  return (
    <QueryProvider>
      <UIProvider>
        {children}
      </UIProvider>
    </QueryProvider>
  )
} 