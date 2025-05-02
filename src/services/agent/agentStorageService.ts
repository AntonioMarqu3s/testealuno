
import { getStorageItem, setStorageItem, ALL_AGENTS_KEY } from '../storage/localStorageService';
import { Agent } from '@/components/agent/AgentTypes';
import { toast } from "sonner";

/**
 * Get all agents for a user
 */
export const getUserAgents = (email: string): Agent[] => {
  const allAgentsData = getStorageItem<Record<string, Agent[]>>(ALL_AGENTS_KEY, {});
  
  // Initialize if no agents exist for this user
  if (!allAgentsData[email]) {
    allAgentsData[email] = [];
    setStorageItem(ALL_AGENTS_KEY, allAgentsData);
  }
  
  // Convert date strings back to Date objects
  return allAgentsData[email]?.map(agent => ({
    ...agent,
    createdAt: new Date(agent.createdAt)
  })) || [];
};

/**
 * Initialize user agents array
 */
export const initializeUserAgents = (email: string): Agent[] => {
  const allAgentsData = getStorageItem<Record<string, Agent[]>>(ALL_AGENTS_KEY, {});
  
  // If user already has agents, don't overwrite
  if (!allAgentsData[email]) {
    allAgentsData[email] = [];
    setStorageItem(ALL_AGENTS_KEY, allAgentsData);
  }
  
  return allAgentsData[email];
};

/**
 * Save a new agent for the user
 */
export const saveAgent = (email: string, agent: Agent): void => {
  const allAgentsData = getStorageItem<Record<string, Agent[]>>(ALL_AGENTS_KEY, {});
  
  // Initialize user agents array if it doesn't exist
  if (!allAgentsData[email]) {
    allAgentsData[email] = [];
  }
  
  // Add the new agent
  allAgentsData[email].push(agent);
  
  // Save back to storage
  setStorageItem(ALL_AGENTS_KEY, allAgentsData);
};

/**
 * Call webhook to delete instance from WhatsApp server
 */
export const deleteWhatsAppInstance = async (instanceName: string): Promise<boolean> => {
  try {
    // Try to call the webhook to delete the instance
    const response = await fetch('https://n8n-n8n.31kvca.easypanel.host/webhook/delete-ínstancia', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ instanceName }),
    });
    
    if (!response.ok) {
      console.error("Error deleting WhatsApp instance:", response.status);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Failed to call delete instance webhook:", error);
    return false;
  }
};

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
        const webhookSuccess = await deleteWhatsAppInstance(agent.instanceId);
        if (!webhookSuccess) {
          console.warn("Could not delete WhatsApp instance, but will proceed with local deletion");
        }
      } catch (error) {
        console.error("Error calling delete webhook:", error);
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
