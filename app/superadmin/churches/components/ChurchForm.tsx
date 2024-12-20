'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createChurch, updateChurch } from '../actions'
import type { Database } from '@/database.types'

type Church = Database['public']['Tables']['churches']['Insert']

type ChurchCustomization = {
  primary_color: string | null
  logo: string | null
}

type ChurchFormSettings = {
  features: string[] | null
  customization: ChurchCustomization | null
}

const SUBSCRIPTION_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'cancelled', label: 'Cancelled' },
] as const

const US_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Phoenix', label: 'Mountain Time - Arizona (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
] as const

const customizationSchema = z.object({
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, {
    message: 'Must be a valid hex color (e.g., #000000)',
  }).nullable(),
  logo: z.string().url().nullable(),
}).nullable()

const settingsSchema = z.object({
  features: z.array(z.string()).nullable(),
  customization: customizationSchema,
}).nullable()

const churchSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  domain_name: z.string().min(3).regex(/^[a-z0-9-]+$/, {
    message: 'Domain can only contain lowercase letters, numbers, and hyphens',
  }).nullable(),
  logo_url: z.string().url().nullable().optional(),
  timezone: z.enum(['America/New_York', 'America/Chicago', 'America/Denver', 'America/Phoenix', 'America/Los_Angeles'], {
    required_error: "Please select a timezone",
  }).nullable(),
  settings: settingsSchema,
  stripe_customer_id: z.string().nullable().optional(),
  subscription_status: z.enum([
    'pending',
    'active',
    'suspended',
    'cancelled'
  ]).nullable(),
}) satisfies z.ZodType<Omit<Church, 'created_at' | 'updated_at' | 'id'>>

type ChurchFormData = z.infer<typeof churchSchema>

interface ChurchFormProps {
  church?: Database['public']['Tables']['churches']['Row']
}

const defaultSettings: ChurchFormSettings = {
  features: [],
  customization: {
    primary_color: '#000000',
    logo: null,
  },
}

export function ChurchForm({ church }: ChurchFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ChurchFormData>({
    resolver: zodResolver(churchSchema),
    defaultValues: {
      name: church?.name ?? '',
      domain_name: church?.domain_name,
      logo_url: church?.logo_url,
      timezone: (church?.timezone as ChurchFormData['timezone']) ?? 'America/New_York',
      settings: (church?.settings as ChurchFormSettings) ?? defaultSettings,
      stripe_customer_id: church?.stripe_customer_id,
      subscription_status: (church?.subscription_status as ChurchFormData['subscription_status']) ?? 'pending',
    },
  })

  async function onSubmit(data: ChurchFormData) {
    try {
      setIsLoading(true)
      if (church) {
        await updateChurch(church.id, data)
      } else {
        await createChurch(data)
      }
      router.push('/superadmin/churches')
      router.refresh()
    } catch (error) {
      console.error('Failed to save church:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Church Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter church name" {...field} />
              </FormControl>
              <FormDescription>
                The official name of the church.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="domain_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Domain Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="church-domain" 
                  {...field} 
                  value={field.value || ''} 
                  onChange={e => field.onChange(e.target.value || null)}
                />
              </FormControl>
              <FormDescription>
                This will be used for the church's URL: church-domain.tinychurch.app
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="logo_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Church Logo</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com/logo.png" 
                  type="url"
                  {...field}
                  value={field.value || ''} 
                  onChange={e => field.onChange(e.target.value || null)}
                />
              </FormControl>
              <FormDescription>
                URL to the church's logo image. This will be used throughout the application.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timezone</FormLabel>
              <Select 
                onValueChange={value => field.onChange(value || null)} 
                defaultValue={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a timezone" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {US_TIMEZONES.map((timezone) => (
                    <SelectItem key={timezone.value} value={timezone.value}>
                      {timezone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                The church's primary timezone. All event times will be displayed in this timezone.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subscription_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subscription Status</FormLabel>
              <Select 
                onValueChange={value => field.onChange(value as ChurchFormData['subscription_status'])} 
                defaultValue={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SUBSCRIPTION_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                The church's subscription status.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="settings.customization.primary_color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Color</FormLabel>
              <FormControl>
                <div className="flex gap-2 items-center">
                  <Input 
                    type="color"
                    className="w-12 h-12 p-1"
                    {...field}
                    value={field.value || '#000000'}
                  />
                  <Input 
                    type="text"
                    placeholder="#000000"
                    className="font-mono"
                    {...field}
                    value={field.value || '#000000'}
                  />
                </div>
              </FormControl>
              <FormDescription>
                The church's primary brand color in hex format.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : church ? 'Update Church' : 'Create Church'}
        </Button>
      </form>
    </Form>
  )
}