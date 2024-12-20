// lib/logging.ts
import 'server-only'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import { LogLevel, LogCategory, LogEntry as BaseLogEntry } from './logging-types'

interface LogEntry extends BaseLogEntry {
  timestamp: string;
}

export class Logger {
  static info(message: string, category: LogCategory, details?: unknown) {
    Logger.log(LogLevel.INFO, message, category, details);
  }

  static warn(message: string, category: LogCategory, details?: unknown) {
    Logger.log(LogLevel.WARN, message, category, details);
  }

  static error(message: string, category: LogCategory, details?: unknown) {
    Logger.log(LogLevel.ERROR, message, category, details);
  }

  static debug(message: string, category: LogCategory, details?: unknown) {
    if (process.env.NODE_ENV === 'development') {
      Logger.log(LogLevel.DEBUG, message, category, details);
    }
  }

  private static log(level: LogLevel, message: string, category: LogCategory, details?: unknown) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      metadata: details ? { ...details } : undefined
    };

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console[level.toLowerCase() as 'log' | 'info' | 'warn' | 'error'](
        JSON.stringify(entry, null, 2)
      );
    }

    // TODO: In production, send to logging service
    // This could be implemented later with services like DataDog, New Relic, etc.
  }
}