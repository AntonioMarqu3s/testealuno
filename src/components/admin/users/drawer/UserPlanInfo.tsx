
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, CheckCircle, X, AlertTriangle } from "lucide-react";
import { UserPlan } from "@/types/admin";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface UserPlanInfoProps {
  plan?: UserPlan;
}

// Helper function to format dates consistently
export const formatDate = (dateString: string | undefined | null) => {
  if (!dateString) return "N/A";
  return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
};

// Component to show plan status badge
export function PlanStatusBadge({ plan }: { plan: UserPlan }) {
  if (plan.payment_status === "completed") {
    return <Badge variant="success">Ativo</Badge>;
  }
  
  // Check if trial is active
  const trialEndsAt = plan.trial_ends_at ? new Date(plan.trial_ends_at) : null;
  const isTrialActive = trialEndsAt && trialEndsAt > new Date();
  
  if (isTrialActive) {
    return <Badge variant="secondary">Trial Ativo</Badge>;
  }
  
  return <Badge variant="outline">Pendente</Badge>;
}

export function UserPlanInfo({ plan }: UserPlanInfoProps) {
  if (!plan) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Este usuário não possui um plano cadastrado.</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <div className="border p-4 rounded-md bg-muted/50">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{plan.name}</h3>
            <PlanStatusBadge plan={plan} />
          </div>
          <div className="text-right">
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
              {plan.plan === 0 ? "Free Trial" : 
               plan.plan === 1 ? "Básico" :
               plan.plan === 2 ? "Standard" :
               plan.plan === 3 ? "Premium" : "Desconhecido"}
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <h3 className="text-sm font-medium text-muted-foreground">Limite de Agentes</h3>
          <p className="text-sm">{plan.agent_limit}</p>
        </div>
        
        <div className="space-y-1.5">
          <h3 className="text-sm font-medium text-muted-foreground">Status de Pagamento</h3>
          <p className="text-sm capitalize">{plan.payment_status || "N/A"}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <h3 className="text-sm font-medium text-muted-foreground">Data de Pagamento</h3>
          <p className="text-sm">{plan.payment_date ? formatDate(plan.payment_date) : "N/A"}</p>
        </div>
        
        <div className="space-y-1.5">
          <h3 className="text-sm font-medium text-muted-foreground">Expiração da Assinatura</h3>
          <p className="text-sm">{plan.subscription_ends_at ? formatDate(plan.subscription_ends_at) : "N/A"}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <h3 className="text-sm font-medium text-muted-foreground">Início do Trial</h3>
          <p className="text-sm">{plan.trial_init ? formatDate(plan.trial_init) : "N/A"}</p>
        </div>
        
        <div className="space-y-1.5">
          <h3 className="text-sm font-medium text-muted-foreground">Fim do Trial</h3>
          <p className="text-sm">{plan.trial_ends_at ? formatDate(plan.trial_ends_at) : "N/A"}</p>
        </div>
      </div>
      
      <div className="space-y-1.5">
        <h3 className="text-sm font-medium text-muted-foreground">Connect Instancia</h3>
        <p className="text-sm">{plan.connect_instancia ? "Sim" : "Não"}</p>
      </div>
      
      <div className="space-y-1.5">
        <h3 className="text-sm font-medium text-muted-foreground">Última Atualização</h3>
        <p className="text-sm">{formatDate(plan.updated_at)}</p>
      </div>
      
      <div className="flex justify-end">
        <Button variant="outline" size="sm">
          Editar Plano
        </Button>
      </div>
    </>
  );
}
