import { Logger } from '@/lib/logging'
import { LogLevel, LogCategory } from '@/lib/logging-types'
import { NextResponse } from 'next/server'

type LogMethod = 'info' | 'error' | 'warn'

export async function POST(request: Request) {
  const body = await request.json()
  const { level, category, message, metadata, error } = body
  
  try {
    switch (level as LogLevel) {
      case LogLevel.ERROR:
        await Logger.error(message, category as LogCategory, {
          error,
          ...metadata
        })
        break
      case LogLevel.WARN:
        await Logger.warn(message, category as LogCategory, metadata)
        break
      case LogLevel.INFO:
      default:
        await Logger.info(message, category as LogCategory, metadata)
        break
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create log' }, 
      { status: 500 }
    )
  }
} 