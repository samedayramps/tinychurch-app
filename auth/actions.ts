'use server'

import { createClient } from "@/utils/supabase/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { encodedRedirect } from "@/utils/utils"
import { mapToDatabaseRole } from '@/auth/roles'
import { UserRoles } from '@/auth/types'
import { AuthError } from './errors'

export async function signUpAction(formData: FormData) {
  const email = formData.get("email")?.toString()
  const password = formData.get("password")?.toString()
  const churchId = formData.get("churchId")?.toString()
  const supabase = await createClient()
  const origin = (await headers()).get("origin")

  if (!email || !password) {
    return encodedRedirect("error", "/sign-up", "Email and password are required")
  }

  const { data: { user }, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return encodedRedirect("error", "/sign-up", error.message)
  }

  if (user) {
    const defaultRole = churchId ? UserRoles.MEMBER : UserRoles.SUPER_ADMIN
    const dbRole = mapToDatabaseRole(defaultRole)

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        email: user.email,
        church_id: churchId,
        role: dbRole,
        status: 'active'
      })

    if (profileError) {
      return encodedRedirect("error", "/sign-up", "Failed to create profile")
    }
  }

  return encodedRedirect(
    "success",
    "/sign-up",
    "Check your email to confirm your account"
  )
}

export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message)
  }

  return redirect("/protected")
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect("/sign-in")
}

export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get("email")?.toString()
  const supabase = await createClient()
  const origin = (await headers()).get("origin")
  const callbackUrl = formData.get("callbackUrl")?.toString()

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required")
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  })

  if (error) {
    console.error(error.message)
    return encodedRedirect("error", "/forgot-password", "Could not reset password")
  }

  if (callbackUrl) {
    return redirect(callbackUrl)
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password."
  )
}

export async function resetPasswordAction(formData: FormData) {
  const supabase = await createClient()

  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!password || !confirmPassword) {
    return encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required"
    )
  }

  if (password !== confirmPassword) {
    return encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match"
    )
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    return encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed"
    )
  }

  return encodedRedirect("success", "/protected/reset-password", "Password updated")
} 