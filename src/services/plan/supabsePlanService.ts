
import { supabase } from '@/lib/supabase';
import { PlanType, UserPlan } from './userPlanService';
import { Tables } from '@/lib/supabase';

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
    updatedAt: data.updated_at
  };
};

// Save user plan to Supabase
export const saveUserPlanToSupabase = async (
  userId: string, 
  plan: PlanType, 
  name: string, 
  agentLimit: number, 
  trialEndsAt?: string,
  paymentDate?: string,
  subscriptionEndsAt?: string,
  paymentStatus?: string
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
      updated_at: new Date().toISOString()
    }]);

  if (error) {
    console.error('Error saving user plan to Supabase:', error);
    return false;
  }

  return true;
};

// Update user plan in Supabase
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

// Migrate plan from localStorage to Supabase
export const migratePlanToSupabase = async (userId: string, email: string, plan: UserPlan): Promise<void> => {
  if (!plan) return;
  
  // Check if user already has a plan in Supabase
  const { data, error } = await supabase
    .from('user_plans')
    .select('id')
    .eq('user_id', userId);
    
  if (error) {
    console.error('Error checking existing plan:', error);
    return;
  }
  
  if (data && data.length > 0) {
    // Plan already exists, no need to migrate
    return;
  }
  
  // Calculate subscription end date for paid plans
  let subscriptionEndsAt = null;
  if (plan.plan !== PlanType.FREE_TRIAL) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // Default to 30-day subscription
    subscriptionEndsAt = endDate.toISOString();
  }
  
  // Insert the plan
  const { error: insertError } = await supabase
    .from('user_plans')
    .insert([{
      user_id: userId,
      plan: plan.plan,
      name: plan.name,
      agent_limit: plan.agentLimit,
      trial_ends_at: plan.trialEndsAt,
      subscription_ends_at: subscriptionEndsAt,
      payment_date: plan.plan !== PlanType.FREE_TRIAL ? plan.updatedAt : null,
      payment_status: plan.plan !== PlanType.FREE_TRIAL ? 'completed' : 'pending',
      updated_at: plan.updatedAt || new Date().toISOString()
    }]);
    
  if (insertError) {
    console.error('Error migrating plan to Supabase:', insertError);
  }
};

// Update user plan with payment information
export const updatePlanPaymentInfo = async (
  userId: string,
  planType: PlanType,
  paymentDate: string = new Date().toISOString()
): Promise<boolean> => {
  // Calculate subscription end date (30 days from payment)
  const subscriptionDate = new Date(paymentDate);
  subscriptionDate.setDate(subscriptionDate.getDate() + 30); // 30-day subscription
  
  const { error } = await supabase
    .from('user_plans')
    .update({
      plan: planType,
      payment_date: paymentDate,
      subscription_ends_at: subscriptionDate.toISOString(),
      payment_status: 'completed',
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating payment information:', error);
    return false;
  }

  return true;
};
