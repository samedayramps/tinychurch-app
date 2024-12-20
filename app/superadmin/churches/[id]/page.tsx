import { createClient } from '@/utils/supabase/server'
import { ChurchForm } from '../components/ChurchForm'
import { notFound } from 'next/navigation'
import { SuperAdminBreadcrumb } from '../../../../components/superadmin-breadcrumb'
import { PageHeader } from '../../../../components/ui/page-header'

interface ChurchDetailsPageProps {
  params: Promise<{ id: string }>
}

async function getChurch(id: string) {
  const supabase = await createClient()
  const { data: church, error } = await supabase
    .from('churches')
    .select(`
      *,
      profiles: profiles(count)
    `)
    .eq('id', id)
    .single()

  if (error || !church) {
    return null
  }

  return church
}

export async function generateMetadata({ params }: ChurchDetailsPageProps) {
  const { id } = await params
  const church = await getChurch(id)
  
  if (!church) {
    return {
      title: 'Church Not Found | TinyChurch Admin',
    }
  }

  return {
    title: `${church.name} | TinyChurch Admin`,
    description: `Manage ${church.name} settings and configuration.`,
  }
}

export default async function ChurchDetailsPage({ params }: ChurchDetailsPageProps) {
  const { id } = await params
  const church = await getChurch(id)

  if (!church) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <SuperAdminBreadcrumb
        items={[
          { label: 'Churches', href: '/superadmin/churches' },
          { label: church.name }
        ]}
      />

      <div className="max-w-2xl mx-auto">
        <PageHeader
          heading="Edit Church"
          description={`Update church settings and configuration for ${church.name}.`}
        />

        <div className="space-y-6">
          <div className="p-4 bg-muted rounded-lg mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Members</p>
                <p className="font-medium">{church.profiles?.[0]?.count || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{church.subscription_status}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium">
                  {new Date(church.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {new Date(church.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <ChurchForm church={church} />
        </div>
      </div>
    </div>
  )
} 