
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AgentFormValues } from "@/components/agent/form/agentSchema";
import { 
  getUserPlan, 
  incrementAgentCount, 
  canCreateAgent, 
  generateInstanceId,
  getCurrentUserEmail 
} from "@/services/userPlanService";

export const useAgentSubmission = (agentType: string) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitAgent = (values: AgentFormValues) => {
    setIsSubmitting(true);
    
    // Get actual user email
    const userEmail = getCurrentUserEmail();
    
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

  const handleUpdateAgent = (values: AgentFormValues, agentId: string) => {
    setIsSubmitting(true);
    
    // Get user email
    const userEmail = getCurrentUserEmail();
    
    // Update instance ID if name changed
    const instanceId = generateInstanceId(userEmail, values.agentName);
    
    setTimeout(() => {
      // Get existing agents from localStorage
      const storedAgents = localStorage.getItem('user_agents');
      if (storedAgents) {
        const agents = JSON.parse(storedAgents);
        
        // Find and update the specific agent
        const updatedAgents = agents.map((agent: any) => {
          if (agent.id === agentId) {
            return {
              ...agent,
              name: values.agentName,
              instanceId,
              // Update other fields as needed
            };
          }
          return agent;
        });
        
        // Save updated agents back to localStorage
        localStorage.setItem('user_agents', JSON.stringify(updatedAgents));
      }
      
      toast({
        title: "Agente atualizado com sucesso",
        description: `O agente ${values.agentName} foi atualizado com sucesso.`,
      });
      
      // Clear the editing session
      sessionStorage.removeItem('editingAgent');
      
      // Navigate back to agents page
      navigate('/agents');
      
      setIsSubmitting(false);
    }, 1500);
  };

  return {
    isSubmitting,
    handleSubmitAgent,
    handleUpdateAgent
  };
};
