
import { PlanType, UserPlan, PLAN_DETAILS } from '../types/planTypes';
import { getUserPlanFromStorage, saveUserPlanToStorage } from './planStorage';
import { getStorageItem, setStorageItem } from '../../storage/localStorageService';

/**
 * Initialize user plan if it doesn't exist
 */
export const initializeUserPlan = (email: string): UserPlan => {
  // Check if plan exists
  const existingPlan = getUserPlanFromStorage(email);
  
  if (existingPlan) {
    return existingPlan;
  }
  
  // If no plan exists, initialize with FREE_TRIAL plan
  const freeTrial: UserPlan = {
    plan: PlanType.FREE_TRIAL,
    name: PLAN_DETAILS[PlanType.FREE_TRIAL].name,
    agentLimit: PLAN_DETAILS[PlanType.FREE_TRIAL].agentLimit,
    updatedAt: new Date().toISOString()
  };
  
  // Save the new plan
  saveUserPlanToStorage(email, freeTrial);
  
  return freeTrial;
};

/**
 * Transfer user plan data from old email to new email
 */
export const transferUserPlanData = (oldEmail: string, newEmail: string): void => {
  const planData = getUserPlanFromStorage(oldEmail);
  
  // If the old email has plan data, copy it to the new email
  if (planData) {
    saveUserPlanToStorage(newEmail, planData);
    
    // Retrieve all plans
    const allPlans = getStorageItem<Record<string, UserPlan>>('user_plans', {});
    
    // Optionally, remove the old email entry
    delete allPlans[oldEmail];
    
    // Save the updated plan data
    setStorageItem('user_plans', allPlans);
  } else {
    // If no data for old email, initialize for new email
    initializeUserPlan(newEmail);
  }
};
