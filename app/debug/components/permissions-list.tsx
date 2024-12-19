import { UserRole } from "@/auth/types";
import { DEFAULT_ROLE_PERMISSIONS } from "@/auth/roles";

export function PermissionsList({ role }: { role: UserRole }) {
  const permissions = Object.entries(DEFAULT_ROLE_PERMISSIONS[role]).map(([key, allowed]) => ({
    name: key,
    allowed,
  }));

  return (
    <div className="grid gap-2">
      {permissions.map(({ name, allowed }) => (
        <div key={name} className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${allowed ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm">
            {name.replace(/([A-Z])/g, ' $1').trim()}
          </span>
        </div>
      ))}
    </div>
  );
} 