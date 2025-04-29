
import { getUserPlan } from './userPlanService';
import { getUserAgents } from '../agent/agentStorageService';

/**
 * Check if a user can create more agents based on their plan limits
 * @param email User email
 * @returns boolean indicating if user can create more agents
 */
export const canCreateAgent = (email: string): boolean => {
  const userPlan = getUserPlan(email);
  const userAgents = getUserAgents(email);
  
  // Free plan (plan === 1) has limit of 1 agent
  if (userPlan.plan === 1) {
    return userAgents.length < 1;
  }
  
  // Premium plan (plan === 2) has unlimited agents
  return true;
};

/**
 * Update agent count for tracking purposes
 * This doesn't actually limit creation, just tracks the number
 * @param email User email
 */
export const incrementAgentCount = (email: string): void => {
  // This is now a tracking function only
  // The actual limit check is done in canCreateAgent
  console.log(`Agent count incremented for user: ${email}`);
  // In a real app, this would update a counter in the database
};

/**
 * Decrease agent count when an agent is deleted
 * @param email User email
 */
export const decrementAgentCount = (email: string): void => {
  // This is now a tracking function only
  console.log(`Agent count decremented for user: ${email}`);
  // In a real app, this would update a counter in the database
};
