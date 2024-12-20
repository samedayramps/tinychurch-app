import { ChurchForm } from '../components/ChurchForm'
import { SuperAdminBreadcrumb } from '../../../../components/superadmin-breadcrumb'

export const metadata = {
  title: 'Create Church | TinyChurch Admin',
  description: 'Create a new church in the TinyChurch platform.',
}

export default function CreateChurchPage() {
  return (
    <div className="space-y-6">
      <SuperAdminBreadcrumb
        items={[
          { label: 'Churches', href: '/superadmin/churches' },
          { label: 'Create Church' }
        ]}
      />

      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Create Church</h1>
          <p className="text-muted-foreground">
            Create a new church and configure its basic settings.
          </p>
        </div>

        <div className="space-y-6">
          <ChurchForm />
        </div>
      </div>
    </div>
  )
} 