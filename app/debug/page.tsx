import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { InfoBanner } from "./components/info-banner";
import { AuditTrailCard } from "./components/audit-trail-card";
import { DebugInfoCard } from "./components/debug-info-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataExplorerCard } from "./components/data-explorer-card";
import type { Database } from "@/database.types";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { DEFAULT_ROLE_PERMISSIONS, mapDatabaseRole } from '@/auth/roles';
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "@/components/role-badge";

type TableData = {
  [K in keyof Database['public']['Tables']]: Database['public']['Tables'][K]['Row'][];
};

function calculateAccountAge(createdAt: string | null): { value: number; unit: string } {
  if (!createdAt) {
    return { value: 0, unit: 'days' };
  }

  try {
    const ageInDays = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (ageInDays < 1) {
      return { 
        value: Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60)),
        unit: 'hours'
      };
    }

    if (ageInDays > 365) {
      return { 
        value: Math.floor(ageInDays / 365),
        unit: 'years'
      };
    }

    if (ageInDays > 30) {
      return { 
        value: Math.floor(ageInDays / 30),
        unit: 'months'
      };
    }

    return { value: ageInDays, unit: 'days' };
  } catch (error) {
    console.error('Error calculating account age:', error);
    return { value: 0, unit: 'days' };
  }
}

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch all accessible data with proper typing
  const [
    { data: profilesData },
    { data: churchesData },
    { data: auditLogsData },
    // Add function calls
    { data: sessionUserId },
    { data: userChurchId },
    { data: userRole },
  ] = await Promise.all([
    supabase.from('profiles').select('*'),
    supabase.from('churches').select('*'),
    supabase.from('audit_logs').select('*'),
    // Call Supabase functions
    supabase.rpc('get_session_user_id'),
    supabase.rpc('get_user_church_id'),
    supabase.rpc('get_user_role'),
  ]);

  // Fetch the user's profile with all relationships
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      church:churches(
        id,
        name,
        domain_name,
        subscription_status,
        timezone,
        settings,
        logo_url,
        stripe_customer_id,
        created_at,
        updated_at
      ),
      audit_logs(
        id,
        action,
        table_name,
        record_id,
        changes,
        church_id,
        user_id,
        created_at
      )
    `)
    .eq('user_id', user.id)
    .single();

  // Get recent audit logs with full relationship data
  const { data: recentAudits } = await supabase
    .from('audit_logs')
    .select(`
      *,
      church:churches(
        id,
        name
      ),
      profile:profiles(
        id,
        display_name,
        email
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Create properly typed data object with relationships
  const accessibleData: Partial<TableData> = {
    profiles: profilesData || [],
    churches: churchesData || [],
    audit_logs: auditLogsData || [],
  };

  // Map the database role to our application role
  const appRole = mapDatabaseRole(userRole);

  // Get permissions from our role system
  const rolePermissions = DEFAULT_ROLE_PERMISSIONS[appRole];

  const debugInfo = {
    sessionUserId,
    userChurchId,
    userRole,
    relationships: {
      profileToChurch: profile?.church_id ? 'Connected' : 'Not Connected',
      profileToAuditLogs: auditLogsData?.length || 0,
      churchMembers: profilesData?.filter(p => p.church_id === profile?.church_id).length || 0,
      totalChurches: churchesData?.length || 0,
      accessibleChurches: userRole === 'superadmin' ? 'All' : (userChurchId ? '1' : '0'),
    },
    permissions: {
      canAccessChurch: Boolean(userChurchId),
      currentRole: userRole,
      isGlobalAdmin: userRole === 'superadmin',
      capabilities: {
        canManageChurches: rolePermissions.canManageChurch,
        canManageUsers: rolePermissions.canManageMembers,
        canAccessAllData: rolePermissions.canManageChurch && rolePermissions.canViewMembers,
        canManageRoles: rolePermissions.canManageChurch,
      }
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">System Overview</h2>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
            <TabsTrigger value="data">Data Explorer</TabsTrigger>
            <TabsTrigger value="relationships">Relationships</TabsTrigger>
            <TabsTrigger value="debug">Debug</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <InfoBanner />
            
            {/* Authentication Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* User Authentication Card */}
              <Card className="md:col-span-2 lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Authentication</CardTitle>
                  <CardDescription>Current session and identity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Session Status</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>Authenticated</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">User ID</div>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {user.id}
                    </code>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div>{user.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Last Sign In</div>
                    <div>{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Email Confirmed</div>
                    <div>{user.email_confirmed_at ? new Date(user.email_confirmed_at).toLocaleString() : 'Not confirmed'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Last Updated</div>
                    <div>{user.updated_at ? new Date(user.updated_at).toLocaleString() : 'Never'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Created</div>
                    <div>{user.created_at ? new Date(user.created_at).toLocaleString() : 'Never'}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Authorization Card */}
              <Card className="md:col-span-2 lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Authorization</CardTitle>
                  <CardDescription>Access control and permissions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Role</div>
                    <div className="flex items-center gap-2 mt-1">
                      <RoleBadge role={appRole} />
                      {userRole === 'superadmin' && (
                        <Badge variant="destructive" className="text-xs">Global Access</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Key Permissions</div>
                    <div className="grid gap-2 mt-1">
                      {Object.entries(rolePermissions).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 text-sm">
                          <div className={`h-2 w-2 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Multi-tenancy Card */}
              <Card className="md:col-span-2 lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Multi-tenancy</CardTitle>
                  <CardDescription>Church and data isolation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Church Association</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`h-2 w-2 rounded-full ${profile?.church ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      <span>{profile?.church ? 'Connected' : 'No Church'}</span>
                    </div>
                  </div>
                  {profile?.church && (
                    <>
                      <div>
                        <div className="text-sm text-muted-foreground">Church Name</div>
                        <div>{profile.church.name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Subscription</div>
                        <Badge variant={
                          profile.church.subscription_status === 'active' ? 'default' : 'secondary'
                        }>
                          {profile.church.subscription_status || 'No Subscription'}
                        </Badge>
                      </div>
                    </>
                  )}
                  <div>
                    <div className="text-sm text-muted-foreground">Data Access</div>
                    <div className="text-sm mt-1">
                      {userRole === 'superadmin' 
                        ? 'Full access to all churches'
                        : `Limited to ${profile?.church?.name || 'no'} church data`
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Churches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{churchesData?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {userRole === 'superadmin' ? 'Full access' : 'Visible churches'}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Church Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {profilesData?.filter(p => p.church_id === profile?.church_id).length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">In your church</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Audit Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{auditLogsData?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">Total entries</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Account Age</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {calculateAccountAge(profile?.created_at || user.created_at).value}
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">
                    {calculateAccountAge(profile?.created_at || user.created_at).unit}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <AuditTrailCard audits={recentAudits || []} />
          </TabsContent>

          <TabsContent value="data">
            <DataExplorerCard data={accessibleData} />
          </TabsContent>

          <TabsContent value="relationships">
            <Card>
              <CardHeader>
                <CardTitle>Database Relationships</CardTitle>
                <CardDescription>Overview of connected data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Profile → Church</h3>
                    <p className="text-sm text-muted-foreground">
                      {debugInfo.relationships.profileToChurch}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Profile → Audit Logs</h3>
                    <p className="text-sm text-muted-foreground">
                      {debugInfo.relationships.profileToAuditLogs} logs found
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Church Members</h3>
                    <p className="text-sm text-muted-foreground">
                      {debugInfo.relationships.churchMembers} members in your church
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="debug">
            <DebugInfoCard 
              user={user} 
              profile={profile!}
              debugInfo={debugInfo}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
