import { UserRole, UserRoles } from '@/auth/types'
import { Badge } from './ui/badge'
import { cn } from '@/lib/utils'

const ROLE_COLORS: Record<UserRole, string> = {
  [UserRoles.SUPER_ADMIN]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  [UserRoles.CHURCH_ADMIN]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  [UserRoles.STAFF]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  [UserRoles.GROUP_LEADER]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  [UserRoles.MEMBER]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  [UserRoles.VISITOR]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
}

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRoles.SUPER_ADMIN]: 'Super Admin',
  [UserRoles.CHURCH_ADMIN]: 'Church Admin',
  [UserRoles.STAFF]: 'Staff',
  [UserRoles.GROUP_LEADER]: 'Group Leader',
  [UserRoles.MEMBER]: 'Member',
  [UserRoles.VISITOR]: 'Visitor',
}

interface RoleBadgeProps {
  role: UserRole
  className?: string
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <Badge className={cn(ROLE_COLORS[role], className)}>
      {ROLE_LABELS[role]}
    </Badge>
  )
} 