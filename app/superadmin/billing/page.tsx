import { Metadata } from 'next'
import { SubscriptionList } from './components/subscription-list'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SuperAdminBreadcrumb } from '../../../components/superadmin-breadcrumb'

export const metadata: Metadata = {
  title: 'Billing Management',
  description: 'Manage church subscriptions and billing',
}

export default async function BillingPage() {
  return (
    <div className="space-y-6">
      <SuperAdminBreadcrumb
        items={[
          { label: 'Billing', href: '/superadmin/billing' }
        ]}
      />
      
      <PageHeader
        heading="Billing Management"
        description="Manage church subscriptions and payment history"
      />
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Subscriptions</CardTitle>
            <CardDescription>Overview of all active church subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <SubscriptionList />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Overview</CardTitle>
            <CardDescription>Monthly recurring revenue and statistics</CardDescription>
          </CardHeader>
          <CardContent>
            {/* We'll add billing stats here later */}
            <div className="text-sm text-muted-foreground">
              Coming soon: Revenue analytics and billing metrics
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 