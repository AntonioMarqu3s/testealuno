
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AgentFormValues } from "@/components/agent/form/agentSchema";
import { getUserPlan, incrementAgentCount, canCreateAgent, generateInstanceId } from "@/services/userPlanService";

export const useAgentSubmission = (agentType: string) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitAgent = (values: AgentFormValues) => {
    setIsSubmitting(true);
    
    // Simulando usuário atual (numa aplicação real, isso viria do sistema de autenticação)
    const userEmail = "usuario@exemplo.com";
    
    // Verificar se o usuário pode criar mais agentes
    if (!canCreateAgent(userEmail)) {
      toast({
        title: "Limite de plano atingido",
        description: "Seu plano atual permite apenas 1 agente. Faça upgrade para o plano Premium para criar mais agentes.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      navigate('/agents?showUpgrade=true');
      return;
    }
    
    // Gerar ID de instância
    const instanceId = generateInstanceId(userEmail, values.agentName);
    
    // Incrementar contagem de agentes do usuário
    incrementAgentCount(userEmail);
    
    // Simulação - normalmente aqui você faria uma chamada à API
    setTimeout(() => {
      // Salvar os dados do agente na sessão para exibir na página de agentes
      sessionStorage.setItem('newAgent', JSON.stringify({
        ...values,
        agentType,
        instanceId
      }));
      
      toast({
        title: "Agente criado com sucesso",
        description: `O agente ${values.agentName} foi criado e está pronto para uso.`,
      });
      
      // Redirecionar para a página de agentes
      navigate('/agents');
      
      setIsSubmitting(false);
    }, 1500);
  };

  return {
    isSubmitting,
    handleSubmitAgent
  };
};
