
import { getUserPlan, hasTrialExpired, PlanType } from './userPlanService';
import { getUserAgents } from '../agent/agentStorageService';
import { supabase } from '@/lib/supabase';

/**
 * Check if a user can create more agents based on their plan limits
 * @param email User email
 * @returns boolean indicating if user can create more agents
 */
export const canCreateAgent = async (email: string): Promise<boolean> => {
  try {
    // First get the user ID from the current session
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No authenticated user found');
      return false;
    }
    
    // Get user plan directly from the database
    const { data: planData, error } = await supabase
      .from('user_plans')
      .select('plan, trial_ends_at, agent_limit, subscription_ends_at')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching user plan:', error);
      
      // Fallback to local storage if database query fails
      const userPlan = getUserPlan(email);
      const userAgents = getUserAgents(email);
      
      // Check if user is on FREE_TRIAL plan and trial has expired
      if (userPlan.plan === PlanType.FREE_TRIAL && hasTrialExpired(email)) {
        return false;
      }
      
      return userAgents.length < userPlan.agentLimit;
    }
    
    if (!planData) {
      console.log('No plan data found for user');
      return false;
    }
    
    // Get user agents count
    const { data: userAgents } = await supabase
      .from('agents')
      .select('id')
      .eq('user_id', user.id);
    
    const agentCount = userAgents ? userAgents.length : 0;
    
    // Check if user has reached their agent limit
    if (agentCount >= planData.agent_limit) {
      console.log(`Agent count (${agentCount}) has reached or exceeded limit (${planData.agent_limit})`);
      return false;
    }
    
    const currentDate = new Date();
    
    // If plan is >= 1 (paid plan), check subscription expiration
    if (planData.plan >= 1) {
      // Check if subscription_ends_at exists and is in the future
      if (planData.subscription_ends_at) {
        const subscriptionEnd = new Date(planData.subscription_ends_at);
        if (currentDate > subscriptionEnd) {
          console.log('Subscription has expired');
          return false;
        }
      }
      
      // Paid plan with valid subscription
      return true;
    } 
    // If plan is 0 (FREE_TRIAL), check trial expiration
    else {
      const trialEndDate = planData.trial_ends_at ? new Date(planData.trial_ends_at) : null;
      
      // Only allow if there's a valid trial and it hasn't expired
      if (!trialEndDate || currentDate > trialEndDate) {
        console.log('Trial has expired or no trial end date');
        return false;
      }
      
      // Trial is still valid
      return true;
    }
    
  } catch (error) {
    console.error('Error in canCreateAgent:', error);
    
    // Fallback to local storage if database query fails
    const userPlan = getUserPlan(email);
    const userAgents = getUserAgents(email);
    
    // If user is on FREE_TRIAL plan and trial has expired, they cannot create agents
    if (userPlan.plan === PlanType.FREE_TRIAL && hasTrialExpired(email)) {
      return false;
    }
    
    // Check if user has reached the agent limit for their plan
    return userAgents.length < userPlan.agentLimit;
  }
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
