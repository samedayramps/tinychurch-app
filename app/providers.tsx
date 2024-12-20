'use client'

import { useErrorTracking } from '@/hooks/use-error-tracking'
import { LogCategory } from '@/lib/logging-types'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // Add global error tracking
  useErrorTracking({
    category: LogCategory.UI,
    metadata: {
      source: 'client',
      context: 'root',
    },
  })

  return (
    <>
      {children}
    </>
  )
} 