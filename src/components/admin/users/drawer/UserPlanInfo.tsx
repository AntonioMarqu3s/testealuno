import React from 'react';
import { Badge } from '@/components/ui/badge';

interface UserPlanInfoProps {
  plan: number;
  planName: string;
}

export function UserPlanInfo({ plan, planName }: UserPlanInfoProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="font-medium">Tipo do Plano</span>
        <Badge variant="outline" className="capitalize">
          {planName}
        </Badge>
      </div>
    </div>
  );
} 