
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Agent } from "../AgentTypes";
import { generateAgentInstanceId, getCurrentUserEmail } from "@/services";

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
    // Implementation handled in AgentConfirmation component
  };

  const handleAnalyze = () => {
    // Navigate to analytics page
    if (createdAgent?.id) {
      handleCloseConfirmation();
      navigate(`/agent-analytics/${createdAgent.id}`);
    }
  };

  const prepareAgentConfirmation = (values: any, agentId?: string) => {
    const userEmail = getCurrentUserEmail() || "vladimirfreire@hotmail.com";
    const instanceId = generateAgentInstanceId(userEmail, values.agentName);
    
    // Create agent object for confirmation panel
    const agent: Agent = {
      id: agentId || `agent-${Date.now()}`,
      name: values.agentName,
      type: agentType,
      isConnected: false,
      createdAt: new Date(),
      instanceId
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
