
import { PlanType, updateUserPlan } from '../plan/userPlanService';
import { supabase } from '@/lib/supabase';

/**
 * Save checkout information for a user
 * @param email User email
 * @param checkoutCode Unique checkout code
 * @param planType Selected plan type
 */
export const saveCheckoutInfo = (email: string, checkoutCode: string, planType: PlanType): void => {
  const checkoutData = localStorage.getItem('checkout_info') || '{}';
  const checkoutInfo = JSON.parse(checkoutData);
  
  // Add or update checkout info for this user
  checkoutInfo[email] = {
    code: checkoutCode,
    planType: planType,
    timestamp: new Date().toISOString(),
    status: 'completed'
  };
  
  localStorage.setItem('checkout_info', JSON.stringify(checkoutInfo));
};

/**
 * Upgrade the user's plan
 * @param email User email
 * @param planType Selected plan type
 */
export const upgradeToPlan = async (email: string, planType: PlanType): Promise<boolean> => {
  try {
    // Get current date for payment date
    const paymentDate = new Date().toISOString();
    
    // Calculate subscription end date (30 days from now)
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
    const subscriptionEndsAt = subscriptionEndDate.toISOString();
    
    // First try to update in Supabase
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from('user_plans')
        .update({
          plan: planType,
          name: getPlanName(planType),
          agent_limit: getPlanAgentLimit(planType),
          payment_date: paymentDate,
          subscription_ends_at: subscriptionEndsAt,
          payment_status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error updating plan in Supabase:', error);
        // Fall back to local storage
      }
    }
    
    // Update the user's plan in local storage as backup
    updateUserPlan(
      email, 
      planType, 
      paymentDate, 
      subscriptionEndsAt, 
      'completed'
    );
    
    // Generate and save checkout code (for admin)
    const checkoutCode = `CHK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    saveCheckoutInfo(email, checkoutCode, planType);
    
    return true;
  } catch (error) {
    console.error('Error in upgradeToPlan:', error);
    return false;
  }
};

/**
 * Get plan name based on plan type
 */
const getPlanName = (planType: PlanType): string => {
  switch (planType) {
    case PlanType.FREE_TRIAL:
      return 'Teste Gratuito';
    case PlanType.BASIC:
      return 'Inicial';
    case PlanType.STANDARD:
      return 'Padrão';
    case PlanType.PREMIUM:
      return 'Premium';
    default:
      return 'Teste Gratuito';
  }
};

/**
 * Get agent limit based on plan type
 */
const getPlanAgentLimit = (planType: PlanType): number => {
  switch (planType) {
    case PlanType.FREE_TRIAL:
      return 1;
    case PlanType.BASIC:
      return 1;
    case PlanType.STANDARD:
      return 3;
    case PlanType.PREMIUM:
      return 10;
    default:
      return 1;
  }
};
