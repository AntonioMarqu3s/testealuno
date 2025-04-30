
/**
 * Generate instance ID (email + agent name)
 */
export const generateInstanceId = (email: string, agentName: string): string => {
  if (!email || !agentName) return "";
  return `${email}-${agentName}`.replace(/\s+/g, '-').toLowerCase();
};
