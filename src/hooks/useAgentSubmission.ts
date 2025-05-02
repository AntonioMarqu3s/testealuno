
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

  const handleSubmitAgent = async (values: AgentFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Get actual user email
      const userEmail = getCurrentUserEmail() || "user@example.com";
      
      // Check if the user can create more agents
      const canCreate = await canCreateAgent(userEmail);
      
      if (!canCreate) {
        toastHook({
          title: "Limite de plano atingido",
          description: "Seu plano atual não permite a criação de agentes. Faça upgrade para um plano pago para criar agentes.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        navigate('/plans');
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
      
      // Show success message
      toast.success("Agente criado com sucesso", {
        description: `O agente ${values.agentName} foi criado e está pronto para uso.`,
      });
      
      setIsSubmitting(false);
      
      // Navigate to agents page
      navigate('/agents');
    } catch (error) {
      console.error("Error creating agent:", error);
      toast.error("Erro ao criar agente", {
        description: "Ocorreu um erro ao criar o agente. Por favor, tente novamente.",
      });
      setIsSubmitting(false);
    }
  };

  const handleUpdateAgent = (values: AgentFormValues, agentId: string) => {
    setIsSubmitting(true);
    
    try {
      // Get user email
      const userEmail = getCurrentUserEmail() || "user@example.com";
      
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
    } catch (error) {
      console.error("Error updating agent:", error);
      toast.error("Erro ao atualizar agente", {
        description: "Ocorreu um erro ao atualizar o agente. Por favor, tente novamente.",
      });
      setIsSubmitting(false);
    }
  };

  const handleDeleteAgent = (agentId: string) => {
    const userEmail = getCurrentUserEmail() || "user@example.com";
    
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
