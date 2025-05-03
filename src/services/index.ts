
// Export from existing modules
export * from './agent';
export * from './plan';
export * from './user';

// Re-export specific functions to maintain backward compatibility
export { generateAgentInstanceId, generateUniqueInstanceId } from './agent/agentInstanceService';
export { getUserAgents, saveAgent, deleteUserAgent, updateUserAgent } from './agent/agentStorageService';
export { canCreateAgent, incrementAgentCount } from './plan/planLimitService';
export { getCurrentUserEmail } from './user/userService';

// Export plan connection service
export { updatePlanConnectionStatus, getPlanConnectionStatus } from './plan/planConnectionService';

// Re-export local storage functions for backward compatibility
export { getStorageItem, setStorageItem } from './storage/localStorageService';
