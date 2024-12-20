import { createDAL } from './base'
import type { TableRow } from './types'

const churchDAL = createDAL('churches')

export type Church = TableRow<'churches'>

export const churches = {
  ...churchDAL,
  
  async findByDomain(domain: string) {
    return churchDAL.findMany({
      filters: [
        { column: 'domain_name', operator: 'eq', value: domain }
      ],
      limit: 1
    }).then(({ data, error }) => ({
      data: data?.[0] || null,
      error
    }))
  },
  
  async findActive() {
    return churchDAL.findMany({
      filters: [
        { 
          column: 'subscription_status', 
          operator: 'in', 
          value: ['active', 'trial'] 
        }
      ],
      orderBy: {
        column: 'name',
        ascending: true
      }
    })
  },
  
  async updateSettings(
    id: string, 
    settings: Church['settings']
  ) {
    return churchDAL.update(id, { settings })
  }
} 