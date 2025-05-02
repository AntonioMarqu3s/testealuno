
import { getStorageItem, setStorageItem } from '../storage/localStorageService';

// Define plan types
export enum PlanType {
  FREE_TRIAL = 0,
  BASIC = 1,
  STANDARD = 2,
  PREMIUM = 3
}

// Define plan details
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

// Define types for user plan
export interface UserPlan {
  plan: PlanType;
  name: string;
  agentLimit: number;
  trialEndsAt?: string; // ISO date string for trial expiration
  subscriptionEndsAt?: string; // ISO date string for subscription expiration
  paymentDate?: string; // ISO date string for last payment
  paymentStatus?: string; // Status of payment: 'pending', 'completed', 'failed'
  updatedAt: string;
}

/**
 * Get user plan information
 */
export const getUserPlan = (email: string): UserPlan => {
  const planData = getStorageItem<Record<string, UserPlan>>('user_plans', {});
  
  // If no plan exists for this user, initialize with basic plan (not free trial)
  if (!planData[email]) {
    const basicPlan: UserPlan = {
      plan: PlanType.BASIC,
      name: PLAN_DETAILS[PlanType.BASIC].name,
      agentLimit: PLAN_DETAILS[PlanType.BASIC].agentLimit,
      updatedAt: new Date().toISOString()
    };
    
    planData[email] = basicPlan;
    setStorageItem('user_plans', planData);
  }
  
  return planData[email];
};

/**
 * Check if user trial has expired
 */
export const hasTrialExpired = (email: string): boolean => {
  const userPlan = getUserPlan(email);
  
  // If not a trial plan, return false
  if (userPlan.plan !== PlanType.FREE_TRIAL) {
    return false;
  }
  
  // Check if trial end date exists and has passed
  if (userPlan.trialEndsAt) {
    const trialEnd = new Date(userPlan.trialEndsAt);
    const now = new Date();
    return now > trialEnd;
  }
  
  return false;
};

/**
 * Check if subscription has expired
 */
export const hasSubscriptionExpired = (email: string): boolean => {
  const userPlan = getUserPlan(email);
  
  // If free trial, check trial expiration instead
  if (userPlan.plan === PlanType.FREE_TRIAL) {
    return hasTrialExpired(email);
  }
  
  // Check if subscription end date exists and has passed
  if (userPlan.subscriptionEndsAt) {
    const subscriptionEnd = new Date(userPlan.subscriptionEndsAt);
    const now = new Date();
    return now > subscriptionEnd;
  }
  
  return false;
};

/**
 * Get formatted trial days remaining
 */
export const getTrialDaysRemaining = (email: string): number => {
  const userPlan = getUserPlan(email);
  
  // If not a trial plan, return 0
  if (userPlan.plan !== PlanType.FREE_TRIAL || !userPlan.trialEndsAt) {
    return 0;
  }
  
  const trialEnd = new Date(userPlan.trialEndsAt);
  const now = new Date();
  
  // Calculate days difference
  const diffTime = trialEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

/**
 * Get formatted subscription days remaining
 */
export const getSubscriptionDaysRemaining = (email: string): number => {
  const userPlan = getUserPlan(email);
  
  // If free trial, return trial days remaining
  if (userPlan.plan === PlanType.FREE_TRIAL) {
    return getTrialDaysRemaining(email);
  }
  
  // If subscription end date doesn't exist, return 0
  if (!userPlan.subscriptionEndsAt) {
    return 0;
  }
  
  const subscriptionEnd = new Date(userPlan.subscriptionEndsAt);
  const now = new Date();
  
  // Calculate days difference
  const diffTime = subscriptionEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

/**
 * Initialize user plan if it doesn't exist
 */
export const initializeUserPlan = (email: string): void => {
  // Simply call getUserPlan which handles initialization if needed
  getUserPlan(email);
};

/**
 * Transfer user plan data from old email to new email
 */
export const transferUserPlanData = (oldEmail: string, newEmail: string): void => {
  const planData = getStorageItem<Record<string, UserPlan>>('user_plans', {});
  
  // If the old email has plan data, copy it to the new email
  if (planData[oldEmail]) {
    planData[newEmail] = { ...planData[oldEmail] };
    
    // Optionally, remove the old email entry
    delete planData[oldEmail];
    
    // Save the updated plan data
    setStorageItem('user_plans', planData);
  } else {
    // If no data for old email, initialize for new email
    initializeUserPlan(newEmail);
  }
};

/**
 * Update user plan to a specific plan type
 */
export const updateUserPlan = (
  email: string, 
  planType: PlanType, 
  paymentDate?: string,
  subscriptionEndsAt?: string,
  paymentStatus?: string
): void => {
  const planData = getStorageItem<Record<string, UserPlan>>('user_plans', {});
  
  // Get current plan or initialize
  const currentPlan = planData[email] || getUserPlan(email);
  
  // Calculate trial end date if it's a free trial
  let trialEndsAt = undefined;
  if (planType === PlanType.FREE_TRIAL) {
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
