
import { getStorageItem, setStorageItem } from '../storage/localStorageService';
import { PlanType, UserPlan, PLAN_DETAILS } from './planTypes';

/**
 * Get user plan information from local storage
 */
export const getUserPlan = (email: string): UserPlan => {
  const planData = getStorageItem<Record<string, UserPlan>>('user_plans', {});
  
  // If no plan exists for this user, initialize with FREE_TRIAL plan (without trial days)
  if (!planData[email]) {
    const freeTrial: UserPlan = {
      plan: PlanType.FREE_TRIAL,
      name: PLAN_DETAILS[PlanType.FREE_TRIAL].name,
      agentLimit: PLAN_DETAILS[PlanType.FREE_TRIAL].agentLimit,
      updatedAt: new Date().toISOString()
    };
    
    planData[email] = freeTrial;
    setStorageItem('user_plans', planData);
  }
  
  return planData[email];
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
