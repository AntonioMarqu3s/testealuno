
import { getStorageItem, setStorageItem } from '../storage/localStorageService';

// Define types for user plan
export interface UserPlan {
  plan: number;
  name: string;
  agentLimit: string | number;
  updatedAt: string;
}

/**
 * Get user plan information
 */
export const getUserPlan = (email: string): UserPlan => {
  const planData = getStorageItem<Record<string, UserPlan>>('user_plans', {});
  
  // If no plan exists for this user, initialize with free plan
  if (!planData[email]) {
    const freePlan: UserPlan = {
      plan: 1,
      name: 'Free',
      agentLimit: 1,
      updatedAt: new Date().toISOString()
    };
    
    planData[email] = freePlan;
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
