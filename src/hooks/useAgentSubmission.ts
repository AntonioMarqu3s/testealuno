
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { AgentFormValues } from "@/components/agent/form/agentSchema";
import { 
  getUserPlan, 
  incrementAgentCount,
  canCreateAgent,
  generateAgentInstanceId,
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
    const userEmail = getCurrentUserEmail() || "vladimirfreire@hotmail.com";
    
    // Check if the user can create more agents
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
    
    // Generate instance ID
    const instanceId = generateAgentInstanceId(userEmail, values.agentName);
    
    // Create client identifier
    const clientIdentifier = `${userEmail}-${values.agentName}`.replace(/\s+/g, '-').toLowerCase();
    
    // Increment user's agent count
    incrementAgentCount(userEmail);
    
    // Create agent object
    const newAgent = {
      id: `agent-${Date.now()}`, // Use timestamp for unique ID
      name: values.agentName,
      type: agentType,
      isConnected: false,
      createdAt: new Date(),
      instanceId,
      clientIdentifier
    };

    console.log("Saving new agent:", newAgent);

    // Save agent to localStorage
    saveAgent(userEmail, newAgent);
    
    // Simulate API call - normally you would make an API call here
    setTimeout(() => {
      toast.success("Agente criado com sucesso", {
        description: `O agente ${values.agentName} foi criado e está pronto para uso.`,
      });
      
      setIsSubmitting(false);
      // Redirect to agents dashboard after creation
      navigate('/agents');
    }, 1000);
  };

  const handleUpdateAgent = (values: AgentFormValues, agentId: string) => {
    setIsSubmitting(true);
    
    // Get user email
    const userEmail = getCurrentUserEmail();
    
    // Update instance ID if name changed
    const instanceId = generateAgentInstanceId(userEmail, values.agentName);
    
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
    
    // Navigate back to agents page after update
    navigate('/agents');
  };

  const handleDeleteAgent = (agentId: string) => {
    const userEmail = getCurrentUserEmail();
    
    // Delete agent from localStorage
    deleteUserAgent(userEmail, agentId);
    
    toast.success("Agente removido com sucesso", {
      description: "O agente foi excluído com sucesso.",
    });
    
    // Navigate back to agents page after deletion
    navigate('/agents');
  };

  return {
    isSubmitting,
    handleSubmitAgent,
    handleUpdateAgent,
    handleDeleteAgent
  };
};
