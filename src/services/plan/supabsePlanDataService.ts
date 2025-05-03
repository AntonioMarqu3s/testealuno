
import { supabase } from '@/lib/supabase';
import { PlanType, UserPlan } from './userPlanService';

/**
 * Get user plan from Supabase
 */
export const getUserPlanFromSupabase = async (userId: string): Promise<UserPlan | null> => {
  const { data, error } = await supabase
    .from('user_plans')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user plan from Supabase:', error);
    return null;
  }

  if (!data) return null;

  return {
    plan: data.plan as PlanType,
    name: data.name,
    agentLimit: data.agent_limit,
    trialEndsAt: data.trial_ends_at,
    paymentDate: data.payment_date,
    subscriptionEndsAt: data.subscription_ends_at,
    paymentStatus: data.payment_status,
    connectInstancia: data.connect_instancia,
    updatedAt: data.updated_at
  };
};

/**
 * Save user plan to Supabase
 */
export const saveUserPlanToSupabase = async (
  userId: string, 
  plan: PlanType, 
  name: string, 
  agentLimit: number, 
  trialEndsAt?: string,
  paymentDate?: string,
  subscriptionEndsAt?: string,
  paymentStatus?: string,
  connectInstancia?: boolean
): Promise<boolean> => {
  const { error } = await supabase
    .from('user_plans')
    .upsert([{
      user_id: userId,
      plan,
      name,
      agent_limit: agentLimit,
      trial_ends_at: trialEndsAt,
      payment_date: paymentDate,
      subscription_ends_at: subscriptionEndsAt,
      payment_status: paymentStatus,
      connect_instancia: connectInstancia,
      updated_at: new Date().toISOString()
    }]);

  if (error) {
    console.error('Error saving user plan to Supabase:', error);
    return false;
  }

  return true;
};
