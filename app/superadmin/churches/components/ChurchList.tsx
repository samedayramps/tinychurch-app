import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import { Building2, Users, Settings } from 'lucide-react'

async function getChurches() {
  const supabase = await createClient()
  const { data: churches, error } = await supabase
    .from('churches')
    .select(`
      *,
      profiles: profiles(count)
    `)
    .order('name')

  if (error) throw error
  return churches
}

export async function ChurchList() {
  const churches = await getChurches()

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Domain</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {churches.map((church) => (
            <TableRow key={church.id}>
              <TableCell className="font-medium">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span>{church.name}</span>
                </div>
              </TableCell>
              <TableCell>{church.domain_name}</TableCell>
              <TableCell>{church.profiles?.[0]?.count || 0}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  church.subscription_status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {church.subscription_status}
                </span>
              </TableCell>
              <TableCell>{formatDate(church.created_at)}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Link href={`/superadmin/churches/${church.id}/members`}>
                    <Button variant="ghost" size="icon">
                      <Users className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/superadmin/churches/${church.id}`}>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 