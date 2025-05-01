
import { getStorageItem, setStorageItem, USER_EMAIL_KEY } from '../storage/localStorageService';

/**
 * Get current user email (in a real app would come from auth system)
 */
export const getCurrentUserEmail = (): string => {
  // First try to get from localStorage (simulating a logged-in user)
  const savedEmail = getStorageItem<string>(USER_EMAIL_KEY, '');
  
  // If no email is saved, create a new one and save it
  if (!savedEmail) {
    // Default to vladimirfreire@hotmail.com as requested
    const defaultEmail = 'vladimirfreire@hotmail.com';
    setStorageItem(USER_EMAIL_KEY, defaultEmail);
    
    // Initialize user data
    initializeUserData(defaultEmail);
    return defaultEmail;
  }
  
  return savedEmail;
};

/**
 * Generate an instance ID based on user email and agent name
 */
export const generateInstanceId = (email: string, agentName: string): string => {
  // Format the instance ID as requested: email-AgentName (no spaces)
  return `${email}-${agentName.replace(/\s+/g, '')}`;
};

/**
 * Initialize user data if it doesn't exist
 */
export const initializeUserData = (email: string): void => {
  // These functions need to be imported dynamically to avoid circular references
  const { initializeUserPlan } = require('../plan/userPlanService');
  const { initializeUserAgents } = require('../agent/agentStorageService');
  
  // Initialize user plan if it doesn't exist
  initializeUserPlan(email);
  
  // Initialize agents array if it doesn't exist
  initializeUserAgents(email);
};

/**
 * Update current user email
 */
export const updateCurrentUserEmail = (email: string): void => {
  const oldEmail = getStorageItem<string>(USER_EMAIL_KEY, '');
  
  // Update the email in localStorage
  setStorageItem(USER_EMAIL_KEY, email);
  
  // If there was a previous email, update all references to it
  if (oldEmail && oldEmail !== email) {
    // Transfer any existing plan data to the new email
    transferUserData(oldEmail, email);
  } else {
    // Initialize user data if it's a new email
    initializeUserData(email);
  }
};

/**
 * Transfer user data from old email to new email
 */
export const transferUserData = (oldEmail: string, newEmail: string): void => {
  // Import transfer functions dynamically to avoid circular dependencies
  const { transferUserPlanData } = require('../plan/userPlanService');
  const { transferUserAgentData } = require('../agent/agentStorageService');
  
  // Transfer plan and agent data
  transferUserPlanData(oldEmail, newEmail);
  transferUserAgentData(oldEmail, newEmail);
};

// Export functions to be used by other modules, but implement them elsewhere
// to avoid circular dependencies
export const transferUserPlanData = (oldEmail: string, newEmail: string): void => {
  // This is just a placeholder - the actual implementation is in plan/userPlanService.ts
  // The function is dynamically imported when needed
};

export const transferUserAgentData = (oldEmail: string, newEmail: string): void => {
  // This is just a placeholder - the actual implementation is in agent/agentStorageService.ts
  // The function is dynamically imported when needed
};
