
import React from "react";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Timer } from "lucide-react";
import { Agent } from "../AgentTypes";
import { getTrialDaysRemaining, hasTrialExpired } from "@/services/plan/userPlanService";

interface AgentContentProps {
  agent: Agent;
  userEmail?: string;
}

export const AgentContent: React.FC<AgentContentProps> = ({ 
  agent, 
  userEmail 
}) => {
  // Map to translate agent type codes to friendly names
  const agentTypeMap: Record<string, string> = {
    "sales": "Vendedor",
    "sdr": "SDR",
    "closer": "Closer",
    "support": "Atendimento",
    "broadcast": "Disparo",
    "secretary": "Secretária Pessoal",
    "helpdesk": "Helpdesk", // Added helpdesk type
    "school": "Escolar",
    "custom": "Personalizado",
  };

  // Get friendly agent type name or use the raw type if not found in map
  const agentTypeName = agentTypeMap[agent.type] || agent.type;

  // Create displayed instance ID per requirements
  const displayInstanceId = agent.instanceId || 
    (userEmail ? `${userEmail}-${agent.name.replace(/\s+/g, '')}` : 'Instance ID not available');

  // Trial period information
  const trialDaysRemaining = userEmail ? getTrialDaysRemaining(userEmail) : 0;
  const isTrialExpired = userEmail ? hasTrialExpired(userEmail) : false;
  const isInTrialPeriod = trialDaysRemaining > 0 && !isTrialExpired;

  return (
    <CardContent className="pb-2 flex-grow">
      <p className="text-sm mb-2">Tipo: <span className="font-medium">{agentTypeName}</span></p>
      
      {userEmail && (
        <div className="flex items-center text-xs text-muted-foreground mb-2">
          <Mail className="h-3 w-3 mr-1" />
          <span>{userEmail}</span>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground mb-2">
        ID da Instância: <span className="font-mono">{displayInstanceId}</span>
      </p>
      
      {agent.clientIdentifier && (
        <p className="text-xs text-muted-foreground mb-2">
          Cliente: <span className="font-mono">{agent.clientIdentifier}</span>
        </p>
      )}
      
      {/* Trial period information */}
      {isInTrialPeriod && (
        <div className="mt-3 flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200">
            <Timer className="h-3 w-3" />
            <span>Período de teste: {trialDaysRemaining} {trialDaysRemaining === 1 ? 'dia' : 'dias'}</span>
          </Badge>
        </div>
      )}
    </CardContent>
  );
};
