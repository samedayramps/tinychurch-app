import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'

// Types for subscription data
type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete'

interface Subscription {
  id: string
  churchId: string
  churchName: string
  status: SubscriptionStatus
  plan: string
  amount: number
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
}

// Mock data - replace with actual data fetching
const subscriptions: Subscription[] = [
  {
    id: 'sub_1234',
    churchId: 'church_1',
    churchName: 'First Baptist Church',
    status: 'active',
    plan: 'Professional',
    amount: 4900,
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cancelAtPeriodEnd: false,
  },
  // Add more mock subscriptions as needed
]

function getStatusColor(status: SubscriptionStatus): string {
  switch (status) {
    case 'active':
      return 'bg-green-500'
    case 'trialing':
      return 'bg-blue-500'
    case 'past_due':
      return 'bg-yellow-500'
    case 'canceled':
      return 'bg-red-500'
    case 'incomplete':
      return 'bg-gray-500'
    default:
      return 'bg-gray-500'
  }
}

export function SubscriptionList() {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Church</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Next Payment</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((subscription) => (
            <TableRow key={subscription.id}>
              <TableCell className="font-medium">{subscription.churchName}</TableCell>
              <TableCell>{subscription.plan}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={getStatusColor(subscription.status)}
                >
                  {subscription.status}
                </Badge>
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(subscription.currentPeriodEnd), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell>${(subscription.amount / 100).toFixed(2)}/mo</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <Link href={`/superadmin/billing/${subscription.churchId}`}>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 