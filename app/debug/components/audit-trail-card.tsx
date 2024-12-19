import { KeyIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import type { Database } from "@/database.types";
import { formatDistanceToNow } from 'date-fns';

type AuditLog = Database['public']['Tables']['audit_logs']['Row'];

interface AuditTrailCardProps {
  audits: AuditLog[];
  className?: string;
}

function getChangedFields(oldData: any, newData: any) {
  if (!oldData || !newData) return {};
  
  const changes: Record<string, { old: any; new: any }> = {};
  
  // Compare old and new data to find changes
  Object.keys(newData).forEach(key => {
    if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
      changes[key] = {
        old: oldData[key],
        new: newData[key]
      };
    }
  });
  
  return changes;
}

function formatValue(value: any): string {
  if (value === null) return 'none';
  if (value === undefined) return 'none';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function formatChanges(changes: any) {
  if (!changes) return null;
  
  try {
    const changeData = typeof changes === 'string' ? JSON.parse(changes) : changes;
    
    // Handle different change formats
    let changedFields: Record<string, any> = {};

    if (changeData.old && changeData.new) {
      // Handle update format
      changedFields = getChangedFields(changeData.old, changeData.new);
    } else if (changeData.data) {
      // Handle insert format
      const data = changeData.data;
      Object.keys(data).forEach(key => {
        changedFields[key] = { new: data[key] };
      });
    } else {
      // Handle direct changes format
      changedFields = changeData;
    }

    // Skip if no changes to display
    if (Object.keys(changedFields).length === 0) return null;

    return (
      <div className="text-xs text-muted-foreground mt-1 space-y-1">
        {Object.entries(changedFields).map(([field, value]: [string, any]) => {
          // Skip internal fields
          if (['id', 'created_at', 'updated_at'].includes(field)) return null;
          
          // Handle both update and insert cases
          const hasOldValue = value && typeof value === 'object' && 'old' in value;
          const displayValue = hasOldValue ? (
            <span>
              <span className="line-through text-red-500">
                {formatValue(value.old)}
              </span>
              {' → '}
              <span className="text-green-500">
                {formatValue(value.new)}
              </span>
            </span>
          ) : (
            <span className="text-green-500">
              {formatValue(value)}
            </span>
          );

          return (
            <div key={field} className="flex items-center gap-2">
              <span className="font-medium capitalize">
                {field.replace(/_/g, ' ')}:
              </span>
              {displayValue}
            </div>
          );
        })}
      </div>
    );
  } catch (e) {
    console.error('Error formatting changes:', e);
    return null;
  }
}

export function AuditTrailCard({ audits, className }: AuditTrailCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <KeyIcon size={16} />
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </div>
        <CardDescription>Your latest actions in the system</CardDescription>
      </CardHeader>
      <CardContent>
        {audits && audits.length > 0 ? (
          <div className="space-y-4">
            {audits.map((audit) => (
              <div key={audit.id} className="text-sm border-b border-border pb-3 last:border-0">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="font-medium">
                      <span className="capitalize">{audit.action}</span>
                      {' '}
                      <span className="text-muted-foreground capitalize">
                        {audit.table_name.replace(/_/g, ' ')}
                      </span>
                    </div>
                    {audit.changes && formatChanges(audit.changes)}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {audit.created_at 
                      ? formatDistanceToNow(new Date(audit.created_at), { addSuffix: true })
                      : 'Unknown time'
                    }
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No recent activity</div>
        )}
      </CardContent>
    </Card>
  );
} 