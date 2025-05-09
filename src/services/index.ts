// Export from existing modules
export * from './agent';
export * from './plan';
export * from './user';

// Re-export specific functions to maintain backward compatibility
export { generateAgentInstanceId, generateUniqueInstanceId } from './agent/agentInstanceService';
export { getUserAgents, saveAgent, deleteUserAgent, updateUserAgent } from './agent/agentStorageService';
export { canCreateAgent, incrementAgentCount } from './plan/planLimitService';
export { getCurrentUserEmail } from './user/userService';
export { getCurrentUserEmailFromSupabase, forceSyncUserPlanWithSupabase } from './auth/supabaseAuth';

// Export plan connection service - already exported via './plan' above
// export { updatePlanConnectionStatus, getPlanConnectionStatus } from './plan/planConnectionService';

// Re-export local storage functions for backward compatibility
export { getStorageItem, setStorageItem } from './storage/localStorageService';

/**
 * Get the current user ID from localStorage or another source
 * @returns The current user's ID or null
 */
export const getCurrentUserId = (): string | null => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id || null;
  } catch (e) {
    console.error('Error getting current user ID:', e);
    return null;
  }
};
