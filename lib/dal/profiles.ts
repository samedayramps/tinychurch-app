import { createDAL } from './base'
import type { TableRow } from './types'

const profileDAL = createDAL('profiles')

export type Profile = TableRow<'profiles'>

export const profiles = {
  ...profileDAL,
  
  async findByUserId(userId: string) {
    return profileDAL.findMany({
      filters: [
        { column: 'user_id', operator: 'eq', value: userId }
      ],
      limit: 1
    }).then(({ data, error }) => ({
      data: data?.[0] || null,
      error
    }))
  },
  
  async findByChurch(churchId: string) {
    return profileDAL.findMany({
      filters: [
        { column: 'church_id', operator: 'eq', value: churchId }
      ],
      orderBy: {
        column: 'display_name',
        ascending: true
      }
    })
  },
  
  async findByRole(churchId: string, role: string) {
    return profileDAL.findMany({
      filters: [
        { column: 'church_id', operator: 'eq', value: churchId },
        { column: 'role', operator: 'eq', value: role }
      ]
    })
  },
  
  async updateLastActive(userId: string) {
    return profileDAL.update(userId, {
      last_active_at: new Date().toISOString()
    })
  }
} 