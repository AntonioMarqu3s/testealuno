
import { supabase } from '@/lib/supabase';
import { PlanType } from '../userPlanService';

/**
 * Update user plan type in Supabase
 */
export const updateUserPlanInSupabase = async (
  userId: string,
  planType: PlanType,
  hasPromo?: boolean
): Promise<boolean> => {
  try {
    // Calculate trial end date if it's a free trial with promo code
    let trialEndsAt = null;
    if (planType === PlanType.FREE_TRIAL && hasPromo) {
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 5);
      trialEndsAt = trialEnd.toISOString();
    }
    
    // Get the name and agent limit based on plan type
    let name, agentLimit;
    
    switch (planType) {
      case PlanType.FREE_TRIAL:
        name = 'Teste Gratuito';
        agentLimit = 1;
        break;
      case PlanType.BASIC:
        name = 'Inicial';
        agentLimit = 1;
        break;
      case PlanType.STANDARD:
        name = 'Padrão';
        agentLimit = 3;
        break;
      case PlanType.PREMIUM:
        name = 'Premium';
        agentLimit = 10;
        break;
      default:
        name = 'Teste Gratuito';
        agentLimit = 1;
    }
    
    // Check if a user plan already exists
    const { data: existingPlan } = await supabase
      .from('user_plans')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (existingPlan) {
      // Update existing plan
      const { error } = await supabase
        .from('user_plans')
        .update({
          plan: planType,
          name,
          agent_limit: agentLimit,
          trial_ends_at: trialEndsAt,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error updating user plan in Supabase:', error);
        return false;
      }
    } else {
      // Insert new plan
      const { error } = await supabase
        .from('user_plans')
        .insert({
          user_id: userId,
          plan: planType,
          name,
          agent_limit: agentLimit,
          trial_ends_at: trialEndsAt,
          updated_at: new Date().toISOString()
        });
        
      if (error) {
        console.error('Error inserting user plan in Supabase:', error);
        return false;
      }
    }
    
    return true;
  } catch (err) {
    console.error('Exception when updating user plan in Supabase:', err);
    return false;
  }
};
