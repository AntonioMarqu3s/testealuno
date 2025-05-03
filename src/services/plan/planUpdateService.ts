
import { getStorageItem, setStorageItem } from '../storage/localStorageService';
import { PlanType, UserPlan, PLAN_DETAILS } from './planTypes';
import { getUserPlan } from './userPlanStorageService';

/**
 * Update user plan to a specific plan type
 */
export const updateUserPlan = (
  email: string, 
  planType: PlanType, 
  paymentDate?: string,
  subscriptionEndsAt?: string,
  paymentStatus?: string,
  hasPromoCode?: boolean
): void => {
  const planData = getStorageItem<Record<string, UserPlan>>('user_plans', {});
  
  // Get current plan or initialize
  const currentPlan = planData[email] || getUserPlan(email);
  
  // Calculate trial end date if it's a free trial with promo code
  let trialEndsAt = undefined;
  if (planType === PlanType.FREE_TRIAL && hasPromoCode) {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + PLAN_DETAILS[PlanType.FREE_TRIAL].trialDays);
    trialEndsAt = trialEnd.toISOString();
  }
  
  // Calculate subscription end date for paid plans if not provided
  if (!subscriptionEndsAt && planType !== PlanType.FREE_TRIAL) {
    const subscriptionEnd = new Date(paymentDate || new Date());
    subscriptionEnd.setDate(subscriptionEnd.getDate() + 30); // 30-day subscription
    subscriptionEndsAt = subscriptionEnd.toISOString();
  }
  
  // Update plan
  planData[email] = {
    plan: planType,
    name: PLAN_DETAILS[planType].name,
    agentLimit: PLAN_DETAILS[planType].agentLimit,
    trialEndsAt: trialEndsAt,
    subscriptionEndsAt: subscriptionEndsAt,
    paymentDate: paymentDate || (planType !== PlanType.FREE_TRIAL ? new Date().toISOString() : undefined),
    paymentStatus: paymentStatus || (planType !== PlanType.FREE_TRIAL ? 'completed' : 'pending'),
    updatedAt: new Date().toISOString()
  };
  
  // If upgrading from trial, remove trial end date
  if (currentPlan.plan === PlanType.FREE_TRIAL && planType !== PlanType.FREE_TRIAL) {
    delete planData[email].trialEndsAt;
  }
  
  // Save updated plan
  setStorageItem('user_plans', planData);
};

/**
 * Update user plan payment information
 */
export const updatePlanPayment = (
  email: string,
  paymentDate: string = new Date().toISOString(),
  paymentStatus: string = 'completed'
): void => {
  const planData = getStorageItem<Record<string, UserPlan>>('user_plans', {});
  const userPlan = planData[email] || getUserPlan(email);
  
  // Calculate new subscription end date (30 days from payment)
  const subscriptionEnd = new Date(paymentDate);
  subscriptionEnd.setDate(subscriptionEnd.getDate() + 30);
  
  // Update payment information
  planData[email] = {
    ...userPlan,
    paymentDate: paymentDate,
    paymentStatus: paymentStatus,
    subscriptionEndsAt: subscriptionEnd.toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Save updated plan
  setStorageItem('user_plans', planData);
};

/**
 * Get formatted plan price
 */
export const getPlanPrice = (planType: PlanType): string => {
  const price = PLAN_DETAILS[planType].price;
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};
