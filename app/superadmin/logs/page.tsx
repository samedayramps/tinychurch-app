'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SystemLogsView } from './components/logs/system-logs-view'
import { AuditLogsView } from './components/logs/audit-logs-view'
import { PageHeader } from '@/components/ui/page-header'
import { SuperAdminBreadcrumb } from '../../../components/superadmin-breadcrumb'

export default function SuperAdminLogsPage() {
  return (
    <div className="space-y-6">
      <SuperAdminBreadcrumb
        items={[
          { label: 'Logs & Activity', href: '/superadmin/logs' }
        ]}
      />

      <PageHeader
        heading="System Logs & Activity"
        description="View system-wide logs and audit trail across all churches"
      />
      
      <Tabs defaultValue="system" className="w-full">
        <TabsList>
          <TabsTrigger value="system">System Logs</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>
        
        <TabsContent value="system" className="mt-6">
          <SystemLogsView isSuperAdmin={true} />
        </TabsContent>
        
        <TabsContent value="audit" className="mt-6">
          <AuditLogsView isSuperAdmin={true} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 