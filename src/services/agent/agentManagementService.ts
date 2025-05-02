
import { getStorageItem, setStorageItem, ALL_AGENTS_KEY } from '../storage/localStorageService';
import { Agent } from '@/components/agent/AgentTypes';
import { toast } from "sonner";
import { deleteWhatsAppInstance } from './webhookService';

/**
 * Delete an agent for the user
 */
export const deleteUserAgent = async (email: string, agentId: string): Promise<boolean> => {
  const allAgentsData = getStorageItem<Record<string, Agent[]>>(ALL_AGENTS_KEY, {});
  
  if (allAgentsData[email]) {
    // Find the agent to get the instance name before deletion
    const agent = allAgentsData[email].find(a => a.id === agentId);
    
    if (agent && agent.instanceId) {
      // Call webhook to delete the instance from WhatsApp server
      try {
        console.log("Attempting to delete WhatsApp instance:", agent.instanceId);
        const webhookSuccess = await deleteWhatsAppInstance(agent.instanceId);
        
        if (webhookSuccess) {
          console.log("Successfully deleted WhatsApp instance:", agent.instanceId);
          toast.success("Instância do WhatsApp removida com sucesso");
        } else {
          console.warn("Could not delete WhatsApp instance, but will proceed with local deletion");
          toast.warning("A instância do WhatsApp pode não ter sido completamente removida");
        }
      } catch (error) {
        console.error("Error calling delete webhook:", error);
        toast.warning("A instância do WhatsApp pode não ter sido completamente removida");
        // Continue with deletion even if webhook fails
      }
    }
    
    // Filter out deleted agent
    allAgentsData[email] = allAgentsData[email].filter(agent => agent.id !== agentId);
    
    // Save back to storage
    setStorageItem(ALL_AGENTS_KEY, allAgentsData);
    
    // Decrement the agent count in the user's plan
    const decrementAgentCount = require('../plan/planLimitService').decrementAgentCount;
    decrementAgentCount(email);
    
    return true;
  }
  
  return false;
};

/**
 * Update an agent for the user
 */
export const updateUserAgent = (email: string, agentId: string, updates: Partial<Agent>): void => {
  const allAgentsData = getStorageItem<Record<string, Agent[]>>(ALL_AGENTS_KEY, {});
  
  if (allAgentsData[email]) {
    // Find and update the agent
    allAgentsData[email] = allAgentsData[email].map(agent => {
      if (agent.id === agentId) {
        return { ...agent, ...updates };
      }
      return agent;
    });
    
    // Save back to storage
    setStorageItem(ALL_AGENTS_KEY, allAgentsData);
  }
};

/**
 * Transfer user agent data from old email to new email
 */
export const transferUserAgentData = (oldEmail: string, newEmail: string): void => {
  const allAgentsData = getStorageItem<Record<string, Agent[]>>(ALL_AGENTS_KEY, {});
  
  // If the old email has agent data, copy it to the new email
  if (allAgentsData[oldEmail] && allAgentsData[oldEmail].length > 0) {
    // Copy the agents to the new email
    allAgentsData[newEmail] = [...(allAgentsData[oldEmail] || [])];
    
    // Update client identifiers for each agent
    if (allAgentsData[newEmail]) {
      allAgentsData[newEmail] = allAgentsData[newEmail].map(agent => {
        const clientIdentifier = `${newEmail}-${agent.name}`.replace(/\s+/g, '-').toLowerCase();
        return { ...agent, clientIdentifier };
      });
    }
    
    // Optionally, delete the old email data
    delete allAgentsData[oldEmail];
    
    // Save the updated agents
    setStorageItem(ALL_AGENTS_KEY, allAgentsData);
  } else {
    // If no old agents exist, initialize an empty array for the new email
    initializeUserAgents(newEmail);
  }
};
