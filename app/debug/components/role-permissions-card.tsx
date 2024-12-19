import { ShieldIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { RoleBadge } from "@/components/role-badge";
import { PermissionsList } from "./permissions-list";
import { UserRole } from "@/auth/types";

interface RolePermissionsCardProps {
  role: UserRole;
  className?: string;
}

export function RolePermissionsCard({ role, className }: RolePermissionsCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldIcon size={16} />
          <CardTitle className="text-lg">Role & Permissions</CardTitle>
        </div>
        <CardDescription>Your access level and capabilities</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm text-muted-foreground mb-2">Role</div>
          <div className="mt-1">
            <RoleBadge role={role} />
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-2">Permissions</div>
          <PermissionsList role={role} />
        </div>
      </CardContent>
    </Card>
  );
} 