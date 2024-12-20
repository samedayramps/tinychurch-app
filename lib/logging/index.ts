import { StructuredLogger } from './structured-logger'

// Create a singleton instance
export const logger = new StructuredLogger({
  serviceName: 'tinychurch-app',
  defaultMetadata: {
    // Add any default metadata you want included in all logs
  }
})

// Re-export types
export * from './types'
export * from '../logging-types' 