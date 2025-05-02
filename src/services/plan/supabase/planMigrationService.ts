
import { supabase } from '@/lib/supabase';
import { PlanType, UserPlan } from '../types/planTypes';

/**
 * Migrate user plan data from local storage to Supabase
 */
export const migratePlanToSupabase = async (
  userId: string, 
  email: string, 
  userPlan: UserPlan
): Promise<boolean> => {
  try {
    console.log(`Migrating plan data for user ${email}`);
    
    // First check if the plan already exists in Supabase
    const { data: existingPlan } = await supabase
      .from('user_plans')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    // If plan already exists in Supabase, don't overwrite it
    if (existingPlan) {
      console.log(`Plan already exists in Supabase for user ${email}`);
      return true;
    }
    
    // Create plan in Supabase
    const { error } = await supabase
      .from('user_plans')
      .insert({
        user_id: userId,
        plan: userPlan.plan,
        name: userPlan.name,
        agent_limit: userPlan.agentLimit,
        trial_ends_at: userPlan.trialEndsAt,
        subscription_ends_at: userPlan.subscriptionEndsAt,
        payment_date: userPlan.paymentDate,
        payment_status: userPlan.paymentStatus,
        connect_instancia: userPlan.connectInstancia,
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error(`Error migrating plan to Supabase for user ${email}:`, error);
      return false;
    }
    
    console.log(`Successfully migrated plan to Supabase for user ${email}`);
    return true;
  } catch (err) {
    console.error(`Exception when migrating plan to Supabase for user ${email}:`, err);
    return false;
  }
};
