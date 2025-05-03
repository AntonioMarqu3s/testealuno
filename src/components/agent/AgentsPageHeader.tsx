
import { Button } from "@/components/ui/button";
import { AgentsHeader } from "@/components/agent/AgentsHeader";

interface AgentsPageHeaderProps {
  userPlan: {
    plan: number;
    name: string;
  };
  onCreateAgent: () => void;
  onUpgradeClick: () => void;
  onRefreshPlan: () => void;
  isRefreshing: boolean;
}

export const AgentsPageHeader = ({
  userPlan,
  onCreateAgent,
  onUpgradeClick,
  onRefreshPlan,
  isRefreshing
}: AgentsPageHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <AgentsHeader 
        userPlanType={userPlan.plan} 
        onCreateAgent={onCreateAgent} 
        onUpgradeClick={onUpgradeClick}
      />
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefreshPlan} 
        disabled={isRefreshing}
      >
        {isRefreshing ? "Atualizando..." : "Atualizar Plano"}
      </Button>
    </div>
  );
};
