import { LogLevel, LogCategory } from '../logging-types'

export interface LoggerInterface {
  info(message: string, category: LogCategory, details?: unknown): void
  warn(message: string, category: LogCategory, details?: unknown): void
  error(message: string, category: LogCategory, details?: unknown): void
  debug(message: string, category: LogCategory, details?: unknown): void
}

export interface LogMetadata {
  churchId?: string
  userId?: string
  requestId: string
  environment: string
  timestamp: string
  category: LogCategory
  level: LogLevel
  [key: string]: any
}

export interface ErrorDetails {
  name: string
  message: string
  stack?: string
  code?: string
  cause?: unknown
}

export interface StructuredLogEntry {
  message: string
  metadata: LogMetadata
  error?: ErrorDetails
}

export interface LoggerOptions {
  defaultMetadata?: Partial<LogMetadata>
  serviceName?: string
  version?: string
} 