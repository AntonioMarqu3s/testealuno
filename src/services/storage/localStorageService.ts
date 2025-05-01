
// Storage keys constants
export const STORAGE_KEY = 'user_plans';
export const USER_EMAIL_KEY = 'current_user_email';
export const ALL_AGENTS_KEY = 'all_agents';

/**
 * Generic localStorage getter with JSON parsing
 */
export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return defaultValue;
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`Error parsing localStorage data for key ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Generic localStorage setter with JSON stringification
 */
export const setStorageItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error storing data in localStorage for key ${key}:`, error);
  }
};
