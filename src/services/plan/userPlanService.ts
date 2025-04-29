
import { getStorageItem, setStorageItem, STORAGE_KEY } from '../storage/localStorageService';
import { transferUserAgentData } from '../agent/agentStorageService';
import { generateInstanceId } from '../agent/agentInstanceService';

// Interfaces
export interface UserPlan {
  email: string;
  plano: number; // 1 = basic (1 agent), 2 = premium (unlimited agents)
  agentCount: number;
  checkout?: string; // URL or code for checkout (admin use)
}

/**
 * Initialize user plan if it doesn't exist
 */
export const initializeUserPlan = (email: string): void => {
  const plans = getStorageItem<Record<string, UserPlan>>(STORAGE_KEY, {});
  
  if (!plans[email]) {
    plans[email] = {
      email,
      plano: 1, // Basic plan
      agentCount: 0
    };
    setStorageItem(STORAGE_KEY, plans);
  }
};

/**
 * Get current user's plan
 */
export const getUserPlan = (email: string): UserPlan => {
  const plans = getStorageItem<Record<string, UserPlan>>(STORAGE_KEY, {});
  
  // If user doesn't exist, create a basic plan
  if (!plans[email]) {
    const newPlan: UserPlan = {
      email,
      plano: 1, // Basic plan
      agentCount: 0
    };
    plans[email] = newPlan;
    setStorageItem(STORAGE_KEY, plans);
  }
  
  return plans[email];
};

/**
 * Increment agent count for user
 */
export const incrementAgentCount = (email: string): UserPlan => {
  const plans = getStorageItem<Record<string, UserPlan>>(STORAGE_KEY, {});
  
  const plan = plans[email] || { email, plano: 1, agentCount: 0 };
  plan.agentCount += 1;
  plans[email] = plan;
  
  setStorageItem(STORAGE_KEY, plans);
  return plan;
};

/**
 * Check if user can create more agents
 */
export const canCreateAgent = (email: string): boolean => {
  const plan = getUserPlan(email);
  
  // Basic plan (1) can only create 1 agent
  if (plan.plano === 1) {
    // Check number of actual agents for this user
    const allAgents = getStorageItem<Record<string, any[]>>("all_agents", {});
    const userAgents = allAgents[email] || [];
    return userAgents.length < 1;
  }
  
  // Premium plan (2) can create unlimited agents
  return true;
};

/**
 * Save checkout information (for admin)
 */
export const saveCheckoutInfo = (email: string, checkoutCode: string): void => {
  const plans = getStorageItem<Record<string, UserPlan>>(STORAGE_KEY, {});
  
  const plan = plans[email] || { email, plano: 1, agentCount: 0 };
  plan.checkout = checkoutCode;
  plans[email] = plan;
  
  setStorageItem(STORAGE_KEY, plans);
};

/**
 * Upgrade to premium (simulate)
 */
export const upgradeToPremium = (email: string): void => {
  const plans = getStorageItem<Record<string, UserPlan>>(STORAGE_KEY, {});
  
  const plan = plans[email] || { email, plano: 1, agentCount: 0 };
  plan.plano = 2; // Premium
  plans[email] = plan;
  
  setStorageItem(STORAGE_KEY, plans);
};

/**
 * Transfer user plan data from old email to new email
 */
export const transferUserPlanData = (oldEmail: string, newEmail: string): void => {
  const plans = getStorageItem<Record<string, UserPlan>>(STORAGE_KEY, {});
  
  // If the old email had a plan, transfer it to the new email
  if (plans[oldEmail]) {
    plans[newEmail] = {
      ...plans[oldEmail],
      email: newEmail
    };
    
    // Remove the old email plan
    delete plans[oldEmail];
    
    // Save updated plans
    setStorageItem(STORAGE_KEY, plans);
  }
};

// Register the transferUserPlanData function with the userService
import { userService } from '../user/index';
userService.transferUserPlanData = transferUserPlanData;
