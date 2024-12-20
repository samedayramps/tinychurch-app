'use server'

import { createClient } from '@/utils/supabase/server'
import { verifySession } from '@/auth/dal'
import { UserRoles } from '@/auth/types'
import { mapToDatabaseRole, isValidRole } from '@/auth/roles'
import { revalidatePath } from 'next/cache'
import { AuthError } from '@/auth/errors'
import type { Database } from '@/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

type AuditLog = Database['public']['Tables']['audit_logs']['Row'] & {
  user: Pick<Database['public']['Tables']['profiles']['Row'], 'user_id' | 'display_name' | 'email'> | null
}

type ProfileWithRelations = Database['public']['Tables']['profiles']['Row'] & {
  church: Database['public']['Tables']['churches']['Row'] | null
  audit_logs: AuditLog[]
}

export async function listUsers(churchId?: string) {
  const user = await verifySession()
  const supabase = await createClient()

  // Only superadmins can list all users, others can only see their church's users
  if (user.role !== UserRoles.SUPER_ADMIN && !churchId) {
    throw new AuthError('Unauthorized')
  }

  const query = supabase
    .from('profiles')
    .select(`
      id,
      user_id,
      church_id,
      display_name,
      email,
      avatar_url,
      role,
      status,
      last_active_at,
      phone_number,
      church:churches(
        id,
        name
      )
    `)
    .order('last_active_at', { ascending: false, nullsFirst: false })

  // Filter by church if specified or if not superadmin
  if (churchId || user.role !== UserRoles.SUPER_ADMIN) {
    query.eq('church_id', churchId || user.churchId)
  }

  const { data: users, error } = await query

  if (error) {
    console.error('Failed to list users:', error)
    throw new Error('Failed to list users')
  }

  return users
}

export async function updateUserRole(userId: string, role: string, churchId?: string) {
  const user = await verifySession()
  const supabase = await createClient()

  // Only superadmins can update roles globally
  if (user.role !== UserRoles.SUPER_ADMIN && !churchId) {
    throw new AuthError('Unauthorized')
  }

  // Validate the role
  if (!isValidRole(role)) {
    throw new Error('Invalid role')
  }

  // Now TypeScript knows role is a valid UserRole
  const dbRole = mapToDatabaseRole(role)

  const { error } = await supabase
    .from('profiles')
    .update({ 
      role: dbRole,
      last_active_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq(user.role !== UserRoles.SUPER_ADMIN ? 'church_id' : 'user_id', user.role !== UserRoles.SUPER_ADMIN ? user.churchId : userId)

  if (error) {
    console.error('Failed to update user role:', error)
    throw new Error('Failed to update user role')
  }

  // Create audit log
  const { error: auditError } = await supabase
    .from('audit_logs')
    .insert({
      action: 'update_role',
      table_name: 'profiles',
      record_id: userId,
      user_id: user.id,
      church_id: churchId || user.churchId,
      changes: { role: dbRole }
    })

  if (auditError) {
    console.error('Failed to create audit log:', auditError)
  }

  revalidatePath('/superadmin/users')
  revalidatePath(`/superadmin/users/${userId}`)
}

export async function updateUserStatus(userId: string, status: 'active' | 'inactive', churchId?: string) {
  const user = await verifySession()
  const supabase = await createClient()

  // Only superadmins and church admins can update user status
  if (user.role !== UserRoles.SUPER_ADMIN && user.role !== UserRoles.CHURCH_ADMIN) {
    throw new AuthError('Unauthorized')
  }

  const { error } = await supabase
    .from('profiles')
    .update({ 
      status,
      last_active_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq(user.role !== UserRoles.SUPER_ADMIN ? 'church_id' : 'user_id', user.role !== UserRoles.SUPER_ADMIN ? user.churchId : userId)

  if (error) {
    console.error('Failed to update user status:', error)
    throw new Error('Failed to update user status')
  }

  // Create audit log
  const { error: auditError } = await supabase
    .from('audit_logs')
    .insert({
      action: 'update_status',
      table_name: 'profiles',
      record_id: userId,
      user_id: user.id,
      church_id: churchId || user.churchId,
      changes: { status }
    })

  if (auditError) {
    console.error('Failed to create audit log:', auditError)
  }

  revalidatePath('/superadmin/users')
  revalidatePath(`/superadmin/users/${userId}`)
}

export async function getUserDetails(userId: string): Promise<ProfileWithRelations> {
  const user = await verifySession()
  const supabase = await createClient()

  try {
    // First get the profile with church data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        church:churches(*)
      `)
      .eq('user_id', userId)
      .single()

    if (profileError) {
      console.error('Failed to get profile:', profileError)
      throw new Error('Failed to get profile')
    }

    if (!profileData) {
      throw new Error('Profile not found')
    }

    // Check authorization
    if (user.role !== UserRoles.SUPER_ADMIN && profileData.church_id !== user.churchId) {
      throw new AuthError('Unauthorized')
    }

    // Separately fetch audit logs with proper join
    const { data: auditLogs, error: auditError } = await supabase
      .from('audit_logs')
      .select(`
        id,
        action,
        changes,
        created_at,
        user:profiles!audit_logs_user_id_fkey (
          user_id,
          display_name,
          email
        )
      `)
      .eq('record_id', userId)
      .order('created_at', { ascending: false })

    if (auditError) {
      console.error('Failed to get audit logs:', auditError)
      // Continue with empty audit logs instead of throwing
    }

    // Transform the data to match our types
    const profile: ProfileWithRelations = {
      ...profileData,
      church: profileData.church,
      audit_logs: (auditLogs || []).map(log => ({
        ...log,
        // Ensure user is properly typed even if the relationship returns null
        user: log.user && !Array.isArray(log.user) ? log.user : null
      }))
    }

    return profile

  } catch (error) {
    console.error('Failed to get user details:', error)
    throw error // Throw the original error for better debugging
  }
} 