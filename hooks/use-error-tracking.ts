import { useEffect } from 'react'
import { Logger } from '@/lib/logging/client-logger'
import { LogCategory } from '@/lib/logging-types'

interface ErrorTrackingOptions {
  enabled?: boolean
  category?: LogCategory
  metadata?: Record<string, any>
}

export function useErrorTracking(options: ErrorTrackingOptions = {}) {
  const {
    enabled = true,
    category = LogCategory.UI,
    metadata = {}
  } = options

  useEffect(() => {
    if (!enabled) return

    const handleError = (event: ErrorEvent) => {
      const error = event.error || new Error(event.message)
      Logger.error('Unhandled client error', category, {
        source: 'client',
        url: window.location.href,
        ...metadata,
        error,
      })
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason))
      
      Logger.error('Unhandled promise rejection', category, {
        source: 'client',
        url: window.location.href,
        ...metadata,
        error,
      })
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [enabled, category, metadata])
}

// Example usage:
// function MyComponent() {
//   useErrorTracking({
//     category: LogCategory.UI,
//     metadata: {
//       componentName: 'MyComponent',
//     },
//   })
//   // ...
// } 