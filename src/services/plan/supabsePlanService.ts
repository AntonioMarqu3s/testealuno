
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
    updatedAt: data.updated_at
  };
};

// Save user plan to Supabase
export const saveUserPlanToSupabase = async (
  userId: string, 
  plan: PlanType, 
  name: string, 
  agentLimit: number, 
  trialEndsAt?: string
): Promise<boolean> => {
  const { error } = await supabase
    .from('user_plans')
    .upsert([{
      user_id: userId,
      plan,
      name,
      agent_limit: agentLimit,
      trial_ends_at: trialEndsAt,
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

  const { error } = await supabase
    .from('user_plans')
    .upsert([{
      user_id: userId,
      plan: planType,
      name: PLAN_DETAILS[planType].name,
      agent_limit: PLAN_DETAILS[planType].agentLimit,
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
  
  // Insert the plan
  const { error: insertError } = await supabase
    .from('user_plans')
    .insert([{
      user_id: userId,
      plan: plan.plan,
      name: plan.name,
      agent_limit: plan.agentLimit,
      trial_ends_at: plan.trialEndsAt,
      updated_at: plan.updatedAt || new Date().toISOString()
    }]);
    
  if (insertError) {
    console.error('Error migrating plan to Supabase:', insertError);
  }
};
