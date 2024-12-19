import { DatabaseRole } from '@/auth/types'
import { UserRole, UserRoles } from '@/auth/types'

export const RoleHierarchy: Record<UserRole, number> = {
  [UserRoles.SUPER_ADMIN]: 100,
  [UserRoles.CHURCH_ADMIN]: 80,
  [UserRoles.STAFF]: 60,
  [UserRoles.GROUP_LEADER]: 40,
  [UserRoles.MEMBER]: 20,
  [UserRoles.VISITOR]: 10,
}

export interface RolePermissions {
  canManageChurch: boolean
  canManageGroups: boolean
  canManageMembers: boolean
  canCreateEvents: boolean
  canEditEvents: boolean
  canViewMembers: boolean
  canJoinGroups: boolean
  canCreatePosts: boolean
}

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  [UserRoles.SUPER_ADMIN]: {
    canManageChurch: true,
    canManageGroups: true,
    canManageMembers: true,
    canCreateEvents: true,
    canEditEvents: true,
    canViewMembers: true,
    canJoinGroups: true,
    canCreatePosts: true,
  },
  [UserRoles.CHURCH_ADMIN]: {
    canManageChurch: true,
    canManageGroups: true,
    canManageMembers: true,
    canCreateEvents: true,
    canEditEvents: true,
    canViewMembers: true,
    canJoinGroups: true,
    canCreatePosts: true,
  },
  [UserRoles.STAFF]: {
    canManageChurch: false,
    canManageGroups: true,
    canManageMembers: false,
    canCreateEvents: true,
    canEditEvents: true,
    canViewMembers: true,
    canJoinGroups: true,
    canCreatePosts: true,
  },
  [UserRoles.GROUP_LEADER]: {
    canManageChurch: false,
    canManageGroups: false,
    canManageMembers: false,
    canCreateEvents: true,
    canEditEvents: true,
    canViewMembers: true,
    canJoinGroups: true,
    canCreatePosts: true,
  },
  [UserRoles.MEMBER]: {
    canManageChurch: false,
    canManageGroups: false,
    canManageMembers: false,
    canCreateEvents: false,
    canEditEvents: false,
    canViewMembers: true,
    canJoinGroups: true,
    canCreatePosts: false,
  },
  [UserRoles.VISITOR]: {
    canManageChurch: false,
    canManageGroups: false,
    canManageMembers: false,
    canCreateEvents: false,
    canEditEvents: false,
    canViewMembers: false,
    canJoinGroups: false,
    canCreatePosts: false,
  },
}

export function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
  return DEFAULT_ROLE_PERMISSIONS[role][permission]
}

export function canManageRole(userRole: UserRole, targetRole: UserRole): boolean {
  return RoleHierarchy[userRole] > RoleHierarchy[targetRole]
}

export function isValidRole(role: string): role is UserRole {
  return Object.values(UserRoles).includes(role as UserRole);
}

const roleMapping: Record<DatabaseRole, UserRole> = {
  superadmin: UserRoles.SUPER_ADMIN,
  churchadmin: UserRoles.CHURCH_ADMIN,
  staff: UserRoles.STAFF,
  groupleader: UserRoles.GROUP_LEADER,
  member: UserRoles.MEMBER,
  visitor: UserRoles.VISITOR,
}

export function mapDatabaseRole(role: string | null): UserRole {
  if (!role || !(role in roleMapping)) {
    return UserRoles.VISITOR; // Default role
  }
  return roleMapping[role as DatabaseRole];
}

export function mapToDatabaseRole(role: UserRole): DatabaseRole {
  // Remove underscores and convert to lowercase
  return role.toLowerCase().replace(/_/g, '') as DatabaseRole;
} 