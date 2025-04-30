
// Re-export from user modules
export { 
  getCurrentUserEmail, 
  setCurrentUserEmail, 
  getUserEmail, 
  validateEmail 
} from './user/userService';

// Re-export from plan modules
export { 
  getUserPlan, 
  initializeUserPlan, 
  upgradeToPremium, 
  downgradeToBasic 
} from './plan/userPlanService';

// Re-export from agent modules
export { 
  generateInstanceId 
} from './agent/agentInstanceService';

// Re-export from plan limitation modules
export { 
  canCreateAgent, 
  incrementAgentCount, 
  decrementAgentCount 
} from './plan/planLimitService';

// Note: transferUserPlanData and transferUserAgentData are already exported from their respective modules
// so we don't need to re-export them here to avoid duplication
