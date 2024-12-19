import { InfoIcon } from "lucide-react";

export function InfoBanner() {
  return (
    <div className="w-full">
      <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
        <InfoIcon size="16" strokeWidth={2} />
        This is a protected page showing your authentication and authorization details
      </div>
    </div>
  );
} 