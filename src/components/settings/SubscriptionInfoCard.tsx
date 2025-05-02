
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanType } from "@/services/plan/types/planTypes";
import { getDaysRemaining, getExpirationDate, getPlanStartDate } from "@/utils/planDisplay";

interface SubscriptionInfoCardProps {
  plan: any;
  isLoading: boolean;
  userEmail: string;
}

export function SubscriptionInfoCard({ plan, isLoading, userEmail }: SubscriptionInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações de Assinatura</CardTitle>
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
              <div className="font-semibold">{getPlanStartDate(plan)}</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Data de Expiração</div>
              <div className="font-semibold">{getExpirationDate(plan)}</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Dias Restantes</div>
              <div className="font-semibold">{getDaysRemaining(userEmail, plan?.plan as PlanType)}</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Status do Pagamento</div>
              <div className="font-semibold">
                {plan?.paymentStatus 
                  ? (plan.paymentStatus === 'completed' ? 'Completo' : 'Pendente') 
                  : 'N/A'}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
