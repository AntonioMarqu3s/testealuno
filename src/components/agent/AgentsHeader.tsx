
import { Button } from "@/components/ui/button";
import { CreditCard, Plus } from "lucide-react";
import { PlanType, PLAN_DETAILS } from "@/services/plan/userPlanService";
import { canCreateAgent } from "@/services/plan/planLimitService";

interface AgentsHeaderProps {
  userPlanType: number;
  onCreateAgent: () => void;
  onUpgradeClick: () => void;
  agentCount: number;
}

export const AgentsHeader = ({ userPlanType, onCreateAgent, onUpgradeClick, agentCount }: AgentsHeaderProps) => {
  // Get the plan details based on the user's plan type
  const planDetails = PLAN_DETAILS[userPlanType as PlanType];
  const planName = planDetails?.name || "Desconhecido";
  const agentLimit = planDetails?.agentLimit || 1;
  
  // Determine if the user needs to upgrade
  const needsUpgrade = agentCount >= agentLimit;

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Meus Agentes</h2>
        <p className="text-muted-foreground">
          Gerencie e monitore seus agentes de IA.
        </p>
        <p className="text-xs mt-1 font-medium">
          Plano atual: <span className={userPlanType === PlanType.BASIC ? "text-muted-foreground" : "text-primary"}>
            {planName} ({agentLimit} {agentLimit === 1 ? 'agente' : 'agentes'})
          </span>
          {needsUpgrade && (
            <span className="ml-1 text-amber-500">(limite atingido)</span>
          )}
        </p>
      </div>
      <div className="flex gap-2">
        {(userPlanType !== PlanType.PREMIUM) && (
          <Button 
            variant="outline" 
            className="md:w-auto w-full" 
            onClick={onUpgradeClick}
          >
            <CreditCard className="mr-2 h-4 w-4" /> Fazer Upgrade
          </Button>
        )}
        <Button 
          className="md:w-auto w-full" 
          onClick={onCreateAgent}
          disabled={needsUpgrade}
        >
          <Plus className="mr-2 h-4 w-4" /> Criar Novo Agente
        </Button>
      </div>
    </div>
  );
};
