
import { supabase } from '@/lib/supabase';
import { PlanType, UserPlan } from '../userPlanService';

// Get user plan from Supabase
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

// Get user plan connection status from Supabase
export const getPlanConnectionStatus = async (
  userId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from('user_plans')
    .select('connect_instancia')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    console.error('Error getting plan connection status:', error);
    return false;
  }

  return data.connect_instancia || false;
};
