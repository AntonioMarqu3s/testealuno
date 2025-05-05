import React from "react";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Mail, Timer } from "lucide-react";
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
    "custom": "Personalizado",
  };

  // Get friendly agent type name or use the raw type if not found in map
  const agentTypeName = agentTypeMap[agent.type] || agent.type;

  // Create displayed instance ID per requirements
  const displayInstanceId = agent.instanceId || 
    (userEmail ? `${userEmail}-${agent.name.replace(/\s+/g, '')}` : 'Instance ID not available');

  // Trial period information from agent.extended or fallback to function
  const trialEndDate = agent.extended?.trialEndDate;
  const trialDaysRemaining = trialEndDate 
    ? Math.max(0, Math.ceil((trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : (userEmail ? getTrialDaysRemaining(userEmail) : 0);
  
  const isTrialExpired = trialEndDate
    ? trialEndDate.getTime() < Date.now()
    : (userEmail ? hasTrialExpired(userEmail) : false);
  
  const isInTrialPeriod = trialDaysRemaining > 0 && !isTrialExpired;

  // Plan end date information
  const planEndDate = agent.extended?.planEndDate;
  const hasPlan = !!planEndDate && planEndDate.getTime() > Date.now();

  return (
    <CardContent className="pb-2 flex-grow">
      {agent.isConnected && (
        <div className="mb-4 flex items-center gap-2">
          <Badge variant="success" className="bg-green-100 text-green-800">Conectado</Badge>
          <span className="text-green-700 text-sm">Seu agente está conectado!</span>
        </div>
      )}
      <p className="text-sm mb-2">Tipo: <span className="font-medium">{agentTypeName}</span></p>
      
      {userEmail && (
        <div className="flex items-center text-xs text-muted-foreground mb-2">
          <Mail className="h-3 w-3 mr-1" />
          <span>{agent.extended?.email || userEmail}</span>
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
      
      {/* Plan information if available */}
      {agent.extended?.planId && (
        <div className="mt-2 text-xs text-muted-foreground">
          <p>Plano: <span className="font-medium">
            {agent.extended.planId === 1 ? 'Inicial' : 
             agent.extended.planId === 2 ? 'Padrão' : 
             agent.extended.planId === 3 ? 'Premium' : 'Teste Gratuito'}
          </span></p>
          
          {planEndDate && (
            <div className="flex items-center gap-1 mt-1">
              <Calendar className="h-3 w-3" />
              <span>Validade: {planEndDate.toLocaleDateString('pt-BR')}</span>
            </div>
          )}
        </div>
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
      
      {/* Discount coupon if available */}
      {agent.extended?.discountCoupon && (
        <div className="mt-2">
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
            Cupom: {agent.extended.discountCoupon}
          </Badge>
        </div>
      )}
    </CardContent>
  );
};
