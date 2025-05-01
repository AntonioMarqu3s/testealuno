
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
    trialDays: 3 
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
    price: 600.00
  }
};

// Define types for user plan
export interface UserPlan {
  plan: PlanType;
  name: string;
  agentLimit: number;
  trialEndsAt?: string; // ISO date string for trial expiration
  updatedAt: string;
}

/**
 * Get user plan information
 */
export const getUserPlan = (email: string): UserPlan => {
  const planData = getStorageItem<Record<string, UserPlan>>('user_plans', {});
  
  // If no plan exists for this user, initialize with free trial plan
  if (!planData[email]) {
    // Calculate trial end date (3 days from now)
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + PLAN_DETAILS[PlanType.FREE_TRIAL].trialDays);
    
    const freeTrial: UserPlan = {
      plan: PlanType.FREE_TRIAL,
      name: PLAN_DETAILS[PlanType.FREE_TRIAL].name,
      agentLimit: PLAN_DETAILS[PlanType.FREE_TRIAL].agentLimit,
      trialEndsAt: trialEnd.toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    planData[email] = freeTrial;
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
export const updateUserPlan = (email: string, planType: PlanType): void => {
  const planData = getStorageItem<Record<string, UserPlan>>('user_plans', {});
  
  // Get current plan or initialize
  const currentPlan = planData[email] || getUserPlan(email);
  
  // Update plan
  planData[email] = {
    plan: planType,
    name: PLAN_DETAILS[planType].name,
    agentLimit: PLAN_DETAILS[planType].agentLimit,
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
 * Get formatted plan price
 */
export const getPlanPrice = (planType: PlanType): string => {
  const price = PLAN_DETAILS[planType].price;
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};
