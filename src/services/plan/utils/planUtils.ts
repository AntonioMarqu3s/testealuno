
import { UserPlan, PlanType, PLAN_DETAILS } from '../types/planTypes';
import { getUserPlanFromStorage } from '../core/planStorage';

/**
 * Get the price for a plan based on its type
 */
export const getPlanPrice = (planType: PlanType): number => {
  return PLAN_DETAILS[planType]?.price || 0;
};

/**
 * Check if a trial has expired based on user's plan
 */
export const hasTrialExpired = (email: string): boolean => {
  // Get user plan from local storage or another source
  const userPlan = getPlanFromSource(email);
  
  if (!userPlan) return false;
  
  // If it's not a trial plan, trial hasn't expired
  if (userPlan.plan !== PlanType.FREE_TRIAL) {
    return false;
  }
  
  // If there's no trial end date, assume it hasn't expired
  if (!userPlan.trialEndsAt) {
    return false;
  }
  
  // Check if the trial end date has passed
  return new Date(userPlan.trialEndsAt) < new Date();
};

/**
 * Check if a user's subscription has expired
 */
export const hasSubscriptionExpired = (email: string): boolean => {
  // Get user plan from local storage or another source
  const userPlan = getPlanFromSource(email);
  
  // If no plan or it's a trial, subscription hasn't expired
  if (!userPlan || userPlan.plan === PlanType.FREE_TRIAL) {
    return false;
  }
  
  // If there's no subscription end date, assume it hasn't expired
  if (!userPlan.subscriptionEndsAt) {
    return false;
  }
  
  // Check if the subscription end date has passed
  return new Date(userPlan.subscriptionEndsAt) < new Date();
};

/**
 * Get the number of days remaining in a trial
 */
export const getTrialDaysRemaining = (email: string): number => {
  // Get user plan from local storage or another source
  const userPlan = getPlanFromSource(email);
  
  // If no plan or not a trial, no days remaining
  if (!userPlan || userPlan.plan !== PlanType.FREE_TRIAL) {
    return 0;
  }
  
  // If no trial end date, default to trial days from plan details
  if (!userPlan.trialEndsAt) {
    return PLAN_DETAILS[PlanType.FREE_TRIAL].trialDays || 5;
  }
  
  // Calculate days remaining
  const trialEndDate = new Date(userPlan.trialEndsAt);
  const today = new Date();
  
  // If trial has expired, return 0
  if (trialEndDate < today) {
    return 0;
  }
  
  // Calculate days difference
  const diffTime = trialEndDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Get the number of days remaining in a subscription
 */
export const getSubscriptionDaysRemaining = (email: string): number => {
  // Get user plan from local storage or another source
  const userPlan = getPlanFromSource(email);
  
  // If no plan or it's a trial, no subscription days
  if (!userPlan || userPlan.plan === PlanType.FREE_TRIAL) {
    return 0;
  }
  
  // If no subscription end date, assume ongoing subscription
  if (!userPlan.subscriptionEndsAt) {
    return 30;
  }
  
  // Calculate days remaining
  const subscriptionEndDate = new Date(userPlan.subscriptionEndsAt);
  const today = new Date();
  
  // If subscription has expired, return 0
  if (subscriptionEndDate < today) {
    return 0;
  }
  
  // Calculate days difference
  const diffTime = subscriptionEndDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Helper function to get user plan from local storage or other source
// This function should be replaced with the actual implementation
// based on how user plans are stored in the application
const getPlanFromSource = (email: string): UserPlan | null => {
  // Use getUserPlanFromStorage instead of getUserPlan
  return getUserPlanFromStorage(email);
};
