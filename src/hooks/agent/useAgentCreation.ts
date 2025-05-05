
import { useState } from "react";
import { toast } from "sonner";
import { AgentFormValues } from "@/components/agent/form/agentSchema";
import { 
  getCurrentUserEmail,
  getCurrentUserId, // Make sure this function exists and returns a string
  incrementAgentCount,
  canCreateAgent,
  generateAgentInstanceId,
  saveAgent,
} from "@/services";
import { saveAgentToSupabase } from "@/services/agent/supabase";

export const useAgentCreation = (agentType: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitAgent = async (values: AgentFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Get actual user email and ID
      const userEmail = getCurrentUserEmail() || "user@example.com";
      const userId = getCurrentUserId() || "user-id"; // Make sure this function exists
      
      // Check if the user can create more agents
      if (!canCreateAgent(userEmail)) {
        toast.error("Limite de plano atingido", {
          description: "Seu plano atual não permite a criação de agentes. Faça upgrade para um plano pago para criar agentes.",
        });
        setIsSubmitting(false);
        return false;
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
        userId, // Add required userId property
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
      
      // Save agent to Supabase using our dedicated function
      const saveResult = await saveAgentToSupabase(
        newAgent.id,
        userEmail,
        values,
        agentType,
        instanceId,
        clientIdentifier,
        false // not connected initially
      );
      
      if (!saveResult) {
        toast.error("Erro ao salvar no banco de dados", {
          description: "O agente foi criado localmente, mas ocorreu um erro ao salvá-lo no banco de dados.",
        });
      }
      
      // Show success message
      toast.success("Agente criado com sucesso", {
        description: `O agente ${values.agentName} foi criado e está pronto para uso.`,
      });
      
      setIsSubmitting(false);
      return true;
    } catch (error) {
      console.error("Error creating agent:", error);
      toast.error("Erro ao criar agente", {
        description: "Ocorreu um erro ao criar o agente. Por favor, tente novamente.",
      });
      setIsSubmitting(false);
      return false;
    }
  };

  return {
    isSubmitting,
    handleSubmitAgent
  };
};
