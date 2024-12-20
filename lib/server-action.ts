import { Logger } from './logging'
import { LogCategory } from './logging-types'
import { headers } from 'next/headers'

type ServerActionFunction<T extends any[], R> = (...args: T) => Promise<R>

export function withLogging<T extends any[], R>(
  actionName: string,
  category: LogCategory,
  fn: ServerActionFunction<T, R>
): ServerActionFunction<T, R> {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now()
    const headersList = await headers()
    const requestId = headersList.get('x-request-id') || crypto.randomUUID()

    try {
      // Log the start of the action
      await Logger.info(`Starting server action: ${actionName}`, category, {
        requestId,
        actionName,
        args: process.env.NODE_ENV === 'development' ? args : undefined,
      })

      // Execute the action
      const result = await fn(...args)

      // Log successful completion
      const duration = Date.now() - startTime
      await Logger.info(`Completed server action: ${actionName}`, category, {
        requestId,
        actionName,
        duration,
        success: true,
      })

      return result
    } catch (error) {
      // Log error
      const duration = Date.now() - startTime
      await Logger.error(`Failed server action: ${actionName}`, category, {
        requestId,
        actionName,
        duration,
        error,
        args: process.env.NODE_ENV === 'development' ? args : undefined,
      })

      throw error
    }
  }
}

// Example usage:
// export const createUser = withLogging(
//   'createUser',
//   LogCategory.AUTH,
//   async (userData: CreateUserData) => {
//     // Implementation
//   }
// ) 