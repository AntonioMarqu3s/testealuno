
import { supabase } from '@/lib/supabase';
import { getUserPlan, hasTrialExpired, PlanType } from '@/services/plan/userPlanService';
import { getCurrentUser } from '@/services/auth/supabaseAuth';
import { getRemainingAgentCount } from './agentLimitCheck';
import { incrementAgentCount } from './agentCountManagement';

/**
 * Check if the user can create a new agent
 * @param email User email
 * @returns boolean indicating if the user can create a new agent
 */
export const canCreateAgent = async (email: string): Promise<boolean> => {
  // First get the remaining agent count
  const remainingAgents = getRemainingAgentCount(email);
  
  if (remainingAgents <= 0) {
    // If no agents remaining according to local storage, check with Supabase
    const user = await getCurrentUser();
    if (user?.id) {
      try {
        const { data, error } = await supabase
          .from('user_plans')
          .select('plan, agent_limit, trial_ends_at')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          console.error('Error checking agent limit in Supabase:', error);
          return false;
        }
        
        if (data) {
          const isTrialPlan = data.plan === PlanType.FREE_TRIAL;
          const trialExpired = isTrialPlan && 
            data.trial_ends_at && 
            new Date(data.trial_ends_at) < new Date();
          
          if (trialExpired) {
            return false;
          }
          
          // Get count of agents from Supabase
          const { data: agentsData, error: agentsError } = await supabase
            .from('agents')
            .select('id')
            .eq('user_id', user.id);
            
          if (agentsError) {
            console.error('Error checking agent count in Supabase:', agentsError);
            return false;
          }
          
          // Compare agent count with limit
          const agentCount = agentsData ? agentsData.length : 0;
          if (agentCount < data.agent_limit) {
            // Track the agent creation in local storage
            incrementAgentCount(email);
            return true;
          }
        }
      } catch (err) {
        console.error('Exception when checking agent limit in Supabase:', err);
        return false;
      }
    }
    
    return false;
  }
  
  // If we have remaining agents, track creation and allow it
  incrementAgentCount(email);
  return true;
};
