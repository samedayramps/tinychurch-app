import { BuildingIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import type { Database } from "@/database.types";

type Church = Database['public']['Tables']['churches']['Row'];

interface ChurchDetailsCardProps {
  church: Church;
  className?: string;
}

export function ChurchDetailsCard({ church, className }: ChurchDetailsCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BuildingIcon size={16} />
          <CardTitle className="text-lg">Church (Tenant) Details</CardTitle>
        </div>
        <CardDescription>Your organization information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm text-muted-foreground">Church Name</div>
          <div>{church.name}</div>
        </div>
        {church.domain_name && (
          <div>
            <div className="text-sm text-muted-foreground">Domain</div>
            <div>{church.domain_name}</div>
          </div>
        )}
        <div>
          <div className="text-sm text-muted-foreground">Subscription</div>
          <div className="capitalize">{church.subscription_status || 'Not set'}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Timezone</div>
          <div>{church.timezone || 'Not set'}</div>
        </div>
      </CardContent>
    </Card>
  );
} 
