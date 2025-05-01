
// Re-export everything from userPlanService for easier imports
export * from './userPlanService';

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

// To avoid ambiguity, explicitly export functions with unique names
export { transferUserAgentData as transferAgentData } from './agent/agentStorageService';
export { transferUserAgentData as transferUserAgents } from './user/userService';

// Fix the conflict between the two generateInstanceId functions
export { generateInstanceId as generateAgentInstanceId } from './agent/agentInstanceService';
export { generateInstanceId as generateUserInstanceId } from './user/userService';

// We'll use the agent implementation as our default generateInstanceId
export { generateInstanceId } from './agent/agentInstanceService';
