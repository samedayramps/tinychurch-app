'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { LogLevel, LogCategory } from '@/lib/logging-types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow } from 'date-fns'

interface SystemLogFilters {
  level?: LogLevel | 'all'
  category?: LogCategory | 'all'
  churchId?: string
  timeRange: '24h' | '7d' | '30d' | 'all'
}

interface SystemLogsViewProps {
  isSuperAdmin?: boolean
}

export function SystemLogsView({ isSuperAdmin = false }: SystemLogsViewProps) {
  const [filters, setFilters] = useState<SystemLogFilters>({
    timeRange: '24h',
    level: 'all',
    category: 'all',
    churchId: 'all'
  })

  // Fetch churches for superadmin filter
  const { data: churches } = useQuery({
    queryKey: ['churches'],
    queryFn: async () => {
      if (!isSuperAdmin) return []
      const supabase = createClient()
      const { data, error } = await supabase
        .from('churches')
        .select('id, name')
        .order('name')
      
      if (error) throw error
      return data
    },
    enabled: isSuperAdmin
  })
  
  const { data: logs, isLoading } = useQuery({
    queryKey: ['systemLogs', filters],
    queryFn: async () => {
      const supabase = createClient()
      
      let query = supabase
        .from('system_logs')
        .select(`
          *,
          churches:church_id (
            name
          )
        `)
        .order('timestamp', { ascending: false })
        .limit(100)
      
      if (filters.level && filters.level !== 'all') {
        query = query.eq('level', filters.level)
      }
      
      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category)
      }

      if (filters.churchId && filters.churchId !== 'all') {
        query = query.eq('church_id', filters.churchId)
      }
      
      if (filters.timeRange !== 'all') {
        const hours = {
          '24h': 24,
          '7d': 24 * 7,
          '30d': 24 * 30
        }[filters.timeRange]
        
        query = query.gte('timestamp', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
      }
      
      const { data, error } = await query
      if (error) throw error
      return data
    }
  })

  const levelColors: Record<LogLevel, string> = {
    [LogLevel.ERROR]: 'bg-red-100 text-red-800',
    [LogLevel.WARN]: 'bg-yellow-100 text-yellow-800',
    [LogLevel.INFO]: 'bg-blue-100 text-blue-800',
    [LogLevel.DEBUG]: 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        {isSuperAdmin && (
          <Select
            value={filters.churchId || 'all'}
            onValueChange={(value) => setFilters(f => ({ ...f, churchId: value }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by church" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Churches</SelectItem>
              {churches?.map(church => (
                <SelectItem key={church.id} value={church.id}>
                  {church.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select
          value={filters.level || 'all'}
          onValueChange={(value) => setFilters(f => ({ 
            ...f, 
            level: value === 'all' ? undefined : value as LogLevel 
          }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {Object.values(LogLevel).map(level => (
              <SelectItem key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.category || 'all'}
          onValueChange={(value) => setFilters(f => ({ 
            ...f, 
            category: value === 'all' ? undefined : value as LogCategory 
          }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.values(LogCategory).map(category => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.timeRange}
          onValueChange={(value) => setFilters(f => ({ 
            ...f, 
            timeRange: value as SystemLogFilters['timeRange']
          }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="p-4">
        <ScrollArea className="h-[600px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-muted-foreground">Loading logs...</span>
            </div>
          ) : !logs?.length ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-muted-foreground">No logs found</span>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className={levelColors[log.level as LogLevel]}>
                      {log.level}
                    </Badge>
                    <Badge variant="outline">{log.category}</Badge>
                    {isSuperAdmin && (
                      <Badge variant="outline" className="bg-gray-100">
                        {log.churches?.name || 'System-wide'}
                      </Badge>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{log.message}</p>
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <pre className="text-xs bg-muted p-2 rounded">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  )}
                  {log.error_details && (
                    <div className="mt-2 text-xs text-red-600">
                      <p className="font-semibold">{log.error_details.name}</p>
                      <p>{log.error_details.message}</p>
                      {log.error_details.stack && (
                        <pre className="mt-1 whitespace-pre-wrap font-mono text-[10px]">
                          {log.error_details.stack}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  )
} 