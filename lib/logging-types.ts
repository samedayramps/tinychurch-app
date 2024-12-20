// Only contains types and enums - no server-side code
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export enum LogCategory {
  AUTH = 'auth',
  DATABASE = 'database',
  API = 'api',
  BUSINESS = 'business',
  SYSTEM = 'system',
  UI = 'ui'
}

export interface LogEntry {
  level: LogLevel
  category: LogCategory
  message: string
  metadata?: Record<string, any>
  church_id?: string
  user_id?: string
  error?: Error
}

export interface AuditLogEntry {
  action: string
  table_name: string
  record_id: string
  changes: {
    old?: Record<string, any>
    new?: Record<string, any>
  }
  church_id?: string
  user_id?: string
} 