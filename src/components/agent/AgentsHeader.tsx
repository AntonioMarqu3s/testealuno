
import { Button } from "@/components/ui/button";
import { CreditCard, Plus } from "lucide-react";

interface AgentsHeaderProps {
  userPlanType: number;
  onCreateAgent: () => void;
  onUpgradeClick: () => void;
}

export const AgentsHeader = ({ userPlanType, onCreateAgent, onUpgradeClick }: AgentsHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Meus Agentes</h2>
        <p className="text-muted-foreground">
          Gerencie e monitore seus agentes de IA.
        </p>
        <p className="text-xs mt-1 font-medium">
          Plano atual: <span className={userPlanType === 1 ? "text-muted-foreground" : "text-primary"}>
            {userPlanType === 1 ? "Básico (1 agente)" : "Premium (ilimitado)"}
          </span>
        </p>
      </div>
      <div className="flex gap-2">
        {userPlanType === 1 && (
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
