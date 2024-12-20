import { redirect } from 'next/navigation'
import { verifySession } from '@/auth/dal'
import { UserRoles } from '@/auth/types'
import { SuperAdminNav } from '../../components/superadmin-nav'

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await verifySession()
  
  if (user.role !== UserRoles.SUPER_ADMIN) {
    redirect('/unauthorized')
  }

  return (
    <div className="flex min-h-screen">
      <SuperAdminNav />
      <main className="flex-1 p-6 bg-background">
        <div className="max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  )
} 