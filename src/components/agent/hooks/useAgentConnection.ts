
import { useState } from 'react';
import { disconnectInstance, checkInstanceStatus } from './api/agentConnectionApi';
import { updateAgentConnectionStatus, getAgentConnectionStatus } from '@/services/agent/supabaseAgentService';

/**
 * Hook to manage agent connection operations
 */
export const useAgentConnection = () => {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  
  /**
   * Disconnect an agent instance
   */
  const handleDisconnect = async (instanceId?: string, agentId?: string) => {
    if (!instanceId) return false;
    
    setIsDisconnecting(true);
    try {
      const success = await disconnectInstance(instanceId);
      
      // If agentId is provided, update connection status in Supabase
      if (success && agentId) {
        await updateAgentConnectionStatus(agentId, false);
      }
      
      return success;
    } finally {
      setIsDisconnecting(false);
    }
  };
  
  /**
   * Check connection status of an agent instance
   */
  const checkConnectionStatus = async (instanceId?: string, agentId?: string): Promise<boolean> => {
    if (!instanceId) return false;
    
    setIsCheckingStatus(true);
    try {
      // First check in Supabase if we have the agent ID
      if (agentId) {
        const dbStatus = await getAgentConnectionStatus(agentId);
        if (dbStatus) {
          return true;
        }
      }
      
      // If not found in DB or not connected, check the instance status from API
      const result = await checkInstanceStatus(instanceId);
      
      // If agent is connected and we have the agent ID, update in Supabase
      if (result.connected && agentId) {
        await updateAgentConnectionStatus(agentId, true);
      }
      
      // Return the connected status from the response object
      return result.connected;
    } catch (error) {
      console.error("Error checking connection status:", error);
      return false;
    } finally {
      setIsCheckingStatus(false);
    }
  };

  return {
    isDisconnecting,
    isCheckingStatus,
    handleDisconnect,
    checkConnectionStatus
  };
};
