
import { supabase } from '@/lib/supabase';
import { UserPlan } from '../userPlanService';

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
  if (plan.plan !== 0) { // 0 = FREE_TRIAL
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
      payment_date: plan.plan !== 0 ? plan.updatedAt : null,
      payment_status: plan.plan !== 0 ? 'completed' : 'pending',
      connect_instancia: plan.connectInstancia || false,
      updated_at: plan.updatedAt || new Date().toISOString()
    }]);
    
  if (insertError) {
    console.error('Error migrating plan to Supabase:', insertError);
  }
};
