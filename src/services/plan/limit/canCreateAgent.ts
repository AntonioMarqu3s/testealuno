
import { supabase } from '@/lib/supabase';
import { getUserPlan, hasTrialExpired, PlanType } from '../userPlanService';
import { getUserAgents } from '../../agent/agentStorageService';

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
      .select('plan, trial_ends_at, agent_limit, subscription_ends_at, payment_status')
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
      console.log(`Agent limit reached: ${agentCount}/${planData.agent_limit}`);
      return false;
    }
    
    const currentDate = new Date();
    
    // Plan specific checks:
    
    // 1. For FREE_TRIAL (plan = 0), check if trial has not expired
    if (planData.plan === 0) {
      // Only allow if there's a valid trial and it hasn't expired
      const trialEndDate = planData.trial_ends_at ? new Date(planData.trial_ends_at) : null;
      if (!trialEndDate || currentDate > trialEndDate) {
        console.log('Trial has expired or no trial end date');
        return false;
      }
      return true; // Trial is valid and under agent limit
    }
    
    // 2. For paid plans (BASIC, STANDARD, PREMIUM), check if subscription is valid
    if (planData.plan >= 1) {
      // Verify subscription hasn't expired
      const subscriptionEndDate = planData.subscription_ends_at ? new Date(planData.subscription_ends_at) : null;
      
      // If subscription end date is missing or expired
      if (!subscriptionEndDate || currentDate > subscriptionEndDate) {
        // Check if payment status is 'test' which indicates an exemption regardless of dates
        if (planData.payment_status === 'test') {
          return true; // Test accounts can create agents even with expired subscription
        }
        console.log('Subscription has expired');
        return false;
      }
      return true; // Subscription is valid and under agent limit
    }
    
    // Default deny if no conditions are met
    return false;
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
