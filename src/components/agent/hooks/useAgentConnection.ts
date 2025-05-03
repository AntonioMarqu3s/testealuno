
import { useState } from "react";
import { toast } from "sonner";
import { checkInstanceStatus, disconnectInstance } from "./api/agentConnectionApi";

export const useAgentConnection = () => {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  /**
   * Disconnect an agent instance
   */
  const handleDisconnect = async (instanceId: string, agentId: string): Promise<boolean> => {
    if (!instanceId) {
      console.error("Cannot disconnect: No instance ID provided");
      return false;
    }
    
    setIsDisconnecting(true);
    
    try {
      console.log(`Attempting to disconnect instance: ${instanceId}`);
      
      const success = await disconnectInstance(instanceId);
      if (success) {
        console.log(`Successfully disconnected instance: ${instanceId}`);
        toast.success("Agente desconectado com sucesso");
        return true;
      } else {
        console.error(`Failed to disconnect instance: ${instanceId}`);
        toast.error("Não foi possível desconectar o agente");
        return false;
      }
    } catch (error) {
      console.error(`Error disconnecting instance ${instanceId}:`, error);
      toast.error("Erro ao desconectar o agente. O status será atualizado como desconectado de qualquer forma.");
      // Even if API fails, we'll update the UI to show disconnected
      return true;
    } finally {
      setIsDisconnecting(false);
    }
  };
  
  /**
   * Check the status of an agent instance connection
   */
  const checkConnectionStatus = async (instanceId: string, agentId: string): Promise<boolean> => {
    if (!instanceId) {
      console.error("Cannot check status: No instance ID provided");
      return false;
    }
    
    setIsCheckingStatus(true);
    
    try {
      console.log(`Checking status for instance: ${instanceId}`);
      const isConnected = await checkInstanceStatus(instanceId);
      console.log(`Instance ${instanceId} status: ${isConnected ? 'connected' : 'disconnected'}`);
      return isConnected;
    } catch (error) {
      console.error(`Error checking instance ${instanceId} status:`, error);
      // Se houver erro ao verificar o status, assumimos que está desconectado
      // mas não mostramos mensagem para não assustar o usuário
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
