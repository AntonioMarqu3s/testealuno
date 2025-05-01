
/**
 * Generate agent instance ID (email + agent name)
 */
export const generateAgentInstanceId = (email: string, agentName: string): string => {
  if (!email || !agentName) return "";
  return `${email}-${agentName}`.replace(/\s+/g, '-').toLowerCase();
};

/**
 * Generate application-wide unique instance ID 
 * that includes timestamp to ensure uniqueness
 */
export const generateUniqueInstanceId = (email: string, agentName: string): string => {
  if (!email || !agentName) return "";
  const timestamp = Date.now();
  const baseId = `${email}-${agentName}`.replace(/\s+/g, '-').toLowerCase();
  return `${baseId}-${timestamp}`;
};
