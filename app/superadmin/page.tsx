import { Suspense } from 'react'
import { StatsOverview } from './components/stats-overview'
import { RecentActivity } from './components/recent-activity'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { SuperAdminBreadcrumb } from '../../components/superadmin-breadcrumb'

export const metadata = {
  title: 'Superadmin Dashboard | TinyChurch',
  description: 'TinyChurch superadmin dashboard for managing churches and users.',
}

export default async function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      <SuperAdminBreadcrumb
        items={[
          { label: 'Dashboard' }
        ]}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <StatsOverview />
      </Suspense>

      <Suspense fallback={<LoadingSpinner />}>
        <RecentActivity />
      </Suspense>
    </div>
  )
} 