
import { getUserPlan, hasTrialExpired } from './userPlanService';
import { getUserAgents } from '../agent/agentStorageService';

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
