
import { useState } from 'react';
import { disconnectInstance, checkInstanceStatus } from './api/agentConnectionApi';

/**
 * Hook to manage agent connection operations
 */
export const useAgentConnection = () => {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  
  /**
   * Disconnect an agent instance
   */
  const handleDisconnect = async (instanceId?: string) => {
    if (!instanceId) return false;
    
    setIsDisconnecting(true);
    try {
      const success = await disconnectInstance(instanceId);
      return success;
    } finally {
      setIsDisconnecting(false);
    }
  };
  
  /**
   * Check connection status of an agent instance
   */
  const checkConnectionStatus = async (instanceId?: string): Promise<boolean> => {
    if (!instanceId) return false;
    
    setIsCheckingStatus(true);
    try {
      const result = await checkInstanceStatus(instanceId);
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
