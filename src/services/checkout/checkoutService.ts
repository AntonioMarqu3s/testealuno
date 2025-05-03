
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
export const upgradeToPlan = (email: string, planType: PlanType): void => {
  // Update the user's plan
  updateUserPlan(email, planType);
  
  // Generate and save checkout code (for admin)
  const checkoutCode = `CHK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  saveCheckoutInfo(email, checkoutCode, planType);
};

/**
 * Fetch payment history for a user by email
 * @param email User email to search for
 * @returns Promise with payment history
 */
export const fetchPaymentHistoryByEmail = async (email: string) => {
  try {
    // First get the user ID from the email
    const { data: userData, error: userError } = await supabase.rpc('get_user_by_email', {
      p_email: email
    });
    
    if (userError) throw userError;
    if (!userData) return { payments: [] };
    
    // Get user plan information
    const { data: planData, error: planError } = await supabase
      .from('user_plans')
      .select('*')
      .eq('user_id', userData.id);
      
    if (planError) throw planError;
    
    // Format the payment data
    const payments = planData.map(plan => ({
      id: plan.id,
      userEmail: email,
      planName: getPlanNameById(plan.plan),
      amount: getPlanAmountById(plan.plan),
      paymentDate: plan.payment_date,
      expirationDate: plan.subscription_ends_at,
      status: plan.payment_status || 'completed'
    }));
    
    // Also check localStorage for any legacy payment data
    const checkoutData = localStorage.getItem('checkout_info') || '{}';
    const checkoutInfo = JSON.parse(checkoutData);
    
    if (checkoutInfo[email]) {
      const legacyPayment = checkoutInfo[email];
      payments.push({
        id: legacyPayment.code,
        userEmail: email,
        planName: getPlanNameById(legacyPayment.planType),
        amount: getPlanAmountById(legacyPayment.planType),
        paymentDate: legacyPayment.timestamp,
        expirationDate: null,
        status: legacyPayment.status
      });
    }
    
    return { payments, userData };
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }
};

/**
 * Helper function to get plan name by ID
 */
const getPlanNameById = (planId: number): string => {
  switch (planId) {
    case 0: return 'Teste Gratuito';
    case 1: return 'Inicial';
    case 2: return 'Padrão';
    case 3: return 'Premium';
    default: return 'Desconhecido';
  }
};

/**
 * Helper function to get plan amount by ID
 */
const getPlanAmountById = (planId: number): number => {
  switch (planId) {
    case 0: return 0.00;
    case 1: return 97.00;
    case 2: return 210.00;
    case 3: return 700.00;
    default: return 0.00;
  }
};
