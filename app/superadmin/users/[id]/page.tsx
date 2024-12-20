import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { verifySession } from '@/auth/dal'
import { UserRoles } from '@/auth/types'
import { getUserDetails } from '../actions'
import { UserRoleForm } from '../components/UserRoleForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import type { Database } from '@/database.types'
import { AuthError } from '@/auth/errors'
import { SuperAdminBreadcrumb } from '../../../../components/superadmin-breadcrumb'

type AuditLog = Database['public']['Tables']['audit_logs']['Row'] & {
  user: Pick<Database['public']['Tables']['profiles']['Row'], 'user_id' | 'display_name' | 'email'> | null
}

type ProfileWithRelations = Database['public']['Tables']['profiles']['Row'] & {
  church: Database['public']['Tables']['churches']['Row'] | null
  audit_logs: AuditLog[]
}

interface UserDetailsPageProps {
  params: Promise<{ id: string }>
}

async function UserDetailsWrapper({ userId }: { userId: string }) {
  try {
    const user = await verifySession()
    const profile = await getUserDetails(userId)

    if (!profile) {
      notFound()
    }

    return (
      <div className="space-y-6">
        <SuperAdminBreadcrumb
          items={[
            { label: 'Users', href: '/superadmin/users' },
            { label: profile.display_name || profile.email || 'User Details' }
          ]}
        />

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
            <CardDescription>Basic information about the user</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                <dd className="text-sm font-semibold">{profile.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Display Name</dt>
                <dd className="text-sm font-semibold">{profile.display_name || 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Church</dt>
                <dd className="text-sm font-semibold">{profile.church?.name || 'Not assigned'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                <dd>
                  <Badge 
                    variant={profile.status === 'active' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {profile.status || 'inactive'}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Last Active</dt>
                <dd className="text-sm">
                  {profile.last_active_at
                    ? formatDistanceToNow(new Date(profile.last_active_at), { addSuffix: true })
                    : 'Never'}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Role Management */}
        {(user.role === UserRoles.SUPER_ADMIN || user.role === UserRoles.CHURCH_ADMIN) && (
          <UserRoleForm
            userId={profile.user_id!}
            currentRole={profile.role}
            churchId={profile.church_id!}
            userEmail={profile.email!}
          />
        )}

        {/* Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>Recent activity for this user</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.audit_logs?.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">{log.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {log.created_at 
                        ? formatDistanceToNow(new Date(log.created_at), { addSuffix: true })
                        : 'Unknown time'}
                    </p>
                  </div>
                  {log.changes && (
                    <Badge variant="outline">
                      {JSON.stringify(log.changes)}
                    </Badge>
                  )}
                </div>
              ))}
              {(!profile.audit_logs || profile.audit_logs.length === 0) && (
                <p className="text-sm text-muted-foreground">No activity recorded</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    if (error instanceof AuthError) {
      throw new Error('Unauthorized')
    }
    throw error
  }
}

export default async function UserDetailsPage({ params }: UserDetailsPageProps) {
  try {
    const user = await verifySession()

    // Only superadmins and church admins can access this page
    if (user.role !== UserRoles.SUPER_ADMIN && user.role !== UserRoles.CHURCH_ADMIN) {
      throw new Error('Unauthorized')
    }

    const { id: userId } = await params

    return (
      <div className="space-y-6">
        <Suspense
          fallback={
            <div className="space-y-6">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[300px] w-full" />
              <Skeleton className="h-[200px] w-full" />
            </div>
          }
        >
          <UserDetailsWrapper userId={userId} />
        </Suspense>
      </div>
    )
  } catch (error) {
    console.error('Error in UserDetailsPage:', error)
    throw error
  }
} 