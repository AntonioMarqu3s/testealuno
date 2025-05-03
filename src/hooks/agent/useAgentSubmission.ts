
import { useNavigate } from "react-router-dom";
import { AgentFormValues } from "@/components/agent/form/agentSchema";
import { useAgentCreation } from "./useAgentCreation";
import { useAgentUpdate } from "./useAgentUpdate";
import { useAgentDelete } from "./useAgentDelete";

export const useAgentSubmission = (agentType: string) => {
  const navigate = useNavigate();
  const { isSubmitting, handleSubmitAgent } = useAgentCreation(agentType);
  const { isSubmitting: isUpdating, handleUpdateAgent } = useAgentUpdate(agentType);
  const { isDeleting, handleDeleteAgent } = useAgentDelete();

  const submitAgent = async (values: AgentFormValues) => {
    const result = await handleSubmitAgent(values);
    if (result) {
      // Navigate to the agents page
      navigate('/agents');
    }
    return result;
  };

  const updateAgent = async (values: AgentFormValues, agentId: string) => {
    const result = await handleUpdateAgent(values, agentId);
    if (result) {
      // Navigate back to agents page after update
      navigate('/agents');
    }
    return result;
  };

  const deleteAgent = async (agentId: string) => {
    const result = await handleDeleteAgent(agentId);
    if (result) {
      // Navigate back to agents page after deletion
      navigate('/agents');
    }
    return result;
  };

  return {
    isSubmitting: isSubmitting || isUpdating,
    isDeleting,
    handleSubmitAgent: submitAgent,
    handleUpdateAgent: updateAgent,
    handleDeleteAgent: deleteAgent
  };
};

export * from './useAgentCreation';
export * from './useAgentUpdate';
export * from './useAgentDelete';
