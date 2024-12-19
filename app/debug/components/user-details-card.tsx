'use client'

import { UserIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { RoleBadge } from "@/components/role-badge";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/database.types";
import { UserRole, UserRoles } from "@/auth/types";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { mapDatabaseRole } from "@/auth/roles";

type Profile = Database['public']['Tables']['profiles']['Row'];

interface UserDetailsCardProps {
  user: User;
  profile: Profile | null;
  className?: string;
}

export function UserDetailsCard({ user, profile: initialProfile, className }: UserDetailsCardProps) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const supabase = createClient();

  useEffect(() => {
    // Subscribe to changes
    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Profile changed:', payload);
          setProfile(payload.new as Profile);
        }
      )
      .subscribe();

    // Initial fetch if profile is null
    if (!profile) {
      const fetchProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (data) {
          setProfile(data);
        }
      };
      fetchProfile();
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id, supabase, profile]);

  // Map the database role to our application role
  const userRole = profile?.role ? mapDatabaseRole(profile.role) : UserRoles.VISITOR;

  console.log('Database Role:', profile?.role); // Debug log
  console.log('Mapped Role:', userRole); // Debug log

  if (!profile) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserIcon size={16} />
            <CardTitle className="text-lg">User Details</CardTitle>
          </div>
          <CardDescription>Loading profile information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserIcon size={16} />
          <CardTitle className="text-lg">User Details</CardTitle>
        </div>
        <CardDescription>Your authentication information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm text-muted-foreground">Email</div>
          <div className="font-medium">{user.email}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Display Name</div>
          <div className="font-medium">{profile.display_name || 'Not set'}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Role</div>
          <div className="mt-1 flex items-center gap-2">
            <RoleBadge role={userRole} />
            <span className="text-xs text-muted-foreground">
              (DB: {profile.role})
            </span>
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Status</div>
          <div className="mt-1">
            <Badge 
              variant={profile.status === 'active' ? 'success' : 'secondary'}
              className="capitalize"
            >
              {profile.status || 'Not set'}
            </Badge>
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Phone Number</div>
          <div className="font-medium">{profile.phone_number || 'Not set'}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Last Active</div>
          <div>{profile?.last_active_at ? new Date(profile.last_active_at).toLocaleString() : 'Never'}</div>
        </div>
      </CardContent>
    </Card>
  );
} 