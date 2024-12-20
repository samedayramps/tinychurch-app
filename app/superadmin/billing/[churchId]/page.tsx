import { notFound } from 'next/navigation'
import { PaymentHistory } from '../components/payment-history'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SuperAdminBreadcrumb } from '../../../../components/superadmin-breadcrumb'

interface ChurchBillingPageProps {
  params: Promise<{ churchId: string }>
}

// Mock data - replace with actual data fetching
const mockChurchData = {
  id: 'church_1',
  name: 'First Baptist Church',
  subscription: {
    id: 'sub_1234',
    status: 'active' as const,
    plan: 'Professional',
    amount: 4900,
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cancelAtPeriodEnd: false,
  },
}

export default async function ChurchBillingPage({ params }: ChurchBillingPageProps) {
  const { churchId } = await params

  // In a real implementation, fetch the church and subscription data
  const churchData = mockChurchData

  if (!churchData) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <SuperAdminBreadcrumb
        items={[
          { label: 'Billing', href: '/superadmin/billing' },
          { label: churchData.name }
        ]}
      />
      
      <PageHeader
        heading={`${churchData.name} - Billing`}
        description="Manage subscription and view payment history"
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
            <CardDescription>Current plan and billing information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Current Plan</p>
                <p className="text-2xl font-bold">{churchData.subscription.plan}</p>
              </div>
              <Badge variant="secondary" className="bg-green-500">
                {churchData.subscription.status}
              </Badge>
            </div>

            <div>
              <p className="text-sm font-medium">Monthly Amount</p>
              <p className="text-2xl font-bold">
                ${(churchData.subscription.amount / 100).toFixed(2)}/mo
              </p>
            </div>

            <div className="pt-4 flex gap-4">
              <Button>Change Plan</Button>
              <Button variant="outline">Cancel Subscription</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Recent transactions and invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentHistory churchId={churchId} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 