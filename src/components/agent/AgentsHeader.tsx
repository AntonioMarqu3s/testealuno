
import { Button } from "@/components/ui/button";
import { CreditCard, Plus } from "lucide-react";
import { PlanType, PLAN_DETAILS } from "@/services/plan/planTypes";

interface AgentsHeaderProps {
  userPlanType: number;
  onCreateAgent: () => void;
  onUpgradeClick: () => void;
}

export const AgentsHeader = ({ userPlanType, onCreateAgent, onUpgradeClick }: AgentsHeaderProps) => {
  // Get plan name and agent limit from PLAN_DETAILS
  const planDetails = PLAN_DETAILS[userPlanType as PlanType];
  const planName = planDetails?.name || "Desconhecido";
  const agentLimit = planDetails?.agentLimit || 0;
  
  // Check if it's a free trial
  const isFreeTrial = userPlanType === PlanType.FREE_TRIAL;
  
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Meus Agentes</h2>
        <p className="text-muted-foreground">
          Gerencie e monitore seus agentes de IA.
        </p>
        <p className="text-xs mt-1 font-medium">
          Plano atual: <span className={isFreeTrial ? "text-amber-500" : "text-primary"}>
            {planName} ({agentLimit} {agentLimit === 1 ? "agente" : "agentes"})
          </span>
        </p>
      </div>
      <div className="flex gap-2">
        {isFreeTrial && (
          <Button 
            variant="outline" 
            className="md:w-auto w-full" 
            onClick={onUpgradeClick}
          >
            <CreditCard className="mr-2 h-4 w-4" /> Fazer Upgrade
          </Button>
        )}
        <Button className="md:w-auto w-full" onClick={onCreateAgent}>
          <Plus className="mr-2 h-4 w-4" /> Criar Novo Agente
        </Button>
      </div>
    </div>
  );
};
