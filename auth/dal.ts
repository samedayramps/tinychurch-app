import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'
import { AuthUser, UserRole, DatabaseRole } from '@/auth/types'
import { redirect } from 'next/navigation'
import { AuthError, DatabaseError } from './errors'
import { mapDatabaseRole } from './roles'
import { Database } from '@/database.types'

export const verifySession = cache(async () => {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) throw new AuthError(authError.message)
    if (!user) throw new AuthError('No user found')

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        created_at,
        updated_at,
        last_active_at
      `)
      .eq('user_id', user.id)
      .single()

    if (profileError) throw new DatabaseError(profileError.message)
    if (!profile) throw new DatabaseError('No profile found')

    return {
      id: user.id,
      email: user.email!,
      churchId: profile.church_id,
      role: mapDatabaseRole(profile.role),
      profile: {
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url
      }
    } satisfies AuthUser
  } catch (error) {
    console.error('Session verification failed:', error)
    redirect('/sign-in')
  }
})

export const getUserProfile = cache(async (userId: string) => {
  const supabase = await createClient()
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    return null
  }

  return profile
})

export const updateUserProfile = async (
  userId: string, 
  data: Partial<Database['public']['Tables']['profiles']['Update']>
) => {
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('user_id', userId)

  if (error) {
    throw new Error('Failed to update user profile')
  }
}
  