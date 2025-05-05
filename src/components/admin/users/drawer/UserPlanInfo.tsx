
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface UserPlanInfoProps {
  plan?: number;
  planName?: string;
}

export function UserPlanInfo({ plan = 0, planName = 'Teste Gratuito' }: UserPlanInfoProps) {
  const getPlanTypeName = (planId: number) => {
    switch(planId) {
      case 0: return "Free Trial";
      case 1: return "Básico";
      case 2: return "Standard";
      case 3: return "Premium";
      default: return "Desconhecido";
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Plano Atual</h3>
            <Badge variant="outline">{getPlanTypeName(plan)}</Badge>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Nome do Plano</p>
            <p className="font-medium">{planName}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Limite de Agentes</p>
            <p className="font-medium">
              {plan === 0 ? "1 (Trial)" : 
               plan === 1 ? "1" : 
               plan === 2 ? "3" : 
               plan === 3 ? "10" : "Desconhecido"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
