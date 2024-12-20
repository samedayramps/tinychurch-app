'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, UserCog } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { UserRoles } from '@/auth/types'
import { updateUserRole, updateUserStatus } from '../actions'
import { toast } from 'sonner'

interface UserListProps {
  users: any[]
  currentUserRole: string
  currentUserChurchId?: string
}

export function UserList({ users, currentUserRole, currentUserChurchId }: UserListProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleRoleUpdate = async (userId: string, role: string) => {
    try {
      setIsUpdating(true)
      await updateUserRole(userId, role, currentUserChurchId)
      toast.success('User role updated successfully')
    } catch (error) {
      toast.error('Failed to update user role')
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleStatusUpdate = async (userId: string, status: 'active' | 'inactive') => {
    try {
      setIsUpdating(true)
      await updateUserStatus(userId, status, currentUserChurchId)
      toast.success('User status updated successfully')
    } catch (error) {
      toast.error('Failed to update user status')
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  const canManageUsers = currentUserRole === UserRoles.SUPER_ADMIN || 
                        currentUserRole === UserRoles.CHURCH_ADMIN

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Church</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="font-medium">{user.display_name || user.email}</div>
                  {user.email && (
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>{user.church?.name || 'N/A'}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={user.status === 'active' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {user.status || 'inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                {user.last_active_at
                  ? formatDistanceToNow(new Date(user.last_active_at), { addSuffix: true })
                  : 'Never'}
              </TableCell>
              <TableCell>
                {canManageUsers && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={isUpdating}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/superadmin/users/${user.user_id}`)}
                      >
                        <UserCog className="mr-2 h-4 w-4" />
                        Manage User
                      </DropdownMenuItem>
                      {Object.values(UserRoles).map((role) => (
                        <DropdownMenuItem
                          key={role}
                          onClick={() => handleRoleUpdate(user.user_id, role)}
                          disabled={isUpdating || user.role === role}
                        >
                          Set as {role}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate(
                          user.user_id,
                          user.status === 'active' ? 'inactive' : 'active'
                        )}
                        disabled={isUpdating}
                      >
                        {user.status === 'active' ? 'Deactivate' : 'Activate'} User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 