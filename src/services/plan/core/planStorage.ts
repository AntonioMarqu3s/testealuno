
import { UserPlan } from '../types/planTypes';
import { getStorageItem, setStorageItem } from '../../storage/localStorageService';

/**
 * Get user plan information from storage
 */
export const getUserPlanFromStorage = (email: string): UserPlan | null => {
  const planData = getStorageItem<Record<string, UserPlan>>('user_plans', {});
  return planData[email] || null;
};

/**
 * Save user plan information to storage
 */
export const saveUserPlanToStorage = (email: string, plan: UserPlan): void => {
  const planData = getStorageItem<Record<string, UserPlan>>('user_plans', {});
  planData[email] = plan;
  setStorageItem('user_plans', planData);
};
