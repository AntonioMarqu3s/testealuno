
import { getStorageItem, setStorageItem } from '../storage/localStorageService';
import { transferUserPlanData } from '../plan/userPlanService';
import { transferUserAgentData } from '../agent/agentStorageService';

const USER_EMAIL_KEY = 'user_email';

// Default email value - no longer used for new users, but kept for backwards compatibility
const DEFAULT_EMAIL = ''; // Changed from 'usuario@exemplo.com' to empty string

/**
 * Get the current user's email
 */
export const getCurrentUserEmail = (): string => {
  // Get email from storage or empty string if not found
  const email = getStorageItem<string>(USER_EMAIL_KEY, '');
  
  // If we have no email in localStorage but we have a Supabase session,
  // try to get the email from the session
  if (!email) {
    try {
      // Try to get email from Supabase session
      const session = supabase?.auth?.session?.();
      if (session?.user?.email) {
        return session.user.email;
      }
    } catch (e) {
      console.log('No active Supabase session found');
    }
  }
  
  return email;
};

/**
 * Generate a unique instance ID for the user
 */
export const generateInstanceId = (userEmail: string, name: string): string => {
  if (!userEmail || !name) {
    console.error('Cannot generate instance ID: missing email or name');
    return `unknown-${Date.now()}`;
  }
  return `${userEmail}-${name}`.replace(/\s+/g, '-').toLowerCase();
};

/**
 * Update the current user's email and synchronize user data
 */
export const updateCurrentUserEmail = (newEmail: string): void => {
  if (!newEmail) {
    console.error('Attempted to update user email with empty value');
    return;
  }
  
  const oldEmail = getCurrentUserEmail();
  
  // Only proceed if email is actually changing
  if (oldEmail !== newEmail && newEmail) {
    console.log(`Updating user email from ${oldEmail || 'empty'} to ${newEmail}`);
    
    // Transfer user data to new email
    if (oldEmail) {
      transferUserAgentData(oldEmail, newEmail);
      transferUserPlanData(oldEmail, newEmail);
    }
    
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
    const newEmail = ''; // Don't set a default email, wait for auth
    setStorageItem(USER_EMAIL_KEY, newEmail);
    return newEmail;
  }
  
  return currentEmail;
};

// Import at the top to avoid reference errors
import { supabase } from '@/lib/supabase';
