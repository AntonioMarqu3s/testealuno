
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Agent } from "../AgentTypes";
import { generateAgentInstanceId, getCurrentUserEmail, getCurrentUserId } from "@/services";

export const useAgentConfirmation = (agentType: string) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [createdAgent, setCreatedAgent] = useState<Agent | null>(null);
  const navigate = useNavigate();

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    navigate('/agents');
  };

  const handleGenerateQR = () => {
    console.log("Generating QR code for agent:", createdAgent?.name);
    // Permanecemos na mesma página em vez de navegar para análise
    if (createdAgent?.id) {
      // Apenas mostre o diálogo QR em vez de redirecionar para analytics com showQR
      setShowConfirmation(false); // Fechamos o diálogo de confirmação
      
      // Redireciona para a página de agentes com parâmetro para mostrar QR code
      navigate(`/agents?showQR=${createdAgent.id}`);
    }
  };

  const handleAnalyze = () => {
    // Navigate to analytics page
    if (createdAgent?.id) {
      handleCloseConfirmation();
      navigate(`/agent-analytics/${createdAgent.id}`);
    }
  };

  const prepareAgentConfirmation = (values: any, agentId?: string) => {
    const userEmail = getCurrentUserEmail() || "user@example.com";
    const userId = getCurrentUserId(); // Make sure this function exists and returns a string
    const instanceId = generateAgentInstanceId(userEmail, values.agentName);
    
    // Create agent object for confirmation panel
    const agent: Agent = {
      id: agentId || `agent-${Date.now()}`,
      name: values.agentName,
      type: agentType,
      isConnected: false,
      createdAt: new Date(),
      instanceId,
      userId: userId || `user-${Date.now()}` // Add the required userId property
    };
    
    setCreatedAgent(agent);
    setShowConfirmation(true);
    
    return agent;
  };

  return {
    showConfirmation,
    createdAgent,
    setShowConfirmation,
    handleCloseConfirmation,
    handleGenerateQR,
    handleAnalyze,
    prepareAgentConfirmation
  };
};
