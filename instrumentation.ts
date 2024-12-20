import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export async function register() {
  // Initialize any observability SDKs here
}

// New in Next.js 15 - centralized error handling
export async function onRequestError(err: Error, request: Request) {
  try {
    const supabase = await createClient()
    const headersList = await headers()
    
    await supabase.from('system_logs').insert({
      level: 'error',
      category: 'system',
      message: err.message,
      timestamp: new Date().toISOString(),
      error_details: {
        name: err.name,
        message: err.message,
        stack: err.stack
      },
      request_context: {
        url: request.url,
        method: request.method,
        user_agent: headersList.get('user-agent'),
        referer: headersList.get('referer')
      }
    })
  } catch (error) {
    // Fallback to console logging if database logging fails
    console.error('Failed to log error:', error)
    console.error('Original error:', err)
  }
} 