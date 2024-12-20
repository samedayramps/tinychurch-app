import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"
import { UserRoles } from "@/auth/types"
import { Logger } from '@/lib/logging'
import { LogCategory } from '@/lib/logging-types'

const PUBLIC_ROUTES = ['/sign-in', '/sign-up', '/forgot-password']
const PROTECTED_ROUTES = ['/protected', '/church']

// Simple role-based route mapping
const ROLE_ROUTES = {
  '/admin': [UserRoles.SUPER_ADMIN, UserRoles.CHURCH_ADMIN],
  '/staff': [UserRoles.SUPER_ADMIN, UserRoles.CHURCH_ADMIN, UserRoles.STAFF],
} as const

export async function middleware(request: NextRequest) {
  // Generate request ID if not present
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()
  const startTime = Date.now()

  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    // Add request ID to response headers
    response.headers.set('x-request-id', requestId)

    // Log the request
    await Logger.info('Incoming request', LogCategory.API, {
      method: request.method,
      url: request.url,
      requestId,
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser()
    const path = request.nextUrl.pathname

    // Handle public routes
    const isPublicRoute = PUBLIC_ROUTES.some(r => path.startsWith(r))
    if (isPublicRoute && user) {
      return NextResponse.redirect(new URL('/protected', request.url))
    }

    // Handle protected routes
    const isProtectedRoute = PROTECTED_ROUTES.some(r => path.startsWith(r))
    if (isProtectedRoute && (!user || error)) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    // Handle church-specific routes
    if (path.startsWith('/church/')) {
      const churchId = path.split('/')[2]
      const { data: profile } = await supabase
        .from('profiles')
        .select('church_id, role')
        .eq('user_id', user?.id)
        .single()

      // Check both church access and role requirements
      if (!profile) {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }

      const hasChurchAccess = profile.church_id === churchId || profile.role === 'super_admin'
      if (!hasChurchAccess) {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }

      // Check role-based route access
      for (const [routePath, allowedRoles] of Object.entries(ROLE_ROUTES)) {
        if (path.startsWith(routePath) && !allowedRoles.includes(profile.role)) {
          return NextResponse.redirect(new URL('/unauthorized', request.url))
        }
      }
    }

    // Calculate response time and log completion
    const responseTime = Date.now() - startTime
    await Logger.info('Request completed', LogCategory.API, {
      requestId,
      responseTime,
      status: response.status,
    })

    return response

  } catch (error) {
    // Log error and return default response
    const responseTime = Date.now() - startTime
    await Logger.error('Middleware error', LogCategory.API, {
      error,
      requestId,
      responseTime,
      url: request.url,
    })

    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
