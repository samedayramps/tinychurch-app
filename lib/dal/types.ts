import { Database } from '@/database.types'
import { PostgrestError } from '@supabase/supabase-js'

export type TableName = keyof Database['public']['Tables']
export type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row']
export type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert']
export type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update']

export type DALResponse<T> = {
  data: T | null
  error: PostgrestError | null
}

export type DALListResponse<T> = {
  data: T[]
  error: PostgrestError | null
}

export type QueryFilter = {
  column: string
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in'
  value: any
}

export type QueryOptions = {
  filters?: QueryFilter[]
  select?: string
  orderBy?: {
    column: string
    ascending?: boolean
  }
  limit?: number
  offset?: number
} 