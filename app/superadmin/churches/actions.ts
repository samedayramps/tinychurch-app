'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { verifySession } from '@/auth/dal'
import { UserRoles } from '@/auth/types'
import type { Database } from '@/database.types'

type Church = Database['public']['Tables']['churches']['Insert']

export async function createChurch(church: Church) {
  const supabase = await createClient()
  const user = await verifySession()

  // First create the church
  const { data: newChurch, error } = await supabase
    .from('churches')
    .insert(church)
    .select()
    .single()

  if (error) {
    console.error('Failed to create church:', error)
    throw new Error('Failed to create church')
  }

  // Now create the audit log
  const { error: auditError } = await supabase
    .from('audit_logs')
    .insert({
      action: 'create',
      table_name: 'churches',
      record_id: newChurch.id,
      user_id: user.id,
      changes: { data: church }
    })

  if (auditError) {
    console.error('Failed to create audit log:', auditError)
    // Don't throw here, as the church was created successfully
  }

  revalidatePath('/superadmin/churches')
  return newChurch
}

export async function updateChurch(id: string, data: Church) {
  const user = await verifySession()
  if (user.role !== UserRoles.SUPER_ADMIN) {
    throw new Error('Unauthorized')
  }

  const supabase = await createClient()

  // Check if domain name is already taken by another church
  if (data.domain_name) {
    const { data: existingChurch } = await supabase
      .from('churches')
      .select('id')
      .eq('domain_name', data.domain_name)
      .neq('id', id)
      .single()

    if (existingChurch) {
      throw new Error('Domain name is already taken')
    }
  }

  // Update the church
  const { data: church, error } = await supabase
    .from('churches')
    .update({
      name: data.name,
      domain_name: data.domain_name,
      logo_url: data.logo_url,
      timezone: data.timezone,
      settings: data.settings,
      subscription_status: data.subscription_status,
      stripe_customer_id: data.stripe_customer_id,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Failed to update church:', error)
    throw new Error('Failed to update church')
  }

  // Log the action
  const { error: auditError } = await supabase
    .from('audit_logs')
    .insert({
      type: 'church_updated',
      description: `Updated church "${church.name}"`,
      user_id: user.id,
      resource_type: 'churches',
      resource_id: church.id,
      details: { church_name: data.name }
    })

  if (auditError) {
    console.error('Failed to create audit log:', auditError)
  }

  revalidatePath('/superadmin/churches')
  revalidatePath(`/superadmin/churches/${id}`)
  return church
}

export async function deleteChurch(id: string) {
  const user = await verifySession()
  if (user.role !== UserRoles.SUPER_ADMIN) {
    throw new Error('Unauthorized')
  }

  const supabase = await createClient()

  // Get church details for audit log
  const { data: church } = await supabase
    .from('churches')
    .select('name')
    .eq('id', id)
    .single()

  // Delete the church
  const { error } = await supabase
    .from('churches')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Failed to delete church:', error)
    throw new Error('Failed to delete church')
  }

  // Log the action
  const { error: auditError } = await supabase
    .from('audit_logs')
    .insert({
      type: 'church_deleted',
      description: `Deleted church "${church?.name}"`,
      user_id: user.id,
      resource_type: 'churches',
      resource_id: id,
      details: { church_name: church?.name }
    })

  if (auditError) {
    console.error('Failed to create audit log:', auditError)
  }

  revalidatePath('/superadmin/churches')
  redirect('/superadmin/churches')
} 