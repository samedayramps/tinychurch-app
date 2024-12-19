'use server'

import { createClient } from "@/utils/supabase/server";
import type { Database } from "@/database.types";
import { headers } from "next/headers";

type ExportData = {
  timestamp: string;
  user: {
    id: string;
    email: string;
    lastSignIn: string;
  };
  profile: Database['public']['Tables']['profiles']['Row'] & {
    church: Database['public']['Tables']['churches']['Row'] | null;
  };
  auditLogs: Database['public']['Tables']['audit_logs']['Row'][];
  systemInfo: {
    userAgent: string;
    timestamp: string;
    environment: string;
    databaseVersion: string;
    databaseHealth: 'Connected' | 'Error';
    supabaseStatus: 'Authenticated' | 'Error';
  };
  debugInfo: {
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
  };
  superadminInfo?: {
    totalChurches: number;
    totalUsers: number | null;
    systemHealth: {
      databaseConnected: boolean;
      authServiceStatus: string;
      lastBackup: string;
    };
  };
}

function isSuperAdmin(role: string | null): boolean {
  return role === 'superadmin';
}

export async function exportDebugData(userId: string): Promise<ExportData> {
  const supabase = await createClient();
  const headersList = await headers();
  
  // Get user data
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not found');

  // Get profile with church details
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      church:churches(*)
    `)
    .eq('user_id', userId)
    .single();

  // Get audit logs with relationships
  const { data: auditLogs } = await supabase
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
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Get function results
  const [
    { data: sessionUserId },
    { data: userChurchId },
    { data: userRole },
    { data: dbVersion },
  ] = await Promise.all([
    supabase.rpc('get_session_user_id'),
    supabase.rpc('get_user_church_id'),
    supabase.rpc('get_user_role'),
    supabase.rpc('get_database_version'),
  ]);

  // Get all churches for superadmin
  const { data: allChurches } = isSuperAdmin(userRole) 
    ? await supabase.from('churches').select('*')
    : { data: null };

  // Update relationships and permissions for superadmin
  const debugInfo = {
    sessionUserId,
    userChurchId,
    userRole,
    relationships: {
      profileToChurch: profile?.church_id ? 'Connected' : 'Not Connected',
      profileToAuditLogs: auditLogs?.length || 0,
      churchMembers: 0,
      totalChurches: isSuperAdmin(userRole) ? allChurches?.length || 0 : 0,
      accessibleChurches: isSuperAdmin(userRole) ? 'All' : (userChurchId ? '1' : '0'),
    },
    permissions: {
      canAccessChurch: isSuperAdmin(userRole) ? true : Boolean(userChurchId),
      currentRole: userRole,
      isGlobalAdmin: isSuperAdmin(userRole),
      capabilities: {
        canManageChurches: isSuperAdmin(userRole),
        canManageUsers: isSuperAdmin(userRole),
        canAccessAllData: isSuperAdmin(userRole),
        canManageRoles: isSuperAdmin(userRole),
      }
    },
  };

  // Add system health checks
  const { data: dbHealth } = await supabase
    .from('churches')
    .select('count')
    .single();

  const exportData: ExportData = {
    timestamp: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email!,
      lastSignIn: user.last_sign_in_at || 'Never',
    },
    profile: profile!,
    auditLogs: auditLogs || [],
    systemInfo: {
      userAgent: headersList.get('user-agent') || 'Unknown',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      databaseVersion: dbVersion || 'Unknown',
      databaseHealth: dbHealth ? 'Connected' : 'Error',
      supabaseStatus: user ? 'Authenticated' : 'Error',
    },
    debugInfo,
    superadminInfo: isSuperAdmin(userRole) ? {
      totalChurches: allChurches?.length || 0,
      totalUsers: null, // Would need another query
      systemHealth: {
        databaseConnected: true,
        authServiceStatus: 'operational',
        lastBackup: new Date().toISOString(), // You'd want to get this from your backup service
      }
    } : undefined
  };

  return exportData;
} 