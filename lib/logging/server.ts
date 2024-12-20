import 'server-only'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import { LogLevel, LogCategory } from '../logging-types'
import type { LoggerInterface } from './types'

class ServerLogger implements LoggerInterface {
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

  private async log(level: LogLevel, message: string, category: LogCategory, details?: unknown) {
    const headersList = await headers()
    const requestId = headersList.get('x-request-id') || crypto.randomUUID()

    const entry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      requestId,
      metadata: details ? { ...details } : undefined
    }

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console[level.toLowerCase() as 'log' | 'info' | 'warn' | 'error'](
        JSON.stringify(entry, null, 2)
      )
    }

    // In production, log to database or external service
    if (process.env.NODE_ENV === 'production') {
      try {
        const supabase = await createClient()
        await supabase.from('logs').insert([entry])
      } catch (error) {
        console.error('Failed to write log to database:', error)
      }
    }
  }
}

export const Logger = new ServerLogger() 