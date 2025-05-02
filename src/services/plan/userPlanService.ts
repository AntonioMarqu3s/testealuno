
import { getStorageItem } from '../storage/localStorageService';
import { PlanType, UserPlan, PLAN_DETAILS } from './types/planTypes';
import { initializeUserPlan } from './core/planInitialization';
import { getUserPlanFromStorage } from './core/planStorage';

/**
 * Get user plan information
 */
export const getUserPlan = (email: string): UserPlan => {
  // Get user plan or initialize if not found
  const userPlan = getUserPlanFromStorage(email);
  
  if (userPlan) {
    return userPlan;
  }
  
  // Initialize a new plan for this user
  return initializeUserPlan(email);
};

// Re-export types and constants for backward compatibility
export { PlanType, PLAN_DETAILS };
export type { UserPlan };

// Re-export all functions from the modules
export { 
  transferUserPlanData, 
  initializeUserPlan 
} from './core/planInitialization';

export { 
  updateUserPlan,
  updatePlanPayment 
} from './core/planManagement';

export { 
  getPlanPrice,
  hasTrialExpired,
  hasSubscriptionExpired,
  getTrialDaysRemaining,
  getSubscriptionDaysRemaining 
} from './utils/planUtils';
