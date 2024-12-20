import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useAlerts } from '@/contexts/ui-context'
import { Logger } from '@/lib/logging'
import { LogCategory } from '@/lib/logging-types'

const QUERY_KEYS = {
  session: ['auth', 'session'] as const,
  user: ['auth', 'user'] as const,
}

export function useAuth() {
  const router = useRouter()
  const { addAlert } = useAlerts()
  const queryClient = useQueryClient()
  const supabase = createClient()

  const { data: session, isLoading: isLoadingSession } = useQuery({
    queryKey: QUERY_KEYS.session,
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    },
  })

  const signIn = useMutation({
    mutationFn: async ({ 
      email, 
      password 
    }: { 
      email: string
      password: string 
    }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.session })
      router.push('/protected')
      addAlert({
        type: 'success',
        message: 'Successfully signed in',
      })
    },
    onError: (error) => {
      Logger.error('Sign in error', LogCategory.AUTH, { error })
      addAlert({
        type: 'error',
        message: 'Failed to sign in. Please check your credentials.',
      })
    },
  })

  const signOut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.session })
      router.push('/sign-in')
      addAlert({
        type: 'info',
        message: 'Successfully signed out',
      })
    },
    onError: (error) => {
      Logger.error('Sign out error', LogCategory.AUTH, { error })
      addAlert({
        type: 'error',
        message: 'Failed to sign out',
      })
    },
  })

  const resetPassword = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
    },
    onSuccess: () => {
      addAlert({
        type: 'success',
        message: 'Password reset email sent',
      })
    },
    onError: (error) => {
      Logger.error('Password reset error', LogCategory.AUTH, { error })
      addAlert({
        type: 'error',
        message: 'Failed to send password reset email',
      })
    },
  })

  return {
    session,
    isLoadingSession,
    signIn,
    signOut,
    resetPassword,
    isAuthenticated: !!session,
  }
} 