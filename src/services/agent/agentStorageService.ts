
import { getStorageItem, setStorageItem, ALL_AGENTS_KEY } from '../storage/localStorageService';
import { Agent } from '@/components/agent/AgentTypes';
import { toast } from 'sonner';

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
 * Delete an agent for the user
 */
export const deleteUserAgent = async (email: string, agentId: string): Promise<boolean> => {
  const allAgentsData = getStorageItem<Record<string, Agent[]>>(ALL_AGENTS_KEY, {});
  
  if (allAgentsData[email]) {
    // Get the agent being deleted
    const agentToDelete = allAgentsData[email].find(agent => agent.id === agentId);
    
    if (agentToDelete?.instanceId) {
      try {
        // Call webhook to delete instance
        await deleteAgentInstance(agentToDelete.instanceId);
      } catch (error) {
        console.error("Error deleting agent instance:", error);
        // Continue with deletion even if API call fails
      }
    }
    
    // Filter out deleted agent
    allAgentsData[email] = allAgentsData[email].filter(agent => agent.id !== agentId);
    
    // Save back to storage
    setStorageItem(ALL_AGENTS_KEY, allAgentsData);
    
    // Decrement the agent count in the user's plan
    const decrementAgentCount = require('../plan/userPlanService').decrementAgentCount;
    decrementAgentCount(email);
    
    return true;
  }
  
  return false;
};

/**
 * Delete agent instance via webhook API
 */
const deleteAgentInstance = async (instanceId: string): Promise<boolean> => {
  try {
    const response = await fetch('https://n8n-n8n.31kvca.easypanel.host/webhook/delete-instancia', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ instanceName: instanceId })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete instance: ${response.status}`);
    }
    
    console.log("Agent instance deleted successfully:", instanceId);
    return true;
  } catch (error) {
    console.error("Error calling delete instance webhook:", error);
    return false;
  }
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
