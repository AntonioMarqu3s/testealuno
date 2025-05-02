
import { supabase } from '@/lib/supabase';
import { PlanType } from '../userPlanService';

// Save user plan to Supabase
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
  try {
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
      }], {
        onConflict: 'user_id' // Specify the conflict target
      });

    if (error) {
      console.error('Error saving user plan to Supabase:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception when saving user plan to Supabase:', err);
    return false;
  }
};

// Update user plan connection status in Supabase
export const updatePlanConnectionStatus = async (
  userId: string,
  connectInstancia: boolean
): Promise<boolean> => {
  const { error } = await supabase
    .from('user_plans')
    .update({
      connect_instancia: connectInstancia,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating plan connection status:', error);
    return false;
  }

  return true;
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
