import { LogLevel, LogCategory } from '../logging-types'

interface LogMetadata {
  [key: string]: any
}

class ClientLogger {
  static info(message: string, category: LogCategory, metadata?: LogMetadata) {
    if (process.env.NODE_ENV === 'development') {
      console.info({
        level: LogLevel.INFO,
        category,
        message,
        timestamp: new Date().toISOString(),
        ...metadata,
      })
    }
  }

  static warn(message: string, category: LogCategory, metadata?: LogMetadata) {
    if (process.env.NODE_ENV === 'development') {
      console.warn({
        level: LogLevel.WARN,
        category,
        message,
        timestamp: new Date().toISOString(),
        ...metadata,
      })
    }
  }

  static error(message: string, category: LogCategory, metadata?: LogMetadata) {
    if (process.env.NODE_ENV === 'development') {
      console.error({
        level: LogLevel.ERROR,
        category,
        message,
        timestamp: new Date().toISOString(),
        ...metadata,
      })
    }
  }

  static debug(message: string, category: LogCategory, metadata?: LogMetadata) {
    if (process.env.NODE_ENV === 'development') {
      console.debug({
        level: LogLevel.DEBUG,
        category,
        message,
        timestamp: new Date().toISOString(),
        ...metadata,
      })
    }
  }
}

export { ClientLogger as Logger } 