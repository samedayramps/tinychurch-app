import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  try {
    const { error } = await supabase
      .from('system_logs')
      .delete()
      .lt('timestamp', thirtyDaysAgo.toISOString())

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to cleanup logs:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup logs' },
      { status: 500 }
    )
  }
}

// Run cleanup every day at midnight
export const dynamic = 'force-dynamic'
export const revalidate = 86400 // 24 hours 