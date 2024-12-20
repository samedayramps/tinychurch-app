import { AppError, ValidationError, AuthorizationError } from '@/errors/types';
import { Logger } from './logging'
import { LogCategory } from './logging-types'

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function handleError(error: unknown): AppError {
  // If it's already an AppError, return it
  if (isAppError(error)) {
    return error;
  }

  // If it's a standard Error, convert it to an AppError
  if (error instanceof Error) {
    return new AppError(
      error.message,
      'INTERNAL_ERROR',
      500,
      { originalError: error }
    );
  }

  // For unknown errors, create a generic AppError
  return new AppError(
    'An unexpected error occurred',
    'UNKNOWN_ERROR',
    500,
    { originalError: error }
  );
}

export async function logError(error: unknown, context?: Record<string, any>) {
  const appError = handleError(error);
  
  await Logger.error('Application Error', LogCategory.SYSTEM, {
    code: appError.code,
    httpStatus: appError.httpStatus,
    context: { ...appError.context, ...context },
    error: appError,
  });

  return appError;
}

export function assertCondition(
  condition: boolean,
  message: string,
  context?: Record<string, any>
): asserts condition {
  if (!condition) {
    throw new ValidationError(message, context);
  }
}

export function assertAuthorized(
  condition: boolean,
  message = 'Unauthorized access',
  context?: Record<string, any>
): asserts condition {
  if (!condition) {
    throw new AuthorizationError(message, context);
  }
} 