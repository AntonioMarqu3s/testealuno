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
import { supabase } from "@/lib/supabase";

export const useAgentSubmission = (agentType: string) => {
  const navigate = useNavigate();
  const { toast: toastHook } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmitAgent = async (values: AgentFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Get actual user email
      const userEmail = getCurrentUserEmail() || "user@example.com";
      
      // Check if the user can create more agents
      if (!canCreateAgent(userEmail)) {
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
      
      // Create agent object with detailed information from form values
      const newAgent = {
        id: `agent-${Date.now()}`, // Use timestamp for unique ID
        name: values.agentName,
        type: agentType,
        isConnected: false,
        createdAt: new Date(),
        instanceId,
        clientIdentifier,
        // Store all agent form data
        personality: values.personality,
        customPersonality: values.customPersonality,
        companyName: values.companyName,
        companyDescription: values.companyDescription,
        segment: values.segment,
        mission: values.mission,
        vision: values.vision,
        mainDifferentials: values.mainDifferentials,
        competitors: values.competitors,
        commonObjections: values.commonObjections,
        productName: values.productName,
        productDescription: values.productDescription,
        problemsSolved: values.problemsSolved,
        benefits: values.benefits,
        differentials: values.differentials
      };

      console.log("Saving new agent:", newAgent);

      // Save agent to localStorage
      saveAgent(userEmail, newAgent);
      
      // Save agent to Supabase database
      const { error } = await supabase
        .from('agents')
        .insert({
          id: newAgent.id,
          name: values.agentName,
          type: agentType,
          is_connected: false,
          connect_instancia: false,
          created_at: new Date().toISOString(),
          instance_id: instanceId,
          client_identifier: clientIdentifier,
          user_id: userEmail,
          // Store all agent form data as additional fields or in a JSON column
          agent_data: {
            personality: values.personality,
            customPersonality: values.customPersonality,
            companyName: values.companyName,
            companyDescription: values.companyDescription,
            segment: values.segment,
            mission: values.mission,
            vision: values.vision,
            mainDifferentials: values.mainDifferentials,
            competitors: values.competitors,
            commonObjections: values.commonObjections,
            productName: values.productName,
            productDescription: values.productDescription,
            problemsSolved: values.problemsSolved,
            benefits: values.benefits,
            differentials: values.differentials
          }
        });
        
      if (error) {
        console.error("Error saving agent to Supabase:", error);
        toast.error("Erro ao salvar no banco de dados", {
          description: "O agente foi criado localmente, mas ocorreu um erro ao salvá-lo no banco de dados.",
        });
      }
      
      // Show success message
      toast.success("Agente criado com sucesso", {
        description: `O agente ${values.agentName} foi criado e está pronto para uso.`,
      });
      
      setIsSubmitting(false);
      
      // Navigate to the agents page
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

  const handleDeleteAgent = async (agentId: string) => {
    setIsDeleting(true);
    
    try {
      const userEmail = getCurrentUserEmail() || "user@example.com";
      console.log("Attempting to delete agent:", agentId);
      
      // Delete agent from localStorage and call webhook
      const success = await deleteUserAgent(userEmail, agentId);
      
      // Delete agent from Supabase database
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', agentId);
        
      if (error) {
        console.error("Error deleting agent from database:", error);
        toast.error("Erro na exclusão do banco de dados", {
          description: "O agente foi removido localmente, mas ocorreu um erro ao excluí-lo do banco de dados.",
        });
      }
      
      if (success) {
        toast.success("Agente removido com sucesso", {
          description: "O agente e todos os seus dados foram excluídos permanentemente.",
        });
        
        // Navigate back to agents page after deletion
        navigate('/agents');
      } else {
        toast.error("Erro ao remover agente", {
          description: "Ocorreu um erro ao remover o agente. Tente novamente.",
        });
      }
    } catch (error) {
      console.error("Error deleting agent:", error);
      toast.error("Erro ao excluir agente", {
        description: "Ocorreu um erro ao excluir o agente. Por favor, tente novamente.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isSubmitting,
    isDeleting,
    handleSubmitAgent,
    handleUpdateAgent,
    handleDeleteAgent
  };
};
