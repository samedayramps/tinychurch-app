// components/error-boundary.tsx
'use client'

import { useEffect } from 'react'
import { Logger } from '@/lib/logging/client-logger'
import { isAppError } from '@/lib/error-utils'
import { AppError } from '../types'
import { LogCategory } from '@/lib/logging-types'

interface ErrorBoundaryProps {
  error: Error
  reset: () => void
}

export default function ErrorBoundary({
  error,
  reset,
}: ErrorBoundaryProps) {
  useEffect(() => {
    Logger.error('Unhandled Error in Application', LogCategory.UI, {
      name: error.name,
      message: error.message,
      stack: error.stack,
      isAppError: isAppError(error),
      ...(isAppError(error) && {
        code: (error as AppError).code,
        httpStatus: (error as AppError).httpStatus,
        context: (error as AppError).context,
      }),
    })
  }, [error])

  const errorMessage = isAppError(error) 
    ? error.message 
    : 'An unexpected error occurred. Please try again later.'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Oops!</h1>
          <p className="text-lg text-gray-600">{errorMessage}</p>
          
          <button
            onClick={reset}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}