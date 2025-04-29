
import { getStorageItem, setStorageItem, ALL_AGENTS_KEY } from '../storage/localStorageService';
import { generateInstanceId } from './agentInstanceService';

/**
 * Initialize agents array if it doesn't exist
 */
export const initializeUserAgents = (email: string): void => {
  const allAgents = getStorageItem<Record<string, any[]>>(ALL_AGENTS_KEY, {});
  
  if (!allAgents[email]) {
    allAgents[email] = [];
    setStorageItem(ALL_AGENTS_KEY, allAgents);
  }
};

/**
 * Save agent to localStorage
 */
export const saveAgent = (email: string, agent: any): void => {
  const allAgents = getStorageItem<Record<string, any[]>>(ALL_AGENTS_KEY, {});
  
  // Get or initialize agents for this email
  const userAgents = allAgents[email] || [];
  
  // Add new agent at the beginning of the array
  userAgents.unshift(agent);
  
  // Save back to localStorage
  allAgents[email] = userAgents;
  setStorageItem(ALL_AGENTS_KEY, allAgents);
};

/**
 * Get all agents for a user
 */
export const getUserAgents = (email: string): any[] => {
  const allAgents = getStorageItem<Record<string, any[]>>(ALL_AGENTS_KEY, {});
  return allAgents[email] || [];
};

/**
 * Delete agent for a user
 */
export const deleteUserAgent = (email: string, agentId: string): void => {
  const allAgents = getStorageItem<Record<string, any[]>>(ALL_AGENTS_KEY, {});
  const userAgents = allAgents[email] || [];
  
  // Filter out the agent with the specified ID
  const updatedAgents = userAgents.filter(agent => agent.id !== agentId);
  
  // Save back to localStorage
  allAgents[email] = updatedAgents;
  setStorageItem(ALL_AGENTS_KEY, allAgents);
};

/**
 * Transfer user agent data from old email to new email
 */
export const transferUserAgentData = (oldEmail: string, newEmail: string): void => {
  const allAgents = getStorageItem<Record<string, any[]>>(ALL_AGENTS_KEY, {});
  
  // If the old email had agents, transfer them to the new email
  if (allAgents[oldEmail]) {
    allAgents[newEmail] = allAgents[oldEmail].map(agent => ({
      ...agent,
      instanceId: generateInstanceId(newEmail, agent.name)
    }));
    
    // Remove the old email agents
    delete allAgents[oldEmail];
    
    // Save updated agents
    setStorageItem(ALL_AGENTS_KEY, allAgents);
  } else {
    // Initialize empty agents array
    allAgents[newEmail] = [];
    setStorageItem(ALL_AGENTS_KEY, allAgents);
  }
};

// Register the transferUserAgentData function with the userService
import { userService } from '../user/index';
userService.transferUserAgentData = transferUserAgentData;
