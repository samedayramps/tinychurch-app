import { createClient } from '@/utils/supabase/server'
import { 
  TableName, 
  TableRow, 
  TableInsert, 
  TableUpdate,
  DALResponse,
  DALListResponse,
  QueryOptions,
  QueryFilter 
} from './types'
import { PostgrestFilterBuilder } from '@supabase/postgrest-js'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/database.types'

const applyFilters = (
  query: PostgrestFilterBuilder<any, any, any>,
  filters?: QueryFilter[]
) => {
  if (!filters) return query
  
  return filters.reduce((q, filter) => {
    const filterFn = q[filter.operator]
    if (typeof filterFn === 'function') {
      return filterFn.call(q, filter.column, filter.value)
    }
    return q
  }, query)
}

export const createDAL = <T extends TableName>(tableName: T) => {
  const getClient = async (): Promise<SupabaseClient<Database>> => createClient()

  return {
    async findOne(
      id: string,
      options: Omit<QueryOptions, 'limit' | 'offset'> = {}
    ): Promise<DALResponse<TableRow<T>>> {
      const supabase = await getClient()
      let query = supabase
        .from(tableName)
        .select(options.select || '*')
        
      query = applyFilters(query, options.filters)
      
      const result = await query
        .eq('id', id)
        .single()
      
      return { 
        data: result.data as TableRow<T> | null,
        error: result.error
      }
    },

    async findMany(
      options: QueryOptions = {}
    ): Promise<DALListResponse<TableRow<T>>> {
      const supabase = await getClient()
      let query = supabase
        .from(tableName)
        .select(options.select || '*')
      
      query = applyFilters(query, options.filters)
      
      if (options.orderBy) {
        query = query.order(
          options.orderBy.column, 
          { ascending: options.orderBy.ascending ?? true }
        )
      }
      
      if (options.limit) {
        query = query.limit(options.limit)
      }
      
      if (options.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 10) - 1
        )
      }
      
      const result = await query
      
      return { 
        data: (result.data || []) as unknown as TableRow<T>[],
        error: result.error
      }
    },

    async create(
      data: TableInsert<T>
    ): Promise<DALResponse<TableRow<T>>> {
      const supabase = await getClient()
      const result = await supabase
        .from(tableName)
        .insert(data as any)
        .select()
        .single()
      
      return { 
        data: result.data as TableRow<T> | null,
        error: result.error
      }
    },

    async update(
      id: string,
      data: TableUpdate<T>
    ): Promise<DALResponse<TableRow<T>>> {
      const supabase = await getClient()
      const result = await supabase
        .from(tableName)
        .update(data as any)
        .eq('id', id)
        .select()
        .single()
      
      return { 
        data: result.data as TableRow<T> | null,
        error: result.error
      }
    },

    async delete(id: string): Promise<DALResponse<TableRow<T>>> {
      const supabase = await getClient()
      const result = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)
        .select()
        .single()
      
      return { 
        data: result.data as TableRow<T> | null,
        error: result.error
      }
    },

    async exists(id: string): Promise<boolean> {
      const { data } = await this.findOne(id, { select: 'id' })
      return !!data
    }
  }
} 