import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profiles } from '@/lib/dal/profiles'
import type { Profile } from '@/lib/dal/profiles'
import { Logger } from '@/lib/logging'
import { LogCategory } from '@/lib/logging-types'

const QUERY_KEYS = {
  all: ['profiles'] as const,
  detail: (id: string) => [...QUERY_KEYS.all, id] as const,
  byUser: (userId: string) => [...QUERY_KEYS.all, 'user', userId] as const,
  byChurch: (churchId: string) => [...QUERY_KEYS.all, 'church', churchId] as const,
  byRole: (churchId: string, role: string) => [...QUERY_KEYS.all, 'church', churchId, 'role', role] as const,
}

export function useProfile(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: async () => {
      const { data, error } = await profiles.findOne(id)
      if (error) throw error
      return data
    },
  })
}

export function useProfileByUser(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.byUser(userId),
    queryFn: async () => {
      const { data, error } = await profiles.findByUserId(userId)
      if (error) throw error
      return data
    },
  })
}

export function useChurchProfiles(churchId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.byChurch(churchId),
    queryFn: async () => {
      const { data, error } = await profiles.findByChurch(churchId)
      if (error) throw error
      return data || []
    },
  })
}

export function useChurchProfilesByRole(churchId: string, role: string) {
  return useQuery({
    queryKey: QUERY_KEYS.byRole(churchId, role),
    queryFn: async () => {
      const { data, error } = await profiles.findByRole(churchId, role)
      if (error) throw error
      return data || []
    },
  })
}

export function useUpdateLastActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await profiles.updateLastActive(userId)
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      if (data?.user_id) {
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.byUser(data.user_id) 
        })
        Logger.info('Profile last active updated', LogCategory.BUSINESS, { 
          userId: data.user_id 
        })
      }
    },
  })
} 