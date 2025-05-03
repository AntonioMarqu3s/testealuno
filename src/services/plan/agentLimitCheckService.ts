
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
    console.log('Using Supabase plan data:', supabasePlan);
    // If plan is FREE_TRIAL, check if trial is active
    if (supabasePlan.plan === PlanType.FREE_TRIAL) {
      // Check if trial is active by comparing trial_ends_at with current date
      if (supabasePlan.trialEndsAt) {
        const now = new Date();
        const trialEnds = new Date(supabasePlan.trialEndsAt);
        const isTrialActive = now < trialEnds;
        console.log(`Trial active: ${isTrialActive}, ends: ${trialEnds}`);
        
        // Check agent limit even for trial
        const userAgents = getUserAgents(email);
        const withinLimit = userAgents.length < supabasePlan.agentLimit;
        console.log(`Within agent limit: ${withinLimit}, current: ${userAgents.length}, limit: ${supabasePlan.agentLimit}`);
        
        return isTrialActive && withinLimit;
      }
      return false;
    }
    
    // For paid plans, check agent limit
    const userAgents = getUserAgents(email);
    const withinLimit = userAgents.length < supabasePlan.agentLimit;
    console.log(`Within agent limit: ${withinLimit}, current: ${userAgents.length}, limit: ${supabasePlan.agentLimit}`);
    return withinLimit;
  }
  
  // Fallback to local storage if Supabase data is not available
  console.log('Falling back to local storage plan data');
  const userPlan = getUserPlan(email);
  console.log('Local storage plan data:', userPlan);
  const userAgents = getUserAgents(email);
  
  // If FREE_TRIAL, check if trial is still active
  if (userPlan.plan === PlanType.FREE_TRIAL) {
    const trialExpired = hasTrialExpired(email);
    console.log('Trial has expired:', trialExpired);
    if (trialExpired) {
      return false;
    }
    
    const withinLimit = userAgents.length < userPlan.agentLimit;
    console.log(`Within agent limit: ${withinLimit}, current: ${userAgents.length}, limit: ${userPlan.agentLimit}`);
    return withinLimit;
  }
  
  // For paid plans, check agent limit
  const withinLimit = userAgents.length < userPlan.agentLimit;
  console.log(`Within agent limit: ${withinLimit}, current: ${userAgents.length}, limit: ${userPlan.agentLimit}`);
  return withinLimit;
};
