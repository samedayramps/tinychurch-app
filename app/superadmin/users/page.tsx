import { Suspense } from 'react'
import { verifySession } from '@/auth/dal'
import { UserRoles } from '@/auth/types'
import { listUsers } from './actions'
import { UserList } from './components/UserList'
import { Skeleton } from '@/components/ui/skeleton'
import { SuperAdminBreadcrumb } from '../../../components/superadmin-breadcrumb'
import { PageHeader } from '@/components/ui/page-header'

export const metadata = {
  title: 'User Management',
  description: 'Manage users and their roles across the platform.',
}

async function UserListWrapper() {
  const user = await verifySession()
  const users = await listUsers(user.churchId)

  return (
    <UserList 
      users={users} 
      currentUserRole={user.role!} 
      currentUserChurchId={user.churchId}
    />
  )
}

export default async function UsersPage() {
  const user = await verifySession()

  // Only superadmins and church admins can access this page
  if (user.role !== UserRoles.SUPER_ADMIN && user.role !== UserRoles.CHURCH_ADMIN) {
    throw new Error('Unauthorized')
  }

  return (
    <div className="space-y-6">
      <SuperAdminBreadcrumb
        items={[
          { label: 'Users', href: '/superadmin/users' }
        ]}
      />

      <PageHeader
        heading="User Management"
        description={user.role === UserRoles.SUPER_ADMIN
          ? 'Manage users across all churches'
          : 'Manage users in your church'}
      />

      <Suspense 
        fallback={
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        }
      >
        <UserListWrapper />
      </Suspense>
    </div>
  )
} 