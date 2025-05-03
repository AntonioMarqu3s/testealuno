
import { getUserPlan } from './userPlanStorageService';
import { PlanType } from './planTypes';

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
