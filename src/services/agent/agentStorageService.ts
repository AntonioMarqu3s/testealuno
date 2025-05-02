
import { getUserAgents, initializeUserAgents, saveAgent } from './agentStorageOperations';
import { deleteUserAgent, updateUserAgent, transferUserAgentData } from './agentManagementService';
import { deleteWhatsAppInstance } from './webhookService';
import { deleteAgentFromSupabase, updateAgentConnectionStatus, getAgentConnectionStatus } from './supabaseAgentService';

// Re-export all functions to maintain backward compatibility
export {
  getUserAgents,
  initializeUserAgents,
  saveAgent,
  deleteUserAgent,
  updateUserAgent,
  transferUserAgentData,
  deleteWhatsAppInstance,
  deleteAgentFromSupabase,
  updateAgentConnectionStatus,
  getAgentConnectionStatus
};
