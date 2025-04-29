
import { getStorageItem, setStorageItem, STORAGE_KEY } from '../storage/localStorageService';

// Plan types
export interface UserPlan {
  email: string;
  planType: 'free' | 'premium';
  maxAgents: number;
  agentsCreated: number;
  features: string[];
  expiresAt?: Date;
}

// Default plans configuration
const PLANS = {
  free: {
    maxAgents: 1,
    features: ['Chat básico', 'Personalização limitada']
  },
  premium: {
    maxAgents: 10,
    features: [
      'Chat ilimitado',
      'Personalização completa',
      'Integração com APIs',
      'Suporte prioritário',
      'Analytics avançado'
    ]
  }
};

/**
 * Get user plan information
 */
export const getUserPlan = (email: string): UserPlan => {
  const allPlans = getStorageItem<Record<string, UserPlan>>(STORAGE_KEY, {});
  
  // Return the user plan if it exists, or initialize a new one
  if (allPlans[email]) {
    return allPlans[email];
  }
  
  return initializeUserPlan(email);
};

/**
 * Initialize a new user plan
 */
export const initializeUserPlan = (email: string): UserPlan => {
  const allPlans = getStorageItem<Record<string, UserPlan>>(STORAGE_KEY, {});
  
  // Create default free plan
  const newPlan: UserPlan = {
    email,
    planType: 'free',
    maxAgents: PLANS.free.maxAgents,
    agentsCreated: 0,
    features: PLANS.free.features
  };
  
  // Save the new plan
  allPlans[email] = newPlan;
  setStorageItem(STORAGE_KEY, allPlans);
  
  return newPlan;
};

/**
 * Upgrade user to premium plan
 */
export const upgradeToPremium = (email: string): UserPlan => {
  const allPlans = getStorageItem<Record<string, UserPlan>>(STORAGE_KEY, {});
  const userPlan = allPlans[email] || initializeUserPlan(email);
  
  // Set premium features
  userPlan.planType = 'premium';
  userPlan.maxAgents = PLANS.premium.maxAgents;
  userPlan.features = PLANS.premium.features;
  userPlan.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
  
  // Save updated plan
  allPlans[email] = userPlan;
  setStorageItem(STORAGE_KEY, allPlans);
  
  return userPlan;
};

/**
 * Check if user can create more agents
 */
export const canCreateAgent = (email: string): boolean => {
  const userPlan = getUserPlan(email);
  return userPlan.agentsCreated < userPlan.maxAgents;
};

/**
 * Increment agent count for user
 */
export const incrementAgentCount = (email: string): void => {
  const allPlans = getStorageItem<Record<string, UserPlan>>(STORAGE_KEY, {});
  const userPlan = allPlans[email] || initializeUserPlan(email);
  
  userPlan.agentsCreated += 1;
  
  allPlans[email] = userPlan;
  setStorageItem(STORAGE_KEY, allPlans);
};

/**
 * Decrement agent count for user
 */
export const decrementAgentCount = (email: string): void => {
  const allPlans = getStorageItem<Record<string, UserPlan>>(STORAGE_KEY, {});
  const userPlan = allPlans[email] || initializeUserPlan(email);
  
  if (userPlan.agentsCreated > 0) {
    userPlan.agentsCreated -= 1;
  }
  
  allPlans[email] = userPlan;
  setStorageItem(STORAGE_KEY, allPlans);
};

/**
 * Transfer user plan data from old email to new email
 */
export const transferUserPlanData = (oldEmail: string, newEmail: string): void => {
  const allPlans = getStorageItem<Record<string, UserPlan>>(STORAGE_KEY, {});
  
  // If the old email has plan data, copy it to the new email
  if (allPlans[oldEmail]) {
    allPlans[newEmail] = {
      ...allPlans[oldEmail],
      email: newEmail
    };
    
    // Optionally, delete the old email data
    delete allPlans[oldEmail];
    
    // Save the updated plans
    setStorageItem(STORAGE_KEY, allPlans);
  } else {
    // If no old plan exists, initialize a new one for the new email
    initializeUserPlan(newEmail);
  }
};
