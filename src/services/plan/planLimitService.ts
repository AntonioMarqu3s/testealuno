
import { getUserPlan, hasTrialExpired, PlanType } from './userPlanService';
import { getUserAgents } from '../agent/agentStorageService';
import { getUserPlanFromSupabase } from './supabsePlanService';
import { getCurrentUser } from '../auth/supabaseAuth';

/**
 * Check if a user can create more agents based on their plan limits
 * @param email User email
 * @returns boolean indicating if user can create more agents
 */
export const canCreateAgent = async (email: string): Promise<boolean> => {
  const user = await getCurrentUser();
  
  if (!user) {
    console.log('No authenticated user found');
    return false;
  }

  // Try to get user plan from Supabase first
  const supabasePlan = await getUserPlanFromSupabase(user.id);
  
  if (supabasePlan) {
    console.log('Using Supabase plan data');
    // If plan is FREE_TRIAL, check if trial is active
    if (supabasePlan.plan === PlanType.FREE_TRIAL) {
      // Check if trial is active by comparing trial_ends_at with current date
      if (supabasePlan.trialEndsAt) {
        const now = new Date();
        const trialEnds = new Date(supabasePlan.trialEndsAt);
        const isTrialActive = now < trialEnds;
        console.log(`Trial active: ${isTrialActive}, ends: ${trialEnds}`);
        return isTrialActive;
      }
      return false;
    }
    
    // For paid plans, check agent limit
    const userAgents = getUserAgents(email);
    return userAgents.length < supabasePlan.agentLimit;
  }
  
  // Fallback to local storage if Supabase data is not available
  console.log('Falling back to local storage plan data');
  const userPlan = getUserPlan(email);
  const userAgents = getUserAgents(email);
  
  // If FREE_TRIAL, check if trial is still active
  if (userPlan.plan === PlanType.FREE_TRIAL) {
    if (hasTrialExpired(email)) {
      console.log('Trial has expired');
      return false;
    }
    return userPlan.trialEndsAt ? true : false;
  }
  
  // For paid plans, check agent limit
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
