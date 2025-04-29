
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AgentFormValues } from "@/components/agent/form/agentSchema";
import { 
  getUserPlan, 
  incrementAgentCount, 
  canCreateAgent, 
  generateInstanceId,
  getCurrentUserEmail,
  saveAgent,
  deleteUserAgent
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
    
    // Criar objeto do agente
    const newAgent = {
      id: `agent-${Date.now()}`, // Use timestamp for unique ID
      name: values.agentName,
      type: agentType,
      isConnected: false,
      createdAt: new Date(),
      instanceId
    };

    // Salvar agente no localStorage
    saveAgent(userEmail, newAgent);
    
    // Simulação - normalmente aqui você faria uma chamada à API
    setTimeout(() => {
      toast({
        title: "Agente criado com sucesso",
        description: `O agente ${values.agentName} foi criado e está pronto para uso.`,
      });
      
      // Redirecionar para a página de agentes
      navigate('/agents');
      
      setIsSubmitting(false);
    }, 1000);
  };

  const handleUpdateAgent = (values: AgentFormValues, agentId: string) => {
    setIsSubmitting(true);
    
    // Get user email
    const userEmail = getCurrentUserEmail();
    
    // Update instance ID if name changed
    const instanceId = generateInstanceId(userEmail, values.agentName);
    
    setTimeout(() => {
      // Get existing agents from localStorage
      const allAgentsData = localStorage.getItem('all_agents');
      if (allAgentsData) {
        const allAgents: Record<string, any[]> = JSON.parse(allAgentsData);
        const userAgents = allAgents[userEmail] || [];
        
        // Find and update the specific agent
        const updatedAgents = userAgents.map((agent: any) => {
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
        allAgents[userEmail] = updatedAgents;
        localStorage.setItem('all_agents', JSON.stringify(allAgents));
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
    }, 1000);
  };

  const handleDeleteAgent = (agentId: string) => {
    const userEmail = getCurrentUserEmail();
    
    // Delete agent from localStorage
    deleteUserAgent(userEmail, agentId);
    
    toast({
      title: "Agente removido com sucesso",
      description: "O agente foi excluído com sucesso.",
    });
  };

  return {
    isSubmitting,
    handleSubmitAgent,
    handleUpdateAgent,
    handleDeleteAgent
  };
};
