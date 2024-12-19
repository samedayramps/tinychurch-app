'use client'

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, AlertCircle, CheckCircle2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/database.types";
import { exportDebugData } from "../actions";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Profile = Database['public']['Tables']['profiles']['Row'];

interface DebugInfo {
  sessionUserId: string | null;
  userChurchId: string | null;
  userRole: string | null;
  relationships: {
    profileToChurch: string;
    profileToAuditLogs: number;
    churchMembers: number;
    totalChurches: number;
    accessibleChurches: string;
  };
  permissions: {
    canAccessChurch: boolean;
    currentRole: string | null;
    isGlobalAdmin: boolean;
    capabilities: {
      canManageChurches: boolean;
      canManageUsers: boolean;
      canAccessAllData: boolean;
      canManageRoles: boolean;
    };
  };
}

interface DebugInfoCardProps {
  user: User;
  profile: Profile & { church: Database['public']['Tables']['churches']['Row'] | null };
  debugInfo: DebugInfo;
}

function StatusBadge({ status }: { status: boolean | string }) {
  const isActive = status === true || status === 'Connected' || status === 'Authenticated';
  return (
    <Badge variant={isActive ? "success" : "secondary"} className="ml-2">
      {isActive ? (
        <CheckCircle2 className="w-3 h-3 mr-1" />
      ) : (
        <AlertCircle className="w-3 h-3 mr-1" />
      )}
      {typeof status === 'boolean' ? (status ? 'Yes' : 'No') : status}
    </Badge>
  );
}

export function DebugInfoCard({ user, profile, debugInfo }: DebugInfoCardProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const data = await exportDebugData(user.id);
      
      // Create and download file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `debug-export-${new Date().toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Debug Information</CardTitle>
            <CardDescription>System diagnostics and permissions</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export Debug Data'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {/* Authentication Status */}
          <div>
            <h3 className="font-medium mb-2">Authentication & Identity</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">User ID</span>
                <span className="font-mono">{debugInfo.sessionUserId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Role</span>
                <Badge variant={debugInfo.permissions.isGlobalAdmin ? "destructive" : "default"}>
                  {debugInfo.userRole}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Church Association</span>
                <StatusBadge status={debugInfo.relationships.profileToChurch} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Permissions & Capabilities */}
          <div>
            <h3 className="font-medium mb-2">Permissions & Access</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Global Admin</span>
                <StatusBadge status={debugInfo.permissions.isGlobalAdmin} />
              </div>
              {Object.entries(debugInfo.permissions.capabilities).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <StatusBadge status={value} />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Relationships & Metrics */}
          <div>
            <h3 className="font-medium mb-2">System Metrics</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Churches</span>
                <span>{debugInfo.relationships.totalChurches}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Accessible Churches</span>
                <span>{debugInfo.relationships.accessibleChurches}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Audit Log Entries</span>
                <span>{debugInfo.relationships.profileToAuditLogs}</span>
              </div>
            </div>
          </div>

          {/* Raw Data Sections */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm text-muted-foreground mb-2">Auth User</div>
              <pre className="text-xs font-mono p-3 rounded bg-muted overflow-auto max-h-48">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Profile & Church</div>
              <pre className="text-xs font-mono p-3 rounded bg-muted overflow-auto max-h-48">
                {JSON.stringify(profile, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 