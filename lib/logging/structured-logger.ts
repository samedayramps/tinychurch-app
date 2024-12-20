import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { LogLevel, LogCategory } from '../logging-types'
import { 
  LogMetadata, 
  ErrorDetails, 
  StructuredLogEntry,
  LoggerOptions 
} from './types'

export class StructuredLogger {
  private defaultMetadata: Partial<LogMetadata>
  private serviceName: string
  private version: string

  constructor(options: LoggerOptions = {}) {
    this.defaultMetadata = options.defaultMetadata || {}
    this.serviceName = options.serviceName || 'tinychurch-app'
    this.version = options.version || process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
  }

  private async getRequestId(): Promise<string> {
    try {
      const headersList = await headers()
      return headersList.get('x-request-id') || crypto.randomUUID()
    } catch {
      return crypto.randomUUID()
    }
  }

  private formatError(error: Error): ErrorDetails {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error instanceof Error && 'code' in error && { code: (error as any).code }),
      cause: error.cause,
    }
  }

  private async enrichMetadata(
    level: LogLevel,
    category: LogCategory,
    metadata: Partial<LogMetadata> = {}
  ): Promise<LogMetadata> {
    const requestId = await this.getRequestId()
    
    return {
      ...this.defaultMetadata,
      ...metadata,
      level,
      category,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      requestId,
      serviceName: this.serviceName,
      version: this.version,
    } as LogMetadata
  }

  private async logToSupabase(entry: StructuredLogEntry) {
    try {
      const supabase = await createClient()
      await supabase.from('system_logs').insert({
        message: entry.message,
        level: entry.metadata.level,
        category: entry.metadata.category,
        church_id: entry.metadata.churchId,
        user_id: entry.metadata.userId,
        metadata: entry.metadata,
        error_details: entry.error,
        timestamp: entry.metadata.timestamp,
      })
    } catch (error) {
      // Fallback to console in case of database error
      console.error('Failed to write to Supabase:', error)
      console.error('Original log entry:', entry)
    }
  }

  private async log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    error?: Error | null,
    metadata: Partial<LogMetadata> = {}
  ) {
    const enrichedMetadata = await this.enrichMetadata(level, category, metadata)
    const entry: StructuredLogEntry = {
      message,
      metadata: enrichedMetadata,
      ...(error && { error: this.formatError(error) })
    }

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      const method = level.toLowerCase()
      switch (method) {
        case 'error':
          console.error(JSON.stringify(entry, null, 2))
          break
        case 'warn':
          console.warn(JSON.stringify(entry, null, 2))
          break
        case 'info':
          console.info(JSON.stringify(entry, null, 2))
          break
        case 'debug':
          console.debug(JSON.stringify(entry, null, 2))
          break
        default:
          console.log(JSON.stringify(entry, null, 2))
      }
    }

    // In production, log to Supabase
    if (process.env.NODE_ENV === 'production') {
      await this.logToSupabase(entry)
    }
  }

  async error(message: string, error: Error | null = null, metadata: Partial<LogMetadata> = {}) {
    return this.log(LogLevel.ERROR, LogCategory.SYSTEM, message, error, metadata)
  }

  async warn(message: string, metadata: Partial<LogMetadata> = {}) {
    return this.log(LogLevel.WARN, LogCategory.SYSTEM, message, null, metadata)
  }

  async info(message: string, metadata: Partial<LogMetadata> = {}) {
    return this.log(LogLevel.INFO, LogCategory.SYSTEM, message, null, metadata)
  }

  async debug(message: string, metadata: Partial<LogMetadata> = {}) {
    if (process.env.NODE_ENV === 'development') {
      return this.log(LogLevel.DEBUG, LogCategory.SYSTEM, message, null, metadata)
    }
  }

  async audit(
    action: string,
    category: LogCategory,
    metadata: Partial<LogMetadata> & { 
      resourceId?: string
      resourceType?: string
      changes?: { 
        before?: unknown
        after?: unknown
      }
    }
  ) {
    return this.log(LogLevel.INFO, category, action, null, {
      ...metadata,
      isAudit: true,
    })
  }
} 