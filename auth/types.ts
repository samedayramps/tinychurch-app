export const UserRoles = {
  SUPER_ADMIN: 'superadmin',
  CHURCH_ADMIN: 'churchadmin',
  STAFF: 'staff',
  GROUP_LEADER: 'groupleader',
  MEMBER: 'member',
  VISITOR: 'visitor'
} as const

export type UserRole = typeof UserRoles[keyof typeof UserRoles]

export interface AuthUser {
  id: string
  email: string
  churchId?: string
  role?: UserRole
  profile?: {
    displayName: string | null
    avatarUrl: string | null
  }
}

export const DatabaseRoles = {
  superadmin: 'superadmin',
  churchadmin: 'churchadmin',
  staff: 'staff',
  groupleader: 'groupleader',
  member: 'member',
  visitor: 'visitor'
} as const

export type DatabaseRole = typeof DatabaseRoles[keyof typeof DatabaseRoles]

export interface DatabaseProfile {
  user_id: string
  church_id: string | null
  role: DatabaseRole
  status: 'active' | 'pending' | 'inactive'
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
} 