
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
    setIsDisconnecting(true);
    const success = await disconnectInstance(instanceId);
    setIsDisconnecting(false);
    return success;
  };
  
  /**
   * Check connection status of an agent instance
   */
  const checkConnectionStatus = async (instanceId?: string) => {
    setIsCheckingStatus(true);
    const isConnected = await checkInstanceStatus(instanceId);
    setIsCheckingStatus(false);
    return isConnected;
  };

  return {
    isDisconnecting,
    isCheckingStatus,
    handleDisconnect,
    checkConnectionStatus
  };
};
