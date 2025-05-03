
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { UserPlan, PlanType } from "@/services/plan/planTypes";

interface SubscriptionInfoCardProps {
  plan: UserPlan | null;
  isLoading: boolean;
  isSyncing: boolean;
  onSyncClick: () => void;
  getDaysRemaining: () => number;
  getExpirationDate: () => string;
  getPlanStartDate: () => string;
}

export function SubscriptionInfoCard({
  plan,
  isLoading,
  isSyncing,
  onSyncClick,
  getDaysRemaining,
  getExpirationDate,
  getPlanStartDate,
}: SubscriptionInfoCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Informações de Assinatura</CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onSyncClick}
          disabled={isSyncing || isLoading}
          className="flex items-center gap-2"
        >
          {isSyncing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Sincronizar Dados
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Plano Atual</div>
              <div className="font-semibold text-lg">{plan?.name || "Não definido"}</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Limite de Agentes</div>
              <div className="font-semibold text-lg">{plan?.agentLimit || "N/A"}</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Data de Início</div>
              <div className="font-semibold">{getPlanStartDate()}</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Data de Expiração</div>
              <div className="font-semibold">{getExpirationDate()}</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Dias Restantes</div>
              <div className="font-semibold">{getDaysRemaining()}</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Status do Pagamento</div>
              <div className="font-semibold">{plan?.paymentStatus ? (plan.paymentStatus === 'completed' ? 'Completo' : 'Pendente') : 'N/A'}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
