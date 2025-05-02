
import { getUserPlan, hasTrialExpired, PlanType } from './userPlanService';
import { getUserAgents } from '../agent/agentStorageService';

/**
 * Check if a user can create more agents based on their plan limits
 * @param email User email
 * @returns boolean indicating if user can create more agents
 */
export const canCreateAgent = (email: string): boolean => {
  const userPlan = getUserPlan(email);
  const userAgents = getUserAgents(email);
  
  // If user is on FREE_TRIAL plan or trial has expired, they cannot create agents
  if (userPlan.plan === PlanType.FREE_TRIAL && hasTrialExpired(email)) {
    return false;
  }
  
  // Check if user has reached the agent limit for their plan
  return userAgents.length < userPlan.agentLimit;
};

/**
 * Get the number of remaining agents that can be created
 * @param email User email
 * @returns number of remaining agents or 0 if limit reached
 */
export const getRemainingAgentCount = (email: string): number => {
  const userPlan = getUserPlan(email);
  const userAgents = getUserAgents(email);
  
  // If trial expired, no agents can be created
  if (userPlan.plan === PlanType.FREE_TRIAL && hasTrialExpired(email)) {
    return 0;
  }
  
  return Math.max(0, userPlan.agentLimit - userAgents.length);
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
