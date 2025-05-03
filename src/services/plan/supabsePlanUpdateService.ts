
import { supabase } from '@/lib/supabase';
import { PlanType, PLAN_DETAILS } from './planTypes';

/**
 * Update user plan in Supabase
 */
export const updateUserPlanInSupabase = async (
  userId: string, 
  planType: PlanType
): Promise<boolean> => {
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
