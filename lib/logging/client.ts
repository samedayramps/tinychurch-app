'use client'

import { LogLevel, LogCategory } from '../logging-types'
import type { LoggerInterface } from './types'

class ClientLogger implements LoggerInterface {
  info(message: string, category: LogCategory, details?: unknown) {
    this.log(LogLevel.INFO, message, category, details)
  }

  warn(message: string, category: LogCategory, details?: unknown) {
    this.log(LogLevel.WARN, message, category, details)
  }

  error(message: string, category: LogCategory, details?: unknown) {
    this.log(LogLevel.ERROR, message, category, details)
  }

  debug(message: string, category: LogCategory, details?: unknown) {
    if (process.env.NODE_ENV === 'development') {
      this.log(LogLevel.DEBUG, message, category, details)
    }
  }

  private log(level: LogLevel, message: string, category: LogCategory, details?: unknown) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      metadata: details ? { ...details } : undefined
    }

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console[level.toLowerCase() as 'log' | 'info' | 'warn' | 'error'](
        JSON.stringify(entry, null, 2)
      )
    }

    // In production, you might want to send logs to a service
    // This could be implemented later with services like DataDog, New Relic, etc.
  }
}

export const Logger = new ClientLogger() 