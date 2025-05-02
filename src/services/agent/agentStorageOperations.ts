
import { getStorageItem, setStorageItem, ALL_AGENTS_KEY } from '../storage/localStorageService';
import { Agent } from '@/components/agent/AgentTypes';

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
