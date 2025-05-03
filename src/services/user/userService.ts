
import { getStorageItem, setStorageItem } from '../storage/localStorageService';
import { transferUserPlanData } from '../plan/userPlanService';
import { transferUserAgentData } from '../agent/agentStorageService';

const USER_EMAIL_KEY = 'user_email';

// Default email value
const DEFAULT_EMAIL = 'usuario@exemplo.com';

/**
 * Get the current user's email - Synchronous version
 */
export const getCurrentUserEmail = (): string => {
  return getStorageItem<string>(USER_EMAIL_KEY, DEFAULT_EMAIL);
};

/**
 * Generate a unique instance ID for the user
 */
export const generateInstanceId = (userEmail: string, name: string): string => {
  return `${userEmail}-${name}`.replace(/\s+/g, '-').toLowerCase();
};

/**
 * Update the current user's email and synchronize user data
 */
export const updateCurrentUserEmail = (newEmail: string): void => {
  const oldEmail = getCurrentUserEmail();
  
  // Only proceed if email is actually changing
  if (oldEmail !== newEmail && newEmail) {
    console.log(`Updating user email from ${oldEmail} to ${newEmail}`);
    
    // Transfer user data to new email
    // Use imported function instead of require
    transferUserAgentData(oldEmail, newEmail);
    transferUserPlanData(oldEmail, newEmail);
    
    // Save new email
    setStorageItem(USER_EMAIL_KEY, newEmail);
  }
};

/**
 * Initialize the user email if not set
 */
export const initializeUserEmail = (): string => {
  const currentEmail = getCurrentUserEmail();
  
  if (!currentEmail) {
    setStorageItem(USER_EMAIL_KEY, DEFAULT_EMAIL);
    return DEFAULT_EMAIL;
  }
  
  return currentEmail;
};
