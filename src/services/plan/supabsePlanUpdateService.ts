
import { supabase } from '@/lib/supabase';
import { PlanType } from './userPlanService';

/**
 * Update user plan in Supabase
 */
export const updateUserPlanInSupabase = async (
  userId: string, 
  planType: PlanType
): Promise<boolean> => {
  // Get plan details for the new plan
  const PLAN_DETAILS = {
    [PlanType.FREE_TRIAL]: { 
      name: 'Teste Gratuito', 
      agentLimit: 1, 
      price: 0,
      trialDays: 5 
    },
    [PlanType.BASIC]: { 
      name: 'Inicial', 
      agentLimit: 1, 
      price: 97.00
    },
    [PlanType.STANDARD]: { 
      name: 'Padrão', 
      agentLimit: 3, 
      price: 210.00
    },
    [PlanType.PREMIUM]: { 
      name: 'Premium', 
      agentLimit: 10, 
      price: 700.00
    }
  };

  // Calculate subscription end date (30 days from now) for paid plans
  let subscriptionEndsAt = null;
  if (planType !== PlanType.FREE_TRIAL) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // 30-day subscription
    subscriptionEndsAt = endDate.toISOString();
  }

  // Calculate trial end date for free trial
  let trialEndsAt = null;
  if (planType === PlanType.FREE_TRIAL) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + PLAN_DETAILS[PlanType.FREE_TRIAL].trialDays);
    trialEndsAt = endDate.toISOString();
  }

  const { error } = await supabase
    .from('user_plans')
    .upsert([{
      user_id: userId,
      plan: planType,
      name: PLAN_DETAILS[planType].name,
      agent_limit: PLAN_DETAILS[planType].agentLimit,
      trial_ends_at: trialEndsAt,
      subscription_ends_at: subscriptionEndsAt,
      payment_date: planType !== PlanType.FREE_TRIAL ? new Date().toISOString() : null,
      payment_status: planType !== PlanType.FREE_TRIAL ? 'completed' : 'pending',
      updated_at: new Date().toISOString()
    }]);

  if (error) {
    console.error('Error updating user plan in Supabase:', error);
    return false;
  }

  return true;
};
