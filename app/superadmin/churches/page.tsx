import { Suspense } from 'react'
import { ChurchList } from './components/ChurchList'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { SuperAdminBreadcrumb } from '../../../components/superadmin-breadcrumb'
import { PageHeader } from '@/components/ui/page-header'

export const metadata = {
  title: 'Churches | TinyChurch Admin',
  description: 'Manage all churches in the TinyChurch platform.',
}

export default async function ChurchesPage() {
  return (
    <div className="space-y-6">
      <SuperAdminBreadcrumb
        items={[
          { label: 'Churches', href: '/superadmin/churches' }
        ]}
      />

      <PageHeader
        heading="Churches"
        description="Manage all churches in the TinyChurch platform"
      />

      <div className="flex justify-between items-center">
        <Link href="/superadmin/churches/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Church
          </Button>
        </Link>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <ChurchList />
      </Suspense>
    </div>
  )
} 