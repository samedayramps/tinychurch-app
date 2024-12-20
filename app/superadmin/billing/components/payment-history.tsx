import { format } from 'date-fns'
import { Download } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Payment {
  id: string
  amount: number
  status: 'succeeded' | 'failed' | 'refunded'
  date: string
  invoiceUrl?: string
}

interface PaymentHistoryProps {
  churchId: string
}

// Mock data - replace with actual data fetching
const mockPayments: Payment[] = [
  {
    id: 'pi_1234',
    amount: 4900,
    status: 'succeeded',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    invoiceUrl: '#',
  },
  {
    id: 'pi_5678',
    amount: 4900,
    status: 'succeeded',
    date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    invoiceUrl: '#',
  },
]

function getStatusColor(status: Payment['status']): string {
  switch (status) {
    case 'succeeded':
      return 'bg-green-500'
    case 'failed':
      return 'bg-red-500'
    case 'refunded':
      return 'bg-yellow-500'
    default:
      return 'bg-gray-500'
  }
}

export function PaymentHistory({ churchId }: PaymentHistoryProps) {
  // In a real implementation, fetch payment history based on churchId
  const payments = mockPayments

  if (payments.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-muted-foreground">
        No payment history available
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[100px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>
              {format(new Date(payment.date), 'MMM d, yyyy')}
            </TableCell>
            <TableCell>${(payment.amount / 100).toFixed(2)}</TableCell>
            <TableCell>
              <Badge
                variant="secondary"
                className={getStatusColor(payment.status)}
              >
                {payment.status}
              </Badge>
            </TableCell>
            <TableCell>
              {payment.invoiceUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  asChild
                >
                  <a href={payment.invoiceUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 