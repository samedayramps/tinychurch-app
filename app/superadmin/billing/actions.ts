'use server'

import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Schema for subscription management
const manageSubscriptionSchema = z.object({
  churchId: z.string().uuid(),
  planId: z.string(),
  action: z.enum(['upgrade', 'downgrade', 'cancel']),
})

// Schema for payment refund
const refundPaymentSchema = z.object({
  churchId: z.string().uuid(),
  paymentId: z.string(),
  amount: z.number().optional(), // Optional for partial refunds
})

export async function getChurchSubscription(churchId: string) {
  const supabase = await createClient()

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('church_id', churchId)
    .single()

  if (error) {
    throw new Error('Failed to fetch subscription')
  }

  return subscription
}

export async function getPaymentHistory(churchId: string) {
  const supabase = await createClient()

  const { data: payments, error } = await supabase
    .from('payments')
    .select('*')
    .eq('church_id', churchId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    throw new Error('Failed to fetch payment history')
  }

  return payments
}

export async function manageSubscription(
  formData: z.infer<typeof manageSubscriptionSchema>
) {
  const { churchId, planId, action } = manageSubscriptionSchema.parse(formData)
  const supabase = await createClient()

  try {
    // In a real implementation:
    // 1. Update Stripe subscription
    // 2. Update database records
    // 3. Send notification emails
    
    // Mock implementation
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: action === 'cancel' ? 'canceled' : 'active',
        plan_id: planId,
        updated_at: new Date().toISOString(),
      })
      .eq('church_id', churchId)

    if (error) throw error

    revalidatePath(`/superadmin/billing/${churchId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to manage subscription:', error)
    throw new Error('Failed to update subscription')
  }
}

export async function refundPayment(
  formData: z.infer<typeof refundPaymentSchema>
) {
  const { churchId, paymentId, amount } = refundPaymentSchema.parse(formData)
  const supabase = await createClient()

  try {
    // In a real implementation:
    // 1. Process refund through Stripe
    // 2. Update payment records
    // 3. Send notification emails
    
    // Mock implementation
    const { error } = await supabase
      .from('payments')
      .update({
        status: 'refunded',
        refunded_amount: amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .eq('church_id', churchId)

    if (error) throw error

    revalidatePath(`/superadmin/billing/${churchId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to process refund:', error)
    throw new Error('Failed to process refund')
  }
} 