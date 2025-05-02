
import { supabase } from '@/lib/supabase';
import { PlanType } from '../userPlanService';

// Detalhes de cada plano
export const PLAN_DETAILS = {
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

// Update user plan in Supabase
export const updateUserPlanInSupabase = async (
  userId: string, 
  planType: PlanType
): Promise<boolean> => {
  try {
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

    console.log(`Attempting to update plan for user ${userId} to plan ${planType}`);

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
      }], {
        onConflict: 'user_id' // Specify the conflict target
      });

    if (error) {
      console.error('Error updating user plan in Supabase:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Exception when updating user plan in Supabase:', error);
    throw error;
  }
};
