import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { churches } from '@/lib/dal/churches'
import type { Church } from '@/lib/dal/churches'
import { Logger } from '@/lib/logging'
import { LogCategory } from '@/lib/logging-types'

const QUERY_KEYS = {
  all: ['churches'] as const,
  detail: (id: string) => [...QUERY_KEYS.all, id] as const,
  byDomain: (domain: string) => [...QUERY_KEYS.all, 'domain', domain] as const,
}

export function useChurch(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: async () => {
      const { data, error } = await churches.findOne(id)
      if (error) throw error
      return data
    },
  })
}

export function useChurchByDomain(domain: string) {
  return useQuery({
    queryKey: QUERY_KEYS.byDomain(domain),
    queryFn: async () => {
      const { data, error } = await churches.findByDomain(domain)
      if (error) throw error
      return data
    },
  })
}

export function useActiveChurches() {
  return useQuery({
    queryKey: QUERY_KEYS.all,
    queryFn: async () => {
      const { data, error } = await churches.findActive()
      if (error) throw error
      return data
    },
  })
}

export function useUpdateChurchSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      id, 
      settings 
    }: { 
      id: string
      settings: Church['settings']
    }) => {
      const { data, error } = await churches.updateSettings(id, settings)
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(data.id) })
        Logger.info('Church settings updated', LogCategory.BUSINESS, { churchId: data.id })
      }
    },
  })
} 