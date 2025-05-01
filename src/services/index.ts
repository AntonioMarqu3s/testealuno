
// Re-export everything from userPlanService for easier imports
export * from './plan/userPlanService';

// Export plan limitation services
export * from './plan/planLimitService';

// Export specific agent services
export * from './agent';

// Export storage services
export * from './storage/localStorageService';

// Export analytics services
export * from './analytics/agentPerformanceService';

// Export checkout services
export * from './checkout';

// Export user services
export * from './user';

// Fix the conflict between the two transferUserAgentData functions
// Only export the one from agentStorageService
export { transferUserAgentData } from './agent/agentStorageService';

// Fix the conflict between the two generateInstanceId functions
export { generateInstanceId as generateAgentInstanceId } from './agent/agentInstanceService';
export { generateInstanceId as generateUserInstanceId } from './user/userService';

// We'll use the agent implementation as our default generateInstanceId
export { generateInstanceId } from './agent/agentInstanceService';
