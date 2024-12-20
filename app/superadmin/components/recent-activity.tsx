import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'

async function getRecentActivity() {
  const supabase = await createClient()
  
  const { data: activities } = await supabase
    .from('audit_logs')
    .select(`
      *,
      profile:profiles(display_name, email),
      church:churches(name)
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  return activities || []
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'church_created':
      return '🏢'
    case 'user_created':
      return '👤'
    case 'user_updated':
      return '✏️'
    case 'payment_received':
      return '💰'
    default:
      return '📝'
  }
}

export async function RecentActivity() {
  const activities = await getRecentActivity()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-4 text-sm"
            >
              <span className="text-xl">
                {getActivityIcon(activity.type)}
              </span>
              <div className="flex-1 space-y-1">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {activity.profile?.display_name || activity.profile?.email}
                  </span>{' '}
                  {activity.description}
                  {activity.church && (
                    <span className="text-muted-foreground">
                      {' '}in {activity.church.name}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}

          {activities.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent activity
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 