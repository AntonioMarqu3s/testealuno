
import { useState } from "react";
import { toast } from "sonner";
import { AgentFormValues } from "@/components/agent/form/agentSchema";
import { 
  getCurrentUserEmail,
  generateAgentInstanceId,
  updateUserAgent
} from "@/services";
import { saveAgentToSupabase } from "@/services/agent/supabase";

export const useAgentUpdate = (agentType: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateAgent = async (values: AgentFormValues, agentId: string) => {
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
        clientIdentifier, // Add client identifier
        // Update all form values
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
      });
      
      // Update agent in Supabase
      await saveAgentToSupabase(
        agentId,
        userEmail,
        values,
        agentType,
        instanceId,
        clientIdentifier
      );
      
      toast.success("Agente atualizado com sucesso", {
        description: `O agente ${values.agentName} foi atualizado com sucesso.`,
      });
      
      // Clear the editing session
      sessionStorage.removeItem('editingAgent');
      
      setIsSubmitting(false);
      return true;
    } catch (error) {
      console.error("Error updating agent:", error);
      toast.error("Erro ao atualizar agente", {
        description: "Ocorreu um erro ao atualizar o agente. Por favor, tente novamente.",
      });
      setIsSubmitting(false);
      return false;
    }
  };

  return {
    isSubmitting,
    handleUpdateAgent
  };
};
