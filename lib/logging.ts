// lib/logging.ts
import 'server-only'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import { LogLevel, LogCategory } from './logging-types'

export class Logger {
  private static async createLogEntry(
    level: LogLevel,
    message: string,
    category: LogCategory,
    metadata?: Record<string, any>,
    error?: Error
  ) {
    const supabase = await createClient()
    const headersList = await headers()
    
    const logData = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      metadata,
      request_id: headersList.get('x-request-id') || crypto.randomUUID(),
      request_context: {
        url: headersList.get('referer'),
        user_agent: headersList.get('user-agent'),
      },
      error_details: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : null
    }

    await supabase.from('system_logs').insert(logData)
  }

  static async error(
    message: string,
    category: LogCategory,
    error?: Error,
    metadata?: Record<string, any>
  ) {
    await this.createLogEntry(LogLevel.ERROR, message, category, metadata, error)
  }

  static async warn(
    message: string,
    category: LogCategory,
    metadata?: Record<string, any>
  ) {
    await this.createLogEntry(LogLevel.WARN, message, category, metadata)
  }

  static async info(
    message: string,
    category: LogCategory,
    metadata?: Record<string, any>
  ) {
    await this.createLogEntry(LogLevel.INFO, message, category, metadata)
  }

  static async debug(
    message: string,
    category: LogCategory,
    metadata?: Record<string, any>
  ) {
    if (process.env.NODE_ENV === 'development') {
      await this.createLogEntry(LogLevel.DEBUG, message, category, metadata)
    }
  }

  static async trackEvent(
    message: string,
    category: string,
    metadata?: Record<string, any>
  ) {
    const supabase = await createClient()
    const headersList = await headers()
    
    const logData = {
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      category: category as LogCategory,
      message,
      metadata,
      request_id: headersList.get('x-request-id') || crypto.randomUUID(),
      request_context: {
        url: headersList.get('referer'),
        user_agent: headersList.get('user-agent'),
      }
    }

    await supabase.from('system_logs').insert(logData)
  }
}