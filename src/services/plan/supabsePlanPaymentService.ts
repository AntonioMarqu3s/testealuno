
import { supabase } from '@/lib/supabase';
import { PlanType, UserPlan, PLAN_DETAILS } from './planTypes';

/**
 * Update user plan with payment information
 */
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

/**
 * Migrate plan from localStorage to Supabase
 */
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
    console.log('Plan already exists in Supabase, updating...');
    // Plan already exists, update it instead of creating a new one
    const { error: updateError } = await supabase
      .from('user_plans')
      .update({
        plan: plan.plan,
        name: PLAN_DETAILS[plan.plan].name, // Use name from PLAN_DETAILS to ensure it's not null
        agent_limit: plan.agentLimit,
        trial_ends_at: plan.trialEndsAt,
        subscription_ends_at: plan.subscriptionEndsAt,
        payment_date: plan.paymentDate,
        payment_status: plan.paymentStatus || 'pending',
        connect_instancia: plan.connectInstancia || false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
      
    if (updateError) {
      console.error('Error updating plan in Supabase:', updateError);
    } else {
      console.log('Successfully updated plan in Supabase for user:', email);
    }
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
      name: PLAN_DETAILS[plan.plan].name, // Use name from PLAN_DETAILS to ensure it's not null
      agent_limit: plan.agentLimit,
      trial_ends_at: plan.trialEndsAt,
      subscription_ends_at: subscriptionEndsAt,
      payment_date: plan.plan !== PlanType.FREE_TRIAL ? plan.updatedAt : null,
      payment_status: plan.plan !== PlanType.FREE_TRIAL ? 'completed' : 'pending',
      connect_instancia: plan.connectInstancia || false,
      updated_at: plan.updatedAt || new Date().toISOString()
    }]);
    
  if (insertError) {
    console.error('Error migrating plan to Supabase:', insertError);
  } else {
    console.log('Successfully migrated plan to Supabase for user:', email);
  }
};
