import { AuthUser, UserRole, UserRoles } from '@/auth/types'
import { RoleHierarchy } from './roles'

export function canAccessChurch(user: AuthUser | null, churchId: string) {
  if (!user) return false
  if (user.role === UserRoles.SUPER_ADMIN) return true
  return user.churchId === churchId
}

export function hasRole(user: AuthUser | null, allowedRoles: UserRole[]) {
  if (!user?.role) return false
  return allowedRoles.includes(user.role)
}

export function isChurchAdmin(user: AuthUser | null, churchId: string) {
  if (!user) return false
  if (user.role === UserRoles.SUPER_ADMIN) return true
  return user.role === UserRoles.CHURCH_ADMIN && user.churchId === churchId
}

export function canManageUsers(user: AuthUser | null, targetUser: AuthUser) {
  if (!user?.role || !targetUser.role) return false
  return RoleHierarchy[user.role] > RoleHierarchy[targetUser.role]
}

export function isGroupLeader(user: AuthUser | null, groupId: string) {
  if (!user) return false
  if (user.role === UserRoles.SUPER_ADMIN) return true
  if (user.role === UserRoles.CHURCH_ADMIN) return true
  // You'll need to implement group leadership check here
  // This would typically involve checking a groups table
  return user.role === UserRoles.GROUP_LEADER // && isLeaderOfGroup(user.id, groupId)
} 