
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { AgentFormValues } from "@/components/agent/form/agentSchema";
import { 
  getUserPlan, 
  incrementAgentCount,
  canCreateAgent,
  generateInstanceId,
  getCurrentUserEmail,
  saveAgent,
  deleteUserAgent,
  updateUserAgent
} from "@/services";

export const useAgentSubmission = (agentType: string) => {
  const navigate = useNavigate();
  const { toast: toastHook } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitAgent = (values: AgentFormValues) => {
    setIsSubmitting(true);
    
    // Get actual user email
    const userEmail = getCurrentUserEmail();
    
    // Verificar se o usuário pode criar mais agentes
    if (!canCreateAgent(userEmail)) {
      toastHook({
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
    
    // Create client identifier
    const clientIdentifier = `${userEmail}-${values.agentName}`.replace(/\s+/g, '-').toLowerCase();
    
    // Incrementar contagem de agentes do usuário
    incrementAgentCount(userEmail);
    
    // Criar objeto do agente
    const newAgent = {
      id: `agent-${Date.now()}`, // Use timestamp for unique ID
      name: values.agentName,
      type: agentType,
      isConnected: false,
      createdAt: new Date(),
      instanceId,
      clientIdentifier // Add client identifier
    };

    // Salvar agente no localStorage
    saveAgent(userEmail, newAgent);
    
    // Simulação - normalmente aqui você faria uma chamada à API
    setTimeout(() => {
      toast.success("Agente criado com sucesso", {
        description: `O agente ${values.agentName} foi criado e está pronto para uso.`,
      });
      
      // We won't navigate automatically, user will close the confirmation panel
      setIsSubmitting(false);
    }, 1000);
  };

  const handleUpdateAgent = (values: AgentFormValues, agentId: string) => {
    setIsSubmitting(true);
    
    // Get user email
    const userEmail = getCurrentUserEmail();
    
    // Update instance ID if name changed
    const instanceId = generateInstanceId(userEmail, values.agentName);
    
    // Create client identifier
    const clientIdentifier = `${userEmail}-${values.agentName}`.replace(/\s+/g, '-').toLowerCase();
    
    // Update agent in localStorage
    updateUserAgent(userEmail, agentId, {
      name: values.agentName,
      instanceId,
      clientIdentifier // Add client identifier
    });
    
    toast.success("Agente atualizado com sucesso", {
      description: `O agente ${values.agentName} foi atualizado com sucesso.`,
    });
    
    // Clear the editing session
    sessionStorage.removeItem('editingAgent');
    
    setIsSubmitting(false);
  };

  const handleDeleteAgent = (agentId: string) => {
    const userEmail = getCurrentUserEmail();
    
    // Delete agent from localStorage
    deleteUserAgent(userEmail, agentId);
    
    toast.success("Agente removido com sucesso", {
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
