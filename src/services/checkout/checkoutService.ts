
import { PlanType, updateUserPlan } from '../plan/userPlanService';

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
