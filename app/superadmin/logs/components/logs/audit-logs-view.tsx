'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
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

// First, let's define the possible audit action types
type AuditAction = 'create' | 'update' | 'delete' | 'all';

interface AuditLogFilters {
  action?: AuditAction
  table?: string | 'all'
  churchId?: string
  timeRange: '24h' | '7d' | '30d' | 'all'
}

interface AuditLogsViewProps {
  isSuperAdmin?: boolean
}

type TableRecord = {
  table_name: string;
}

export function AuditLogsView({ isSuperAdmin = false }: AuditLogsViewProps) {
  const [filters, setFilters] = useState<AuditLogFilters>({
    timeRange: '24h',
    action: 'all',
    table: 'all',
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

  const { data: tables } = useQuery({
    queryKey: ['uniqueTables'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('audit_logs')
        .select('table_name')
        .order('table_name')
      
      if (error) throw error
      
      const uniqueTables = Array.from(
        new Set(data.map((d: TableRecord) => d.table_name))
      )
      return uniqueTables
    }
  })

  const { data: logs, isLoading } = useQuery({
    queryKey: ['auditLogs', filters],
    queryFn: async () => {
      const supabase = createClient()
      
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          profiles:user_id (
            display_name,
            email
          ),
          churches:church_id (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100)
      
      if (filters.action && filters.action !== 'all') {
        console.log('Filtering by action:', filters.action) // Debug log
        query = query.eq('action', filters.action.toUpperCase()) // Try uppercase
      }
      
      if (filters.table && filters.table !== 'all') {
        query = query.eq('table_name', filters.table)
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
        
        query = query.gte('created_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
      }
      
      const { data, error } = await query
      console.log('Query result:', data) // Debug log
      if (error) throw error
      return data
    }
  })

  const actionColors: Record<string, string> = {
    'create': 'bg-green-100 text-green-800',
    'update': 'bg-blue-100 text-blue-800',
    'delete': 'bg-red-100 text-red-800'
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
          value={filters.action || 'all'}
          onValueChange={(value) => setFilters(f => ({ 
            ...f, 
            action: value as AuditAction
          }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.table || 'all'}
          onValueChange={(value) => setFilters(f => ({ 
            ...f, 
            table: value === 'all' ? undefined : value 
          }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by table" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tables</SelectItem>
            {tables?.map((table: string) => (
              <SelectItem key={table} value={table}>
                {table.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.timeRange}
          onValueChange={(value) => setFilters(f => ({ 
            ...f, 
            timeRange: value as AuditLogFilters['timeRange']
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

      {process.env.NODE_ENV === 'development' && (
        <pre className="text-xs bg-muted p-2 rounded">
          Current filters: {JSON.stringify(filters, null, 2)}
        </pre>
      )}

      <Card className="p-4">
        <ScrollArea className="h-[600px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-muted-foreground">Loading audit logs...</span>
            </div>
          ) : !logs?.length ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-muted-foreground">No audit logs found</span>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className={actionColors[log.action]}>
                      {log.action}
                    </Badge>
                    <Badge variant="outline">{log.table_name}</Badge>
                    {isSuperAdmin && (
                      <Badge variant="outline" className="bg-gray-100">
                        {log.churches?.name || 'System-wide'}
                      </Badge>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </span>
                    {log.profiles && (
                      <span className="text-sm text-muted-foreground">
                        by {log.profiles.display_name || log.profiles.email}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {log.changes?.old && (
                      <div>
                        <p className="text-xs font-medium mb-1">Previous Values</p>
                        <pre className="text-xs bg-muted p-2 rounded">
                          {JSON.stringify(log.changes.old, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.changes?.new && (
                      <div>
                        <p className="text-xs font-medium mb-1">New Values</p>
                        <pre className="text-xs bg-muted p-2 rounded">
                          {JSON.stringify(log.changes.new, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  )
} 