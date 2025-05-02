
import { useState } from 'react';
import { disconnectInstance } from './api/agentConnectionApi';
import { checkConnectionStatus } from './api/qrcode/checkConnectionStatus';

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
      console.log("Attempting to disconnect instance:", instanceId);
      const success = await disconnectInstance(instanceId);
      if (success) {
        console.log("Instance disconnected successfully");
      } else {
        console.warn("Failed to disconnect instance");
      }
      return success;
    } catch (error) {
      console.error("Error during disconnect:", error);
      return false;
    } finally {
      setIsDisconnecting(false);
    }
  };
  
  /**
   * Check connection status of an agent instance
   * Only makes a single verification call to the Evolution API
   */
  const checkConnectionStatus = async (instanceId?: string): Promise<boolean> => {
    if (!instanceId) return false;
    
    setIsCheckingStatus(true);
    try {
      // Make a direct call to the checkConnectionStatus function
      return await checkConnectionStatus(instanceId);
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
