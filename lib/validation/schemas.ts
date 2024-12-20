import { z } from 'zod';

// Base schemas for reusable validation patterns
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(5, 'Email must be at least 5 characters')
  .max(255, 'Email must be less than 255 characters');

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format. Please use E.164 format');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Church related schemas
export const churchSettingsSchema = z.object({
  features: z.array(z.string()),
  customization: z.object({
    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color format'),
    logo: z.string().url().nullable(),
  }),
});

export const createChurchSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  domain_name: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Domain can only contain lowercase letters, numbers, and hyphens')
    .min(3, 'Domain must be at least 3 characters')
    .max(63, 'Domain must be less than 63 characters'),
  timezone: z.enum(['America/New_York', 'America/Chicago', 'America/Los_Angeles', 'America/Phoenix']),
  settings: churchSettingsSchema,
  logo_url: z.string().url().nullable(),
  subscription_status: z.enum(['active', 'inactive', 'pending', 'cancelled']).default('pending'),
  stripe_customer_id: z.string().nullable(),
});

export const updateChurchSchema = createChurchSchema.partial();

// User profile schema
export const profileSchema = z.object({
  display_name: z.string().min(2, 'Display name must be at least 2 characters').max(50, 'Display name must be less than 50 characters'),
  email: emailSchema,
  phone_number: phoneSchema.optional(),
  role: z.enum(['superadmin', 'church_admin', 'staff', 'group_leader', 'member', 'visitor']),
  status: z.enum(['active', 'pending', 'inactive']),
  avatar_url: z.string().url().nullable(),
  church_id: z.string().uuid('Invalid church ID'),
});

// Event schema
export const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  start_date: z.date(),
  end_date: z.date(),
  location: z.string().max(255, 'Location must be less than 255 characters').optional(),
  capacity: z.number().int().positive().optional(),
  is_public: z.boolean(),
  church_id: z.string().uuid('Invalid church ID'),
  organizer_id: z.string().uuid('Invalid organizer ID'),
});

// Group schema
export const groupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  type: z.enum(['ministry', 'small_group', 'committee', 'other']),
  leader_id: z.string().uuid('Invalid leader ID'),
  church_id: z.string().uuid('Invalid church ID'),
  meeting_schedule: z.string().max(255, 'Meeting schedule must be less than 255 characters').optional(),
  is_active: z.boolean(),
});

// Billing related schemas
export const manageSubscriptionSchema = z.object({
  churchId: z.string().uuid('Invalid church ID'),
  planId: z.string(),
  action: z.enum(['upgrade', 'downgrade', 'cancel']),
});

export const refundPaymentSchema = z.object({
  churchId: z.string().uuid('Invalid church ID'),
  paymentId: z.string(),
  amount: z.number().positive().optional(), // Optional for partial refunds
});

// Auth related schemas
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  churchId: z.string().uuid('Invalid church ID').optional(),
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
  callbackUrl: z.string().url().optional(),
});

// Export TypeScript types
export type Church = z.infer<typeof createChurchSchema>;
export type ChurchUpdate = z.infer<typeof updateChurchSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Event = z.infer<typeof eventSchema>;
export type Group = z.infer<typeof groupSchema>;
export type ManageSubscription = z.infer<typeof manageSubscriptionSchema>;
export type RefundPayment = z.infer<typeof refundPaymentSchema>;
export type SignUpData = z.infer<typeof signUpSchema>;
export type SignInData = z.infer<typeof signInSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>; 